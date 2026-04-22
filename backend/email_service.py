import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional


SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
DEFAULT_SENDER = "noreply.foodmaps@gmail.com"


def _get_email_settings() -> tuple[str, str]:
    """Resolve credentials from the existing EMAIL_* configuration."""
    sender_email = os.getenv("EMAIL_USERNAME", DEFAULT_SENDER)
    sender_password = os.getenv("EMAIL_PASSWORD")
    if not sender_password:
        raise RuntimeError("EMAIL_PASSWORD is not configured")
    return sender_email, sender_password


def _send_email(to_email: str, subject: str, text_content: str, html_content: Optional[str] = None) -> None:
    sender_email, sender_password = _get_email_settings()

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = to_email
    message.attach(MIMEText(text_content, "plain"))
    if html_content:
        message.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(message)


def send_reset_email(to_email: str, reset_code: str, user_name: str) -> None:
    """Send a password reset code email."""
    html_content = f"""
    <html>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5a27;">Password Reset Request</h2>
          <p>Hi {user_name},</p>
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
          <p>Hello {user_name},</p>
          <p>Thank you for joining Food Maps! Please verify your email address by clicking the link below:</p>
          <p><a href="{verification_link}">{verification_link}</a></p>
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