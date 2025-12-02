import os
import json
from typing import Dict, Any, List
from dotenv import load_dotenv
from groq import Groq
from sqlalchemy.orm import Session
from app.models.interaction import Interaction

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ---------- Helper: call LLM ----------
def call_llm(prompt: str, max_tokens: int = 512) -> str:
    """
    Calls Groq LLM (gemma2-9b-it) and returns text content.
    """
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content


# ---------- Tool 1: Extract Entities ----------
def extract_entities_tool(text: str) -> Dict[str, Any]:
    """
    LangGraph Tool: Extract entities from raw interaction text.
    """
    prompt = f"""
You are an assistant for a pharma CRM. From the interaction note below, extract structured JSON.

Fields:
- hcp_name (string)
- designation (string or null)
- topics (array of strings)
- materials_shared (array of strings)
- samples_distributed (array of objects {{ "name": string, "quantity": int }})
- sentiment (one of: "positive", "neutral", "negative")
- follow_up_tasks (array of strings)
- meeting_time (string, ISO-like or null)

Return ONLY valid JSON.

Interaction text:
\"\"\"{text}\"\"\"
    """
    raw = call_llm(prompt)
    # Try to parse JSON
    try:
        data = json.loads(raw)
        return data
    except Exception:
        # If model returns extra text, try to pull JSON part
        import re
        m = re.search(r"\{.*\}", raw, re.S)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                pass
    # fallback
    return {"raw_response": raw.strip()}


# ---------- Tool 2: Summarize Interaction ----------
def summarize_interaction_tool(text: str) -> Dict[str, str]:
    """
    LangGraph Tool: Summarize interaction for CRM.
    """
    prompt = f"""
Summarize the following HCP interaction in 1–2 concise sentences,
suitable as a CRM log summary:

\"\"\"{text}\"\"\"

Summary:
"""
    summary = call_llm(prompt, max_tokens=150)
    return {"summary": summary.strip()}


# ---------- Tool 3: Suggest Follow-ups ----------
def suggest_followups_tool(structured: Dict[str, Any]) -> List[str]:
    """
    LangGraph Tool: Suggest follow-up actions based on structured interaction JSON.
    """
    prompt = f"""
You are an expert pharma sales assistant. Based on the interaction JSON below,
suggest up to 3 prioritized follow-up actions.

Return them as a JSON array of strings.

Interaction:
{json.dumps(structured, indent=2)}
"""
    raw = call_llm(prompt, max_tokens=200)
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return data
    except Exception:
        pass
    # fallback: split lines
    return [line.strip("-• ").strip() for line in raw.splitlines() if line.strip()]


# ---------- Tool 4: Log Interaction (composite) ----------
def log_interaction_tool(text: str, db: Session) -> Dict[str, Any]:
    """
    LangGraph Tool: Log Interaction.
    - Uses extract_entities_tool
    - Uses summarize_interaction_tool
    - Uses suggest_followups_tool
    - Saves interaction in DB
    """
    entities = extract_entities_tool(text)
    summary_obj = summarize_interaction_tool(text)
    summary = summary_obj.get("summary", "")

    followups = suggest_followups_tool(entities)

    interaction = Interaction(
        raw_text=text,
        structured_data=entities,
        summary=summary,
        sentiment=entities.get("sentiment") if isinstance(entities, dict) else None,
        meeting_time=None,   # could parse from entities["meeting_time"]
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    return {
        "interaction": {
            "id": interaction.id,
            "summary": interaction.summary,
            "structured_data": interaction.structured_data,
            "sentiment": interaction.sentiment,
            "created_at": interaction.created_at.isoformat(),
        },
        "followups": followups,
    }


# ---------- Tool 5: Edit Interaction ----------
def edit_interaction_tool(interaction_id: int, patch: Dict[str, Any], db: Session) -> Dict[str, Any]:
    """
    LangGraph Tool: Edit Interaction.
    - Applies patch to an existing interaction.
    - If raw_text is changed, re-summarize.
    """
    obj = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not obj:
        return {"error": "interaction_not_found"}

    raw_changed = False

    if "raw_text" in patch and patch["raw_text"] is not None:
        obj.raw_text = patch["raw_text"]
        raw_changed = True

    if "structured_data" in patch and patch["structured_data"] is not None:
        obj.structured_data = patch["structured_data"]

    if "sentiment" in patch and patch["sentiment"] is not None:
        obj.sentiment = patch["sentiment"]

    if raw_changed:
        summary_obj = summarize_interaction_tool(obj.raw_text)
        obj.summary = summary_obj.get("summary", obj.summary)

    db.commit()
    db.refresh(obj)

    return {
        "id": obj.id,
        "summary": obj.summary,
        "structured_data": obj.structured_data,
        "sentiment": obj.sentiment,
    }
