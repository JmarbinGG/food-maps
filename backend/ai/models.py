"""
AI-specific SQLAlchemy models, added to the main MySQL database.

These replace the Supabase tables used by the original DoGoods AI backend:
  - ai_conversations   -> AIConversation
  - ai_reminders       -> AIReminder
  - ai_feedback        -> AIFeedback
"""
from __future__ import annotations

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime

from backend.models import Base  # reuse the same declarative Base


class AIConversation(Base):
    """Persistent log of user <-> assistant messages."""
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(16), nullable=False)  # 'user' | 'assistant' | 'system'
    message = Column(Text, nullable=False)
    meta = Column(Text, nullable=True)  # JSON string (language, tool calls, etc.)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", foreign_keys=[user_id])


class AIReminder(Base):
    """Reminders scheduled by the AI (SMS + in-app)."""
    __tablename__ = "ai_reminders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    trigger_time = Column(DateTime, nullable=False, index=True)
    reminder_type = Column(String(32), default="general")  # pickup|listing_expiry|distribution_event|general
    related_id = Column(Integer, nullable=True)  # optional FK to food_resource/center/etc.
    sent = Column(Boolean, default=False, index=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])


class AIFeedback(Base):
    """User feedback (thumbs up/down, comment) on an assistant message."""
    __tablename__ = "ai_feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(String(16), nullable=False)  # 'up'|'down'|'5'|...
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])
    conversation = relationship("AIConversation", foreign_keys=[conversation_id])
