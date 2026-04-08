from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(enum.Enum):
    DONOR = "donor"
    RECIPIENT = "recipient" 
    VOLUNTEER = "volunteer"
    DRIVER = "driver"
    DISPATCHER = "dispatcher"
    ADMIN = "admin"

class FoodCategory(enum.Enum):
    PRODUCE = "produce"
    PREPARED = "prepared"
    PACKAGED = "packaged"
    BAKERY = "bakery"
    WATER = "water"
    FRUIT = "fruit"
    LEFTOVERS = "leftovers"

class PerishabilityLevel(enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class VerificationStatus(enum.Enum):
    PENDING = "pending"
    BEFORE_VERIFIED = "before_verified"
    COMPLETED = "completed"
    NOT_REQUIRED = "not_required"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True)
    name = Column(String(255))
    password_hash = Column(String(255))
    role = Column(SQLEnum(UserRole))
    phone = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    coords_lat = Column(Float, nullable=True)
    coords_lng = Column(Float, nullable=True)
    vehicle_capacity_kg = Column(Float, nullable=True)
    has_refrigeration = Column(Boolean, default=False)
    referral_code = Column(String(20), unique=True, nullable=True, index=True)
    referred_by_code = Column(String(20), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    # reset_token = Column(String(10), nullable=True)  # Commented out - not in MySQL DB
    # reset_token_expiry = Column(DateTime, nullable=True)  # Commented out - not in MySQL DB
    
    # Dietary needs and preferences (primarily for recipients)
    dietary_restrictions = Column(Text, nullable=True)  # JSON array: ['vegetarian', 'gluten-free', etc.]
    allergies = Column(Text, nullable=True)  # JSON array: ['peanuts', 'shellfish', 'dairy', etc.]
    household_size = Column(Integer, default=1)
    preferred_categories = Column(Text, nullable=True)  # JSON array: ['produce', 'prepared', etc.]
    special_needs = Column(Text, nullable=True)  # Additional dietary notes/requirements
    
    # Safety and Trust fields
    trust_score = Column(Integer, default=50)  # 0-100 score
    email_verified = Column(Boolean, default=False)
    phone_verified = Column(Boolean, default=False)
    id_verified = Column(Boolean, default=False)
    address_verified = Column(Boolean, default=False)
    completed_exchanges = Column(Integer, default=0)
    positive_feedback = Column(Integer, default=0)
    negative_feedback = Column(Integer, default=0)
    verified_pickups = Column(Integer, default=0)
    
    # Community Trust Signals
    verified_by_aglf = Column(Boolean, default=False)  # Verified by All Good Living Foundation
    school_partner = Column(Boolean, default=False)  # Official school partner
    partner_badge = Column(String(100), nullable=True)  # 'aglf', 'school', 'community', 'verified_donor'
    partner_since = Column(DateTime, nullable=True)  # When they became a partner
    last_active = Column(DateTime, default=datetime.utcnow)  # Last activity timestamp
    
    # Smart Notification Settings and AI Learning
    notification_preferences = Column(Text, nullable=True)  # JSON object with preferences
    notification_behavior = Column(Text, nullable=True)  # JSON object with learned behavior data
    
    # SMS Consent (Twilio Compliance)
    sms_consent_given = Column(Boolean, default=False)  # Explicit user consent for SMS
    sms_consent_date = Column(DateTime, nullable=True)  # When consent was given
    sms_notification_types = Column(Text, nullable=True)  # JSON array of notification types user wants
    sms_opt_out_date = Column(DateTime, nullable=True)  # When user opted out, if ever
    sms_consent_ip = Column(String(50), nullable=True)  # IP address when consent given (legal compliance)
    
    # Relationships
    donations = relationship("FoodResource", foreign_keys="FoodResource.donor_id", back_populates="donor")
    requests = relationship("FoodRequest", back_populates="recipient")
    consumption_logs = relationship("ConsumptionLog", back_populates="user")

class FoodResource(Base):
    __tablename__ = "food_resources"
    
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id"))
    # Who claimed the listing (nullable for available/unclaimed)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255))
    description = Column(Text, nullable=True)
    category = Column(SQLEnum(FoodCategory))
    qty = Column(Float)
    unit = Column(String(255))
    est_weight_kg = Column(Float, nullable=True)
    perishability = Column(SQLEnum(PerishabilityLevel))
    expiration_date = Column(DateTime, nullable=True)
    date_label_type = Column(String(50), nullable=True)  # 'sell-by', 'use-by', 'best-by', 'expires-on'
    pickup_window_start = Column(DateTime, nullable=True)
    pickup_window_end = Column(DateTime, nullable=True)
    address = Column(String(255))
    coords_lat = Column(Float, nullable=True)
    coords_lng = Column(Float, nullable=True)
    status = Column(String(255), default="available")
    claimed_at = Column(DateTime, nullable=True)
    images = Column(Text, nullable=True)  # JSON array of image URLs
    urgency_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Pickup Verification
    verification_status = Column(String(50), default='not_required', nullable=True)
    before_photo = Column(Text, nullable=True)  # Base64 or URL to photo before pickup
    after_photo = Column(Text, nullable=True)  # Base64 or URL to photo after pickup
    before_verified_at = Column(DateTime, nullable=True)
    after_verified_at = Column(DateTime, nullable=True)
    pickup_notes = Column(Text, nullable=True)  # Notes from recipient about pickup
    
    # Food Safety Checklist
    storage_temperature = Column(Float, nullable=True)  # Temperature in Fahrenheit
    is_refrigerated = Column(Boolean, default=False)  # Stored in refrigerator
    is_frozen = Column(Boolean, default=False)  # Stored in freezer
    packaging_condition = Column(String(50), default='good')  # excellent, good, fair, poor
    safety_checklist_passed = Column(Boolean, default=False)  # Overall safety check status
    safety_score = Column(Integer, default=0)  # 0-100 safety score
    safety_notes = Column(Text, nullable=True)  # Additional safety observations
    safety_last_checked = Column(DateTime, nullable=True)  # When safety check was performed
    
    # Allergen and Dietary Information
    allergens = Column(Text, nullable=True)  # JSON array: ['nuts', 'dairy', 'gluten', 'shellfish', 'soy', 'eggs', 'fish', 'sesame']
    contamination_warning = Column(String(100), nullable=True)  # 'shared-kitchen', 'shared-equipment', 'may-contain', 'home-kitchen'
    dietary_tags = Column(Text, nullable=True)  # JSON array: ['vegetarian', 'vegan', 'halal', 'kosher', 'gluten-free', 'dairy-free', 'nut-free']
    ingredients_list = Column(Text, nullable=True)  # Full ingredients list text
    
    # Relationships
    donor = relationship("User", foreign_keys=[donor_id], back_populates="donations")
    consumption_logs = relationship("ConsumptionLog", back_populates="food_resource")

class FoodRequest(Base):
    __tablename__ = "food_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"))
    category = Column(SQLEnum(FoodCategory), nullable=True)  # 'any' for flexible requests
    household_size = Column(Integer, default=1)
    special_needs = Column(Text, nullable=True)  # JSON array
    dietary_restrictions = Column(Text, nullable=True)
    latest_by = Column(DateTime, nullable=True)
    address = Column(String(255))
    coords_lat = Column(Float, nullable=True)
    coords_lng = Column(Float, nullable=True)
    status = Column(String(255), default="open")
    notes = Column(Text, nullable=True)
    urgency_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    recipient = relationship("User", back_populates="requests")

