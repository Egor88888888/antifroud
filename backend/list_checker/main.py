from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel

from shared.database import get_db
from shared.models import Client, List as ListModel

app = FastAPI(title="CRAFD List Checker Service")

# Pydantic models
class ListCreate(BaseModel):
    name: str
    description: str
    type: str
    source: str

class ListMatch(BaseModel):
    list_id: int
    list_name: str
    list_type: str
    match_type: str
    match_details: Dict
    matched_at: datetime

# Mock external lists (in production, these would be API calls)
MOCK_SANCTIONS_LIST = [
    {"name": "John Smith", "id": "12345", "reason": "International sanctions"},
    {"name": "Acme Corp", "tax_id": "98765", "reason": "Trade restrictions"}
]

MOCK_PEP_LIST = [
    {"name": "James Wilson", "position": "Government Official", "country": "US"},
    {"name": "Maria Garcia", "position": "Diplomat", "country": "ES"}
]

@app.post("/lists", status_code=status.HTTP_201_CREATED)
async def create_list(
    list_data: ListCreate,
    db: Session = Depends(get_db)
):
    """Create a new list in the system"""
    db_list = ListModel(**list_data.dict())
    db.add(db_list)
    db.commit()
    db.refresh(db_list)
    return db_list

@app.get("/lists")
async def get_lists(
    type: Optional[str] = None,
    source: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all lists with optional filters"""
    query = db.query(ListModel)
    
    if type:
        query = query.filter(ListModel.type == type)
    if source:
        query = query.filter(ListModel.source == source)
        
    return query.all()

@app.post("/check/{client_id}")
async def check_client(
    client_id: int,
    db: Session = Depends(get_db)
):
    """
    Check a client against all available lists.
    This includes both internal lists (stored in DB) and external lists (mocked).
    """
    # Get client
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    matches: List[ListMatch] = []
    
    # Check internal lists
    internal_lists = db.query(ListModel).all()
    for list_item in internal_lists:
        # In production, implement proper matching logic
        # For demo, we'll just do simple name matching
        if client.full_name.lower() in list_item.name.lower():
            matches.append(ListMatch(
                list_id=list_item.id,
                list_name=list_item.name,
                list_type=list_item.type,
                match_type="name_match",
                match_details={
                    "confidence": 0.9,
                    "matched_field": "full_name"
                },
                matched_at=datetime.utcnow()
            ))
    
    # Check mock external sanctions list
    for sanction in MOCK_SANCTIONS_LIST:
        if client.full_name.lower() in sanction["name"].lower():
            matches.append(ListMatch(
                list_id=0,  # External list
                list_name="International Sanctions List",
                list_type="sanctions",
                match_type="name_match",
                match_details={
                    "confidence": 0.95,
                    "reason": sanction["reason"],
                    "external_id": sanction["id"]
                },
                matched_at=datetime.utcnow()
            ))
    
    # Check mock PEP list
    for pep in MOCK_PEP_LIST:
        if client.full_name.lower() in pep["name"].lower():
            matches.append(ListMatch(
                list_id=0,  # External list
                list_name="PEP Database",
                list_type="pep",
                match_type="name_match",
                match_details={
                    "confidence": 0.9,
                    "position": pep["position"],
                    "country": pep["country"]
                },
                matched_at=datetime.utcnow()
            ))
    
    # If matches found, update client risk profile
    if matches:
        client.risk_score = max(client.risk_score, 0.8)  # High risk if on any list
        db.commit()
    
    return {
        "client_id": client_id,
        "check_time": datetime.utcnow().isoformat(),
        "total_matches": len(matches),
        "matches": matches
    }

@app.get("/lists/{list_id}/entries")
async def get_list_entries(
    list_id: int,
    db: Session = Depends(get_db)
):
    """Get entries for a specific list"""
    list_item = db.query(ListModel).filter(ListModel.id == list_id).first()
    if not list_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    
    # In production, this would fetch actual entries
    # For demo, return mock data
    return {
        "list_id": list_id,
        "list_name": list_item.name,
        "entries": [
            {"id": 1, "name": "Test Entry 1", "added_date": "2023-01-01"},
            {"id": 2, "name": "Test Entry 2", "added_date": "2023-01-02"}
        ]
    }

@app.get("/stats")
async def get_list_stats(db: Session = Depends(get_db)):
    """Get statistics about list checks and matches"""
    total_lists = db.query(ListModel).count()
    
    # In production, these would be actual counts from a matches table
    return {
        "total_lists": total_lists,
        "total_checks_today": 150,
        "total_matches_today": 5,
        "lists_by_type": {
            "sanctions": 2,
            "pep": 1,
            "internal_blacklist": 3
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 