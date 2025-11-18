import os
from twilio.rest import Client

def send_sms_real(phone: str, message: str) -> bool:
    """
    Send SMS using Twilio API
    """
    try:
        # Twilio credentials from environment variables
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
        
        if not all([account_sid, auth_token, twilio_phone]):
            print("⚠️  Twilio credentials not configured, using console fallback")
            return False
        
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # Format phone number (ensure it starts with +)
        if not phone.startswith('+'):
            phone = '+1' + phone.replace('-', '').replace('(', '').replace(')', '').replace(' ', '')
        
        # Send SMS
        message_obj = client.messages.create(
            body=message,
            from_=twilio_phone,
            to=phone
        )
        
        print(f"✅ SMS sent successfully to {phone} (SID: {message_obj.sid})")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send SMS to {phone}: {str(e)}")
        return False