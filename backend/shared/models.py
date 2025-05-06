from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, JSON, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

# Association tables
client_lists = Table(
    'client_lists',
    Base.metadata,
    Column('client_id', Integer, ForeignKey('clients.id')),
    Column('list_id', Integer, ForeignKey('lists.id'))
)

class Client(Base):
    __tablename__ = 'clients'

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Basic information
    client_type = Column(String)  # individual/legal
    full_name = Column(String)
    tax_id = Column(String)  # INN for legal entities
    birth_date = Column(DateTime, nullable=True)
    
    # Contact information
    phone = Column(String)
    email = Column(String)
    address = Column(String)
    
    # Documents
    passport_number = Column(String)
    passport_issue_date = Column(DateTime, nullable=True)
    
    # Risk profile
    risk_score = Column(Float, default=0.0)
    is_blocked = Column(Boolean, default=False)
    block_reason = Column(String, nullable=True)
    
    # Relationships
    incidents = relationship("Incident", back_populates="client")
    lists = relationship("List", secondary=client_lists)
    scoring_results = relationship("ScoringResult", back_populates="client")

class List(Base):
    __tablename__ = 'lists'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    type = Column(String)  # blacklist/sanctions/etc
    source = Column(String)  # internal/external
    last_updated = Column(DateTime, default=datetime.utcnow)

class Incident(Base):
    __tablename__ = 'incidents'

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    client_id = Column(Integer, ForeignKey('clients.id'))
    type = Column(String)  # fraud_attempt/suspicious_activity/etc
    status = Column(String)  # open/in_progress/closed
    priority = Column(String)  # high/medium/low
    description = Column(String)
    assigned_to = Column(String, nullable=True)
    resolution = Column(String, nullable=True)
    
    client = relationship("Client", back_populates="incidents")
    notes = relationship("IncidentNote", back_populates="incident")

class IncidentNote(Base):
    __tablename__ = 'incident_notes'

    id = Column(Integer, primary_key=True)
    incident_id = Column(Integer, ForeignKey('incidents.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    author = Column(String)
    content = Column(String)
    
    incident = relationship("Incident", back_populates="notes")

class ScoringRule(Base):
    __tablename__ = 'scoring_rules'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    type = Column(String)  # fraud/credit/behavioral
    conditions = Column(JSON)
    weight = Column(Float)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ScoringResult(Base):
    __tablename__ = 'scoring_results'

    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey('clients.id'))
    rule_id = Column(Integer, ForeignKey('scoring_rules.id'))
    score = Column(Float)
    details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client", back_populates="scoring_results")
    rule = relationship("ScoringRule") 