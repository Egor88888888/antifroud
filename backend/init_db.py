from datetime import datetime, timedelta
import json
from sqlalchemy.orm import Session

from shared.database import engine, SessionLocal, Base
from shared.models import Client, List, Incident, IncidentNote, ScoringRule

def init_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Only add sample data if database is empty
        if db.query(Client).count() == 0:
            # Add sample clients
            clients = [
                Client(
                    full_name="John Smith",
                    client_type="individual",
                    tax_id="123456789",
                    birth_date=datetime(1980, 1, 1),
                    phone="+1234567890",
                    email="john.smith@example.com",
                    address="123 Main St, City",
                    passport_number="AB123456",
                    passport_issue_date=datetime(2020, 1, 1),
                    risk_score=0.2
                ),
                Client(
                    full_name="Acme Corporation",
                    client_type="legal",
                    tax_id="987654321",
                    phone="+0987654321",
                    email="contact@acme.com",
                    address="456 Business Ave, City",
                    risk_score=0.4
                ),
                Client(
                    full_name="Maria Garcia",
                    client_type="individual",
                    tax_id="456789123",
                    birth_date=datetime(1990, 6, 15),
                    phone="+1122334455",
                    email="maria.garcia@example.com",
                    address="789 Oak Rd, City",
                    passport_number="CD789012",
                    passport_issue_date=datetime(2019, 5, 10),
                    risk_score=0.6
                )
            ]
            
            for client in clients:
                db.add(client)
            db.commit()
            
            # Add sample lists
            lists = [
                List(
                    name="International Sanctions",
                    description="Global sanctions list",
                    type="sanctions",
                    source="external"
                ),
                List(
                    name="PEP Database",
                    description="Politically Exposed Persons",
                    type="pep",
                    source="external"
                ),
                List(
                    name="Internal Blacklist",
                    description="Bank's internal high-risk entities",
                    type="blacklist",
                    source="internal"
                )
            ]
            
            for list_item in lists:
                db.add(list_item)
            db.commit()
            
            # Add sample incidents
            incidents = [
                Incident(
                    client_id=1,
                    type="suspicious_activity",
                    status="open",
                    priority="high",
                    description="Multiple large transactions in short period",
                    assigned_to="analyst1"
                ),
                Incident(
                    client_id=2,
                    type="document_verification",
                    status="in_progress",
                    priority="medium",
                    description="Inconsistent company documents",
                    assigned_to="analyst2"
                ),
                Incident(
                    client_id=3,
                    type="sanctions_match",
                    status="closed",
                    priority="high",
                    description="Potential match with sanctioned individual",
                    assigned_to="analyst1",
                    resolution="False positive - different person"
                )
            ]
            
            for incident in incidents:
                db.add(incident)
            db.commit()
            
            # Add sample incident notes
            notes = [
                IncidentNote(
                    incident_id=1,
                    author="analyst1",
                    content="Initiated investigation of transaction pattern"
                ),
                IncidentNote(
                    incident_id=2,
                    author="analyst2",
                    content="Requested additional documentation from client"
                ),
                IncidentNote(
                    incident_id=3,
                    author="analyst1",
                    content="Completed verification - confirmed different person"
                )
            ]
            
            for note in notes:
                db.add(note)
            db.commit()
            
            # Add sample scoring rules
            rules = [
                ScoringRule(
                    name="Age Under 18",
                    description="Check if client is under 18 years old",
                    type="fraud",
                    conditions=json.dumps([{
                        "field": "birth_date",
                        "operator": "greater_than",
                        "value": (datetime.now() - timedelta(days=365*18)).isoformat()
                    }]),
                    weight=0.8,
                    is_active=True
                ),
                ScoringRule(
                    name="Multiple Addresses",
                    description="Client has changed address multiple times",
                    type="suspicious",
                    conditions=json.dumps([{
                        "field": "address_changes",
                        "operator": "greater_than",
                        "value": 3
                    }]),
                    weight=0.6,
                    is_active=True
                ),
                ScoringRule(
                    name="Sanctioned Country",
                    description="Client is from a sanctioned country",
                    type="compliance",
                    conditions=json.dumps([{
                        "field": "country",
                        "operator": "in_list",
                        "value": ["Country1", "Country2", "Country3"]
                    }]),
                    weight=1.0,
                    is_active=True
                )
            ]
            
            for rule in rules:
                db.add(rule)
            db.commit()
            
            print("Sample data initialized successfully")
    
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Done.") 