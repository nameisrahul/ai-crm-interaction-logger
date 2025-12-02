from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.interaction import Interaction
from ..schemas.interaction_schema import InteractionCreate, InteractionOut

router = APIRouter()

@router.post("/", response_model=InteractionOut)
def create_interaction(payload: InteractionCreate, db: Session = Depends(get_db)):
    obj = Interaction(**payload.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get("/", response_model=list[InteractionOut])
def list_interactions(db: Session = Depends(get_db)):
    return db.query(Interaction).order_by(Interaction.id.desc()).all()
@router.delete("/{interaction_id}")
def delete_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()

    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")

    db.delete(interaction)
    db.commit()
    return {"message": "deleted"}
@router.put("/{interaction_id}")
def update_interaction(interaction_id: int, data: dict, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()

    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")

    # Apply updates from JSON body
    for key, value in data.items():
        if hasattr(interaction, key):
            setattr(interaction, key, value)

    db.commit()
    db.refresh(interaction)
    return interaction

