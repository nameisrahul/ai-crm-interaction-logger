from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.dialects.mysql import INTEGER
from sqlalchemy.sql import func
from ..db import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(INTEGER, primary_key=True, autoincrement=True)
    raw_text = Column(Text)
    structured_data = Column(JSON)
    summary = Column(Text)
    sentiment = Column(String(20))
    meeting_time = Column(DateTime)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
