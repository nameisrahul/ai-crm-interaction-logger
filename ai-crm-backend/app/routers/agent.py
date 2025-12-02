from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.agent_schema import AgentLogRequest
from app.services.agent_tools import log_interaction_tool, extract_entities_tool, summarize_interaction_tool, suggest_followups_tool, edit_interaction_tool

router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/log")
def log_via_ai(payload: AgentLogRequest, db: Session = Depends(get_db)):
    """
    Main AI endpoint:
    - Takes raw text
    - Uses log_interaction_tool
    - Returns saved interaction + suggested follow-ups
    """
    result = log_interaction_tool(payload.text, db)
    return result
