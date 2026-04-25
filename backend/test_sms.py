# Download the helper library from https://www.twilio.com/docs/python/install

import os
from pathlib import Path
from dotenv import load_dotenv
from twilio.rest import Client

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Find your Account SID and Auth Token at twilio.com/console
# and set the environment variables. See http://twil.io/secure

account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
phone_number = os.environ.get("TWILIO_PHONE_NUMBER")
auth_token = os.environ.get("TWILIO_AUTH_TOKEN")

if not account_sid or not auth_token or not phone_number:
    print(f"Missing credentials:")
    print(f"  TWILIO_ACCOUNT_SID: {account_sid or 'NOT SET'}")
    print(f"  TWILIO_AUTH_TOKEN: {'SET' if auth_token else 'NOT SET'}")
    print(f"  TWILIO_PHONE_NUMBER: {phone_number or 'NOT SET'}")
    exit(1)

print(f"Using credentials:")
print(f"  Account SID: {account_sid}")
print(f"  Auth Token: {auth_token[:8]}...{auth_token[-4:]}")
print(f"  Phone: {phone_number}")

# Verify credentials first
try:
    client = Client(account_sid, auth_token)
    # Test authentication by fetching account details
    account = client.api.accounts(account_sid).fetch()
    print(f"\n✅ Authentication successful!")
    print(f"Account Status: {account.status}")
    print(f"Account Name: {account.friendly_name}")
except Exception as e:
    print(f"\n❌ Authentication failed: {e}")
    print("\nPlease verify your Twilio credentials at https://console.twilio.com")
    exit(1)

# Format phone number correctly
from_number = phone_number if phone_number.startswith('+') else f"+1{phone_number}"
print(f"\nSending SMS from {from_number} to +...")

try:
    message = client.messages.create(
        body="Join Earth's mightiest heroes. Like Kevin Bacon.",
        from_=from_number,
        to="+",
    )
except Exception as e:
    print(f"\n❌ Failed to send message: {e}")
    exit(1)

print(f"\n✅ Message sent successfully!")
print(f"Message SID: {message.sid}")
print(f"Status: {message.status}")
print(f"From: {message.from_}")
print(f"To: {message.to}")
print(f"Body: {message.body}")

# Fetch the message again to get updated status
import time
time.sleep(2)
updated_message = client.messages(message.sid).fetch()
print(f"\nUpdated Status: {updated_message.status}")
print(f"Error Code: {updated_message.error_code if updated_message.error_code else 'None'}")
print(f"Error Message: {updated_message.error_message if updated_message.error_message else 'None'}")
