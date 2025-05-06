from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import networkx as nx
from datetime import datetime

from shared.database import get_db
from shared.models import Client, Incident

app = FastAPI(title="CRAFD Graph Analytics Service")

class GraphBuilder:
    @staticmethod
    def build_client_graph(client_id: int, db: Session) -> Dict[str, Any]:
        # Create a new directed graph
        G = nx.DiGraph()
        
        # Get the main client
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
            
        # Add main client node
        G.add_node(f"client_{client.id}", 
                  type="client",
                  label=client.full_name,
                  details={
                      "id": client.id,
                      "type": client.client_type,
                      "risk_score": client.risk_score
                  })
        
        # Add contact nodes and edges
        if client.phone:
            G.add_node(f"phone_{client.phone}", 
                      type="phone",
                      label=client.phone)
            G.add_edge(f"client_{client.id}", 
                      f"phone_{client.phone}", 
                      type="has_phone")
            
        if client.email:
            G.add_node(f"email_{client.email}", 
                      type="email",
                      label=client.email)
            G.add_edge(f"client_{client.id}", 
                      f"email_{client.email}", 
                      type="has_email")
            
        if client.address:
            G.add_node(f"address_{client.address}", 
                      type="address",
                      label=client.address)
            G.add_edge(f"client_{client.id}", 
                      f"address_{client.address}", 
                      type="has_address")
            
        # Find related clients through shared attributes
        related_by_phone = db.query(Client).filter(
            Client.phone == client.phone,
            Client.id != client.id
        ).all() if client.phone else []
        
        related_by_address = db.query(Client).filter(
            Client.address == client.address,
            Client.id != client.id
        ).all() if client.address else []
        
        # Add related clients and their relationships
        for related in related_by_phone + related_by_address:
            G.add_node(f"client_{related.id}", 
                      type="client",
                      label=related.full_name,
                      details={
                          "id": related.id,
                          "type": related.client_type,
                          "risk_score": related.risk_score
                      })
            
            if related in related_by_phone:
                G.add_edge(f"client_{related.id}", 
                          f"phone_{client.phone}", 
                          type="has_phone")
                          
            if related in related_by_address:
                G.add_edge(f"client_{related.id}", 
                          f"address_{client.address}", 
                          type="has_address")
        
        # Add incidents
        for incident in client.incidents:
            G.add_node(f"incident_{incident.id}",
                      type="incident",
                      label=f"Incident #{incident.id}",
                      details={
                          "type": incident.type,
                          "status": incident.status,
                          "priority": incident.priority
                      })
            G.add_edge(f"client_{client.id}", 
                      f"incident_{incident.id}", 
                      type="has_incident")
        
        # Convert NetworkX graph to visualization format
        nodes = []
        edges = []
        
        for node in G.nodes(data=True):
            nodes.append({
                "id": node[0],
                "type": node[1]["type"],
                "label": node[1]["label"],
                "details": node[1].get("details", {})
            })
            
        for edge in G.edges(data=True):
            edges.append({
                "from": edge[0],
                "to": edge[1],
                "type": edge[2]["type"]
            })
            
        return {
            "nodes": nodes,
            "edges": edges,
            "timestamp": datetime.utcnow().isoformat()
        }

@app.get("/graph/{client_id}")
async def get_client_graph(
    client_id: int,
    db: Session = Depends(get_db)
):
    """
    Generate a graph of relationships for a given client.
    The graph includes:
    - Client details
    - Related clients through shared attributes (phone, address)
    - Associated incidents
    - Contact information nodes
    """
    return GraphBuilder.build_client_graph(client_id, db)

@app.get("/graph/search")
async def search_graph(
    query: str,
    db: Session = Depends(get_db)
):
    """
    Search for clients and build a combined graph of their relationships
    """
    # Search for clients by name, phone, or address
    clients = db.query(Client).filter(
        (Client.full_name.ilike(f"%{query}%")) |
        (Client.phone.ilike(f"%{query}%")) |
        (Client.address.ilike(f"%{query}%"))
    ).all()
    
    if not clients:
        raise HTTPException(status_code=404, detail="No matching clients found")
    
    # Combine graphs for all matching clients
    G = nx.DiGraph()
    for client in clients:
        client_graph = GraphBuilder.build_client_graph(client.id, db)
        for node in client_graph["nodes"]:
            G.add_node(node["id"], **node)
        for edge in client_graph["edges"]:
            G.add_edge(edge["from"], edge["to"], type=edge["type"])
    
    # Convert combined graph to response format
    nodes = []
    edges = []
    
    for node in G.nodes(data=True):
        nodes.append({
            "id": node[0],
            **node[1]
        })
        
    for edge in G.edges(data=True):
        edges.append({
            "from": edge[0],
            "to": edge[1],
            "type": edge[2]["type"]
        })
    
    return {
        "nodes": nodes,
        "edges": edges,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005) 