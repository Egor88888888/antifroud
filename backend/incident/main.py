from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from shared.database import get_db
from shared.models import Incident, IncidentNote, Client

app = FastAPI(title="CRAFD Incident Management Service")

# Pydantic models for request/response
class IncidentCreate(BaseModel):
    client_id: int
    type: str
    priority: str
    description: str
    assigned_to: Optional[str] = None

class IncidentUpdate(BaseModel):
    status: Optional[str]
    priority: Optional[str]
    assigned_to: Optional[str]
    resolution: Optional[str]

class NoteCreate(BaseModel):
    content: str
    author: str

@app.post("/incidents", status_code=status.HTTP_201_CREATED)
async def create_incident(
    incident: IncidentCreate,
    db: Session = Depends(get_db)
):
    # Verify client exists
    client = db.query(Client).filter(Client.id == incident.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Create new incident
    db_incident = Incident(
        client_id=incident.client_id,
        type=incident.type,
        status="open",
        priority=incident.priority,
        description=incident.description,
        assigned_to=incident.assigned_to
    )
    
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    
    return db_incident

@app.get("/incidents")
async def get_incidents(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    
    if status:
        query = query.filter(Incident.status == status)
    if priority:
        query = query.filter(Incident.priority == priority)
        
    incidents = query.order_by(Incident.created_at.desc()).all()
    return incidents

@app.get("/incidents/{incident_id}")
async def get_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    return incident

@app.put("/incidents/{incident_id}")
async def update_incident(
    incident_id: int,
    incident_update: IncidentUpdate,
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    # Update fields if provided
    if incident_update.status is not None:
        incident.status = incident_update.status
    if incident_update.priority is not None:
        incident.priority = incident_update.priority
    if incident_update.assigned_to is not None:
        incident.assigned_to = incident_update.assigned_to
    if incident_update.resolution is not None:
        incident.resolution = incident_update.resolution
        
    incident.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(incident)
    
    return incident

@app.post("/incidents/{incident_id}/notes")
async def add_incident_note(
    incident_id: int,
    note: NoteCreate,
    db: Session = Depends(get_db)
):
    # Verify incident exists
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    # Create note
    db_note = IncidentNote(
        incident_id=incident_id,
        content=note.content,
        author=note.author
    )
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    return db_note

@app.get("/incidents/{incident_id}/notes")
async def get_incident_notes(
    incident_id: int,
    db: Session = Depends(get_db)
):
    # Verify incident exists
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    notes = db.query(IncidentNote).filter(
        IncidentNote.incident_id == incident_id
    ).order_by(IncidentNote.created_at.desc()).all()
    
    return notes

@app.get("/incidents/client/{client_id}")
async def get_client_incidents(
    client_id: int,
    db: Session = Depends(get_db)
):
    # Verify client exists
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    incidents = db.query(Incident).filter(
        Incident.client_id == client_id
    ).order_by(Incident.created_at.desc()).all()
    
    return incidents

@app.get("/incidents/stats")
async def get_incident_stats(db: Session = Depends(get_db)):
    """Get statistics about incidents"""
    total = db.query(Incident).count()
    open_incidents = db.query(Incident).filter(Incident.status == "open").count()
    in_progress = db.query(Incident).filter(Incident.status == "in_progress").count()
    closed = db.query(Incident).filter(Incident.status == "closed").count()
    
    high_priority = db.query(Incident).filter(Incident.priority == "high").count()
    medium_priority = db.query(Incident).filter(Incident.priority == "medium").count()
    low_priority = db.query(Incident).filter(Incident.priority == "low").count()
    
    return {
        "total": total,
        "by_status": {
            "open": open_incidents,
            "in_progress": in_progress,
            "closed": closed
        },
        "by_priority": {
            "high": high_priority,
            "medium": medium_priority,
            "low": low_priority
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003) 