class ConsumptionLog(Base):
    __tablename__ = "consumption_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    food_resource_id = Column(Integer, ForeignKey("food_resources.id"), nullable=True)
    food_name = Column(String(255))
    category = Column(SQLEnum(FoodCategory))
    qty_consumed = Column(Float)
    unit = Column(String(255))
    consumption_date = Column(DateTime, default=datetime.utcnow)
    source_type = Column(String(255))  # 'donation', 'own_harvest', 'purchased', 'leftover'
    nutritional_value = Column(Text, nullable=True)  # JSON object
    waste_amount = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="consumption_logs")
    food_resource = relationship("FoodResource", back_populates="consumption_logs")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    conversation_id = Column(String(255), index=True)  # Group messages by conversation
    content = Column(Text)
    is_from_admin = Column(Boolean, default=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sender = relationship("User", foreign_keys=[sender_id])

class DistributionCenter(Base):
    __tablename__ = "distribution_centers"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255))
    description = Column(Text, nullable=True)
    address = Column(String(255))
    coords_lat = Column(Float)
    coords_lng = Column(Float)
    phone = Column(String(255), nullable=True)
    hours = Column(Text, nullable=True)  # JSON object with operating hours
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Community Trust Signals
    verified_by_aglf = Column(Boolean, default=False)  # Verified by All Good Living Foundation
    school_partner = Column(Boolean, default=False)  # Official school partner
    partner_badge = Column(String(100), nullable=True)  # 'aglf', 'school', 'community'
    partner_since = Column(DateTime, nullable=True)  # When they became a partner
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # Last update time
    
    # Relationships
    owner = relationship("User", foreign_keys=[owner_id])
    inventory = relationship("CenterInventory", back_populates="center")

