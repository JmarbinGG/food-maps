import os
from twilio.rest import Client
from sqlalchemy.orm import Session
from backend.models import User
import json

from backend.aws_secrets import load_aws_secrets

def check_sms_consent(db: Session, user_id: int, notification_type: str = None) -> bool:
    """
    Check if user has consented to receive SMS and if notification type is enabled
    
    Args:
        db: Database session
        user_id: User ID to check
        notification_type: Type of notification (e.g., 'new_listings', 'pickup_reminders', 'spoilage_alerts')
    
    Returns:
        True if user has consented and notification type is enabled, False otherwise
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            print(f"⚠️  User {user_id} not found")
            return False
        
        # Check if user has given SMS consent
        if not user.sms_consent_given:
            print(f"⚠️  User {user_id} has not consented to SMS")
            return False
        
        # Check if user has opted out
        if user.sms_opt_out_date:
            print(f"⚠️  User {user_id} has opted out of SMS")
            return False
        
        # If notification type specified, check if it's in user's preferences
        if notification_type:
            notification_types = []
            if user.sms_notification_types:
                if isinstance(user.sms_notification_types, str):
                    notification_types = json.loads(user.sms_notification_types)
                else:
                    notification_types = user.sms_notification_types
            
            # Special case: 'urgent_only' mode should only allow critical notifications
            if 'urgent_only' in notification_types:
                urgent_types = ['spoilage_alerts', 'pickup_reminders', 'claimed_ready']
                if notification_type not in urgent_types:
                    print(f"⚠️  User {user_id} is in urgent-only mode, skipping {notification_type}")
                    return False
            
            # Check if specific notification type is enabled
            if notification_type not in notification_types and 'urgent_only' not in notification_types:
                print(f"⚠️  User {user_id} has not enabled {notification_type} notifications")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error checking SMS consent for user {user_id}: {e}")
        return False


def send_sms_real(phone: str, message: str) -> bool:
    """
    Send SMS using Twilio API
    """
    try:
        load_aws_secrets()
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


def send_sms_with_consent(db: Session, user_id: int, message: str, notification_type: str = None) -> bool:
    """
    Send SMS to user after checking consent
    
    Args:
        db: Database session
        user_id: User ID to send SMS to
        message: SMS message text
        notification_type: Type of notification (e.g., 'new_listings', 'pickup_reminders')
    
    Returns:
        True if SMS sent successfully, False otherwise
    """
    try:
        # Check consent first
        if not check_sms_consent(db, user_id, notification_type):
            return False
        
        # Get user phone number
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.phone:
            print(f"⚠️  User {user_id} has no phone number")
            return False
        
        # Send SMS
        return send_sms_real(user.phone, message)
        
    except Exception as e:
        print(f"❌ Error sending SMS to user {user_id}: {e}")
        return False
