from pydantic import BaseModel

class AgentLogRequest(BaseModel):
    text: str
