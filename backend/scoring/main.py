from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json
from datetime import datetime

from shared.database import get_db
from shared.models import Client, ScoringRule, ScoringResult

app = FastAPI(title="CRAFD Scoring Service")

class RuleEngine:
    @staticmethod
    def evaluate_condition(client: Client, condition: Dict[str, Any]) -> bool:
        operator = condition.get("operator")
        field = condition.get("field")
        value = condition.get("value")
        
        if not all([operator, field, value]):
            return False
            
        client_value = getattr(client, field, None)
        
        if client_value is None:
            return False
            
        if operator == "equals":
            return client_value == value
        elif operator == "not_equals":
            return client_value != value
        elif operator == "greater_than":
            return client_value > value
        elif operator == "less_than":
            return client_value < value
        elif operator == "contains":
            return value in client_value
        elif operator == "in_list":
            return client_value in value
        
        return False

    @staticmethod
    def evaluate_rule(client: Client, rule: ScoringRule) -> float:
        try:
            conditions = rule.conditions
            if isinstance(conditions, str):
                conditions = json.loads(conditions)
                
            # For demo, we'll use a simple scoring mechanism
            matches = 0
            total_conditions = len(conditions)
            
            for condition in conditions:
                if RuleEngine.evaluate_condition(client, condition):
                    matches += 1
            
            # Calculate score based on matches and rule weight
            if total_conditions > 0:
                return (matches / total_conditions) * rule.weight
            
            return 0.0
            
        except Exception as e:
            print(f"Error evaluating rule {rule.id}: {str(e)}")
            return 0.0

@app.post("/score/{client_id}")
async def score_client(
    client_id: int,
    db: Session = Depends(get_db)
):
    # Get client
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get active rules
    rules = db.query(ScoringRule).filter(ScoringRule.is_active == True).all()
    
    total_score = 0.0
    rule_results = []
    
    # Evaluate each rule
    for rule in rules:
        score = RuleEngine.evaluate_rule(client, rule)
        total_score += score
        
        # Save rule result
        result = ScoringResult(
            client_id=client_id,
            rule_id=rule.id,
            score=score,
            details={
                "rule_name": rule.name,
                "rule_type": rule.type,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        db.add(result)
        
        rule_results.append({
            "rule_id": rule.id,
            "rule_name": rule.name,
            "score": score
        })
    
    # Update client's risk score
    client.risk_score = total_score
    db.commit()
    
    return {
        "client_id": client_id,
        "total_score": total_score,
        "rule_results": rule_results,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/rules")
async def get_rules(db: Session = Depends(get_db)):
    rules = db.query(ScoringRule).all()
    return rules

@app.post("/rules")
async def create_rule(
    rule_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    rule = ScoringRule(**rule_data)
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@app.get("/results/{client_id}")
async def get_client_scoring_history(
    client_id: int,
    db: Session = Depends(get_db)
):
    results = db.query(ScoringResult).filter(
        ScoringResult.client_id == client_id
    ).order_by(ScoringResult.created_at.desc()).all()
    
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002) 