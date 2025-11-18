import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_reset_email(to_email: str, reset_code: str, user_name: str) -> bool:
    """
    Send password reset email using Gmail SMTP
    """
    try:
        # Email configuration - use environment variables
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = os.getenv("SMTP_EMAIL", "your-email@gmail.com")
        sender_password = os.getenv("SMTP_PASSWORD", "your-app-password")
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Password Reset - Food Maps"
        message["From"] = sender_email
        message["To"] = to_email
        
        # Email content
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
              <p>If you didn't request this password reset, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">Food Maps - Connecting communities through food sharing</p>
            </div>
          </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request
        
        Hi {user_name},
        
        You requested a password reset for your Food Maps account.
        
        Your verification code is: {reset_code}
        
        This code will expire in 15 minutes.
        
        If you didn't request this password reset, please ignore this email.
        
        Food Maps - Connecting communities through food sharing
        """
        
        # Create MIMEText objects
        text_part = MIMEText(text_content, "plain")
        html_part = MIMEText(html_content, "html")
        
        # Add parts to message
        message.attach(text_part)
        message.attach(html_part)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(message)
        
        print(f"✅ Password reset email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {str(e)}")
        return False