import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from html import escape as _html_escape
from typing import Optional

from backend.aws_secrets import load_aws_secrets


DEFAULT_SMTP_HOST = "smtp.gmail.com"
DEFAULT_SMTP_PORT = 587
DEFAULT_SENDER = "noreply.foodmaps@gmail.com"


def _env_flag(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    return raw.strip().lower() not in {"0", "false", "no", "off"}


def _smtp_config() -> tuple[str, int, bool, bool]:
    """Resolve the relay to use.

    Defaults reproduce the previous hardcoded Gmail behaviour exactly, so
    production needs no new configuration. The overrides exist so staging can
    point at a local capture relay: a staging environment restored from a
    production snapshot still holds deliverable addresses, and relaying its
    password-reset mail through the real Gmail account would put working reset
    codes in real users' inboxes.
    """
    host = os.getenv("SMTP_HOST", DEFAULT_SMTP_HOST)
    try:
        port = int(os.getenv("SMTP_PORT", str(DEFAULT_SMTP_PORT)))
    except ValueError:
        raise RuntimeError("SMTP_PORT must be an integer")
    return host, port, _env_flag("SMTP_STARTTLS", True), _env_flag("SMTP_AUTH", True)


def _get_email_settings() -> tuple[str, Optional[str]]:
    """Resolve credentials from the existing EMAIL_* configuration."""
    load_aws_secrets()
    sender_email = os.getenv("EMAIL_USERNAME", DEFAULT_SENDER)
    sender_password = os.getenv("EMAIL_PASSWORD")
    _, _, _, use_auth = _smtp_config()
    if use_auth and not sender_password:
        raise RuntimeError("EMAIL_PASSWORD is not configured")
    return sender_email, sender_password


def _send_email(to_email: str, subject: str, text_content: str, html_content: Optional[str] = None) -> None:
    sender_email, sender_password = _get_email_settings()
    host, port, use_starttls, use_auth = _smtp_config()

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = to_email
    message.attach(MIMEText(text_content, "plain"))
    if html_content:
        message.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP(host, port) as server:
        if use_starttls:
            server.starttls()
        if use_auth:
            server.login(sender_email, sender_password)
        server.send_message(message)


def send_reset_email(to_email: str, reset_code: str, user_name: str) -> None:
    """Send a password reset code email."""
    # user_name is user-supplied and lands in an HTML body; escape it so a
    # display name like '<script>...</script>' or '<img onerror=...>'
    # can't render as live markup in mail clients that honour HTML.
    safe_name = _html_escape(user_name or "there")
    html_content = f"""
    <html>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5a27;">Password Reset Request</h2>
          <p>Hi {safe_name},</p>
          <p>You requested a password reset for your Food Maps account.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3 style="color: #2d5a27; margin: 0;">Your verification code is:</h3>
            <h1 style="color: #2d5a27; font-size: 32px; letter-spacing: 4px; margin: 10px 0;">{reset_code}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Food Maps - Connecting communities through food sharing</p>
        </div>
      </body>
    </html>
    """

    text_content = f"""Password Reset Request

Hi {user_name},

You requested a password reset for your Food Maps account.

Your verification code is: {reset_code}

This code will expire in 15 minutes.

If you did not request this password reset, please ignore this email.

Food Maps - Connecting communities through food sharing
"""

    _send_email(
        to_email=to_email,
        subject="Password Reset - Food Maps",
        text_content=text_content,
        html_content=html_content,
    )


def send_verification_email(to_email: str, user_name: str, verification_link: str) -> None:
    """Send an email verification link."""
    # Escape the user-supplied display name for the HTML body. The link
    # itself is built server-side so it doesn't need escaping, but we
    # still pass it through escape() defensively in the href in case the
    # token format ever changes.
    safe_name = _html_escape(user_name or "there")
    safe_link = _html_escape(verification_link, quote=True)
    text_content = f"""Hello {user_name},

Thank you for joining Food Maps! Please verify your email address by visiting the link below:

{verification_link}

This link will expire in 24 hours.

If you did not create an account with Food Maps, please ignore this email.

Best regards,
The Food Maps Team
"""

    html_content = f"""
    <html>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5a27;">Verify Your Email Address</h2>
          <p>Hello {safe_name},</p>
          <p>Thank you for joining Food Maps! Please verify your email address by clicking the link below:</p>
          <p><a href="{safe_link}">{safe_link}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not create an account with Food Maps, please ignore this email.</p>
          <p>Best regards,<br>The Food Maps Team</p>
        </div>
      </body>
    </html>
    """

    _send_email(
        to_email=to_email,
        subject="Verify Your Email - Food Maps",
        text_content=text_content,
        html_content=html_content,
    )