class CenterInventory(Base):
    __tablename__ = "center_inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    center_id = Column(Integer, ForeignKey("distribution_centers.id"))
    name = Column(String(255))
    description = Column(Text, nullable=True)
    category = Column(SQLEnum(FoodCategory))
    quantity = Column(Float)
    unit = Column(String(255))
    perishability = Column(SQLEnum(PerishabilityLevel), nullable=True)
    expiration_date = Column(DateTime, nullable=True)
    images = Column(Text, nullable=True)  # JSON array
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    center = relationship("DistributionCenter", back_populates="inventory")

class FeedbackType(enum.Enum):

    BUG = "bug"
    FEATURE_REQUEST = "feature_request"
    GENERAL = "general"
    ERROR_REPORT = "error_report"
    IMPROVEMENT = "improvement"

class FeedbackStatus(enum.Enum):
    NEW = "new"
    REVIEWING = "reviewing"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Anonymous feedback allowed
    type = Column(SQLEnum(FeedbackType), default=FeedbackType.GENERAL)
    subject = Column(String(255))
    message = Column(Text)
    url = Column(String(512), nullable=True)  # Page where feedback was submitted
    user_agent = Column(String(512), nullable=True)  # Browser/device info
    screenshot = Column(Text, nullable=True)  # Base64 or URL to screenshot
    error_stack = Column(Text, nullable=True)  # JavaScript error stack trace
    status = Column(SQLEnum(FeedbackStatus), default=FeedbackStatus.NEW)
    admin_notes = Column(Text, nullable=True)
    email = Column(String(255), nullable=True)  # For anonymous users
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])

class FavoriteLocation(Base):
    __tablename__ = "favorite_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Location details
    name = Column(String(255))  # Custom name for the location
    address = Column(String(500))
    coords_lat = Column(Float)
    coords_lng = Column(Float)
    
    # Type of favorite (donor location, distribution center, or general spot)
    location_type = Column(String(50), default="general")  # 'donor', 'distribution_center', 'general'
    
    # Reference IDs (nullable - may be a general location without a donor/center)
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # If favoriting a specific donor
    center_id = Column(Integer, ForeignKey("distribution_centers.id"), nullable=True)  # If favoriting a center
    
    # User notes and tags
    notes = Column(Text, nullable=True)  # Personal notes about this location
    tags = Column(Text, nullable=True)  # JSON array: ['family-friendly', 'fresh-produce', 'open-late', etc.]
    
    # Visit tracking
    visit_count = Column(Integer, default=0)
    last_visited = Column(DateTime, nullable=True)
    
    # Notifications
    notify_new_listings = Column(Boolean, default=False)  # Get notified when this donor posts
    notification_radius_km = Column(Float, default=5.0)  # For general location favorites
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    donor = relationship("User", foreign_keys=[donor_id])
    center = relationship("DistributionCenter", foreign_keys=[center_id])

