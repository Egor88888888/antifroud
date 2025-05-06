from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
from datetime import datetime

router = APIRouter()

class ProcessDefinition(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    xml_content: str

class ProcessInstance(BaseModel):
    id: str
    process_definition_id: str
    status: str
    variables: Dict
    start_time: datetime

# Demo processes
DEMO_PROCESSES = {
    "client_verification": {
        "id": "client_verification_v1",
        "name": "Верификация клиента",
        "description": "Процесс комплексной проверки клиента с учетом всех факторов риска",
        "xml_content": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <bpmn:process id="client_verification_v1" isExecutable="true">
    <bpmn:startEvent id="start" name="Получение заявки">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    
    <bpmn:sequenceFlow id="Flow_1" sourceRef="start" targetRef="gateway_1" />
    
    <bpmn:parallelGateway id="gateway_1" name="Параллельные проверки">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:parallelGateway>

    <bpmn:task id="identity_check" name="Проверка личности">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="document_check" name="Проверка документов">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="list_check" name="Проверка по спискам">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:task>

    <bpmn:parallelGateway id="gateway_2" name="Сбор результатов">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:incoming>Flow_7</bpmn:incoming>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
    </bpmn:parallelGateway>

    <bpmn:task id="risk_scoring" name="Оценка рисков">
      <bpmn:incoming>Flow_8</bpmn:incoming>
      <bpmn:outgoing>Flow_9</bpmn:outgoing>
    </bpmn:task>

    <bpmn:exclusiveGateway id="gateway_3" name="Проверка уровня риска">
      <bpmn:incoming>Flow_9</bpmn:incoming>
      <bpmn:outgoing>Flow_10</bpmn:outgoing>
      <bpmn:outgoing>Flow_11</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:task id="manual_review" name="Ручная проверка">
      <bpmn:incoming>Flow_10</bpmn:incoming>
      <bpmn:outgoing>Flow_12</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="auto_approve" name="Автоматическое одобрение">
      <bpmn:incoming>Flow_11</bpmn:incoming>
      <bpmn:outgoing>Flow_13</bpmn:outgoing>
    </bpmn:task>

    <bpmn:exclusiveGateway id="gateway_4" name="Финальное решение">
      <bpmn:incoming>Flow_12</bpmn:incoming>
      <bpmn:incoming>Flow_13</bpmn:incoming>
      <bpmn:outgoing>Flow_14</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:endEvent id="end" name="Решение принято">
      <bpmn:incoming>Flow_14</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="Flow_2" sourceRef="gateway_1" targetRef="identity_check" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="gateway_1" targetRef="document_check" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="gateway_1" targetRef="list_check" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="identity_check" targetRef="gateway_2" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="document_check" targetRef="gateway_2" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="list_check" targetRef="gateway_2" />
    <bpmn:sequenceFlow id="Flow_8" sourceRef="gateway_2" targetRef="risk_scoring" />
    <bpmn:sequenceFlow id="Flow_9" sourceRef="risk_scoring" targetRef="gateway_3" />
    <bpmn:sequenceFlow id="Flow_10" sourceRef="gateway_3" targetRef="manual_review" name="Высокий риск" />
    <bpmn:sequenceFlow id="Flow_11" sourceRef="gateway_3" targetRef="auto_approve" name="Низкий риск" />
    <bpmn:sequenceFlow id="Flow_12" sourceRef="manual_review" targetRef="gateway_4" />
    <bpmn:sequenceFlow id="Flow_13" sourceRef="auto_approve" targetRef="gateway_4" />
    <bpmn:sequenceFlow id="Flow_14" sourceRef="gateway_4" targetRef="end" />
  </bpmn:process>
</bpmn:definitions>"""
    }
}

@router.get("/processes", response_model=List[ProcessDefinition])
async def get_processes():
    """Получить список доступных процессов"""
    return [ProcessDefinition(**process) for process in DEMO_PROCESSES.values()]

@router.get("/processes/{process_id}", response_model=ProcessDefinition)
async def get_process(process_id: str):
    """Получить детали конкретного процесса"""
    if process_id not in DEMO_PROCESSES:
        raise HTTPException(status_code=404, detail="Process not found")
    return ProcessDefinition(**DEMO_PROCESSES[process_id])

@router.post("/processes/{process_id}/instances", response_model=ProcessInstance)
async def start_process(process_id: str):
    """Запустить новый экземпляр процесса"""
    if process_id not in DEMO_PROCESSES:
        raise HTTPException(status_code=404, detail="Process not found")
    
    instance = ProcessInstance(
        id=f"inst_{datetime.now().timestamp()}",
        process_definition_id=process_id,
        status="ACTIVE",
        variables={},
        start_time=datetime.now()
    )
    return instance 