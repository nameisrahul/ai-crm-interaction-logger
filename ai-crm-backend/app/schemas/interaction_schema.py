from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class InteractionBase(BaseModel):
    raw_text: Optional[str]
    structured_data: Optional[Any]
    summary: Optional[str]
    sentiment: Optional[str]
    meeting_time: Optional[datetime]

class InteractionCreate(InteractionBase):
    pass

class InteractionOut(InteractionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