class RecurrenceFrequency(enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"

class DonationSchedule(Base):
    __tablename__ = "donation_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255))
    description = Column(Text, nullable=True)
    
    # Donation details
    category = Column(SQLEnum(FoodCategory))
    estimated_quantity = Column(Float)
    unit = Column(String(50))
    perishability = Column(SQLEnum(PerishabilityLevel), nullable=True)
    
    # Recurrence settings
    frequency = Column(SQLEnum(RecurrenceFrequency))
    day_of_week = Column(Integer, nullable=True)  # 0-6 for weekly (0=Monday)
    day_of_month = Column(Integer, nullable=True)  # 1-31 for monthly
    time_of_day = Column(String(10), nullable=True)  # HH:MM format
    custom_interval_days = Column(Integer, nullable=True)  # For custom frequency
    
    # Schedule management
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    next_donation_date = Column(DateTime)
    last_donation_date = Column(DateTime, nullable=True)
    
    # Settings
    is_active = Column(Boolean, default=True)
    send_reminders = Column(Boolean, default=True)
    reminder_hours_before = Column(Integer, default=24)  # Hours before to send reminder
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    reminders = relationship("DonationReminder", back_populates="schedule")

class ReminderStatus(enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    DISMISSED = "dismissed"
    COMPLETED = "completed"

class DonationReminder(Base):
    __tablename__ = "donation_reminders"
    
    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("donation_schedules.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Reminder details
    title = Column(String(255))
    message = Column(Text)
    scheduled_for = Column(DateTime)  # When to send the reminder
    donation_date = Column(DateTime)  # The actual donation date this reminds about
    
    # Status
    status = Column(SQLEnum(ReminderStatus), default=ReminderStatus.PENDING)
    sent_at = Column(DateTime, nullable=True)
    dismissed_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Notification channels
    sent_via_email = Column(Boolean, default=False)
    sent_via_sms = Column(Boolean, default=False)
    sent_via_app = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    schedule = relationship("DonationSchedule", back_populates="reminders")

class ReportType(enum.Enum):
    UNSAFE_FOOD = "unsafe_food"
    NO_SHOW = "no_show"
    HARASSMENT = "harassment"
    FRAUD = "fraud"
    INAPPROPRIATE = "inappropriate"
    SAFETY_CONCERN = "safety_concern"
    OTHER = "other"

class ReportStatus(enum.Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class PickupReminderStatus(enum.Enum):
    SCHEDULED = "scheduled"
    SENT = "sent"
    SNOOZED = "snoozed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class SafetyReport(Base):
    __tablename__ = "safety_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"))
    reported_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    listing_id = Column(Integer, ForeignKey("food_resources.id"), nullable=True)
    
    # Report details
    report_type = Column(SQLEnum(ReportType))
    description = Column(Text)
    evidence = Column(Text, nullable=True)
    
    # Status tracking
    status = Column(SQLEnum(ReportStatus), default=ReportStatus.PENDING)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id])
    reported_user = relationship("User", foreign_keys=[reported_user_id])
    listing = relationship("FoodResource", foreign_keys=[listing_id])

class PickupReminder(Base):
    __tablename__ = "pickup_reminders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    listing_id = Column(Integer, ForeignKey("food_resources.id"))
    
    # Reminder details
    scheduled_time = Column(DateTime)  # When to send the reminder
    reminder_sent_at = Column(DateTime, nullable=True)  # When reminder was actually sent
    status = Column(SQLEnum(PickupReminderStatus), default=PickupReminderStatus.SCHEDULED)
    
    # Notification channels
    sms_sent = Column(Boolean, default=False)
    email_sent = Column(Boolean, default=False)
    
    # Snooze tracking
    snooze_count = Column(Integer, default=0)
    snoozed_until = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    listing = relationship("FoodResource", foreign_keys=[listing_id])

class ReminderSettings(Base):
    __tablename__ = "reminder_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Settings
    enabled = Column(Boolean, default=True)
    advance_notice_hours = Column(Float, default=2.0)  # Hours before pickup
    sms_enabled = Column(Boolean, default=True)
    email_enabled = Column(Boolean, default=False)
    auto_reminder = Column(Boolean, default=True)  # Auto-schedule on claim
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
