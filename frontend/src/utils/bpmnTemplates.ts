// BPMN template constants to use when external files fail to load
export const BPMN_TEMPLATES = {
  CLIENT_VERIFICATION: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_0u1lcrs" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="ClientVerificationProcess" name="Процесс верификации клиента" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Получение заявки на верификацию">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:task id="Task_CheckDocuments" name="Проверка документов">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="Task_ValidateIdentity" name="Валидация личности">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="Task_RiskAssessment" name="Оценка рисков">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:task>

    <bpmn:exclusiveGateway id="Gateway_VerificationDecision" name="Результат верификации">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_Approved</bpmn:outgoing>
      <bpmn:outgoing>Flow_Rejected</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:task id="Task_ApproveClient" name="Подтверждение клиента">
      <bpmn:incoming>Flow_Approved</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="Task_RejectClient" name="Отклонение клиента">
      <bpmn:incoming>Flow_Rejected</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="Task_NotifyClient" name="Уведомление клиента">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:task>

    <bpmn:endEvent id="EndEvent_1" name="Завершение процесса верификации">
      <bpmn:incoming>Flow_7</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_CheckDocuments" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_CheckDocuments" targetRef="Task_ValidateIdentity" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_ValidateIdentity" targetRef="Task_RiskAssessment" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_RiskAssessment" targetRef="Gateway_VerificationDecision" />
    <bpmn:sequenceFlow id="Flow_Approved" name="Одобрено" sourceRef="Gateway_VerificationDecision" targetRef="Task_ApproveClient" />
    <bpmn:sequenceFlow id="Flow_Rejected" name="Отклонено" sourceRef="Gateway_VerificationDecision" targetRef="Task_RejectClient" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_ApproveClient" targetRef="Task_NotifyClient" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_RejectClient" targetRef="Task_NotifyClient" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_NotifyClient" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="ClientVerificationProcess">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="232" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="129" y="275" width="83" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_CheckDocuments_di" bpmnElement="Task_CheckDocuments">
        <dc:Bounds x="240" y="210" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_ValidateIdentity_di" bpmnElement="Task_ValidateIdentity">
        <dc:Bounds x="400" y="210" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_RiskAssessment_di" bpmnElement="Task_RiskAssessment">
        <dc:Bounds x="560" y="210" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_VerificationDecision_di" bpmnElement="Gateway_VerificationDecision" isMarkerVisible="true">
        <dc:Bounds x="725" y="225" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="712" y="195" width="77" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_ApproveClient_di" bpmnElement="Task_ApproveClient">
        <dc:Bounds x="840" y="140" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_RejectClient_di" bpmnElement="Task_RejectClient">
        <dc:Bounds x="840" y="300" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_NotifyClient_di" bpmnElement="Task_NotifyClient">
        <dc:Bounds x="1010" y="210" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_End_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="1182" y="232" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1158" y="275" width="84" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="250" />
        <di:waypoint x="240" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="250" />
        <di:waypoint x="400" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="500" y="250" />
        <di:waypoint x="560" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="660" y="250" />
        <di:waypoint x="725" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Approved_di" bpmnElement="Flow_Approved">
        <di:waypoint x="750" y="225" />
        <di:waypoint x="750" y="180" />
        <di:waypoint x="840" y="180" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="772" y="163" width="56" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Rejected_di" bpmnElement="Flow_Rejected">
        <di:waypoint x="750" y="275" />
        <di:waypoint x="750" y="340" />
        <di:waypoint x="840" y="340" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="773" y="323" width="54" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="940" y="180" />
        <di:waypoint x="975" y="180" />
        <di:waypoint x="975" y="250" />
        <di:waypoint x="1010" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="940" y="340" />
        <di:waypoint x="975" y="340" />
        <di:waypoint x="975" y="250" />
        <di:waypoint x="1010" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
        <di:waypoint x="1110" y="250" />
        <di:waypoint x="1182" y="250" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`,

  CRAFD_API_GATEWAY: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CrafdApiGateway" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="CrafdApiGatewayProcess" name="CRAFD API Gateway Процессы" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Запрос к API">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:task id="Task_Authentication" name="Проверка аутентификации">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>

    <bpmn:exclusiveGateway id="Gateway_AuthCheck" name="Статус аутентификации">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_AuthSuccess</bpmn:outgoing>
      <bpmn:outgoing>Flow_AuthFailed</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:task id="Task_TokenValidation" name="Валидация токена">
      <bpmn:incoming>Flow_AuthSuccess</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="Task_AuthFailed" name="Отказ в доступе">
      <bpmn:incoming>Flow_AuthFailed</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:task>

    <bpmn:exclusiveGateway id="Gateway_ApiRouting" name="Маршрутизация API">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_IdentificationRoute</bpmn:outgoing>
      <bpmn:outgoing>Flow_ListsRoute</bpmn:outgoing>
      <bpmn:outgoing>Flow_ScoringRoute</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:task id="Task_IdentificationService" name="Сервис идентификации клиента">
      <bpmn:incoming>Flow_IdentificationRoute</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="Task_ListsService" name="Сервис проверки по спискам">
      <bpmn:incoming>Flow_ListsRoute</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="Task_ScoringService" name="Сервис скоринга">
      <bpmn:incoming>Flow_ScoringRoute</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:task>

    <bpmn:exclusiveGateway id="Gateway_ResponseMerge" name="Объединение ответов">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:incoming>Flow_7</bpmn:incoming>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:task id="Task_RateLimiting" name="Контроль частоты запросов">
      <bpmn:incoming>Flow_8</bpmn:incoming>
      <bpmn:outgoing>Flow_9</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="Task_LogRequest" name="Логирование запросов">
      <bpmn:incoming>Flow_9</bpmn:incoming>
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_10</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="Task_PrepareResponse" name="Формирование ответа API">
      <bpmn:incoming>Flow_10</bpmn:incoming>
      <bpmn:outgoing>Flow_11</bpmn:outgoing>
    </bpmn:task>

    <bpmn:endEvent id="EndEvent_1" name="Ответ API-шлюза">
      <bpmn:incoming>Flow_11</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_Authentication" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_Authentication" targetRef="Gateway_AuthCheck" />
    <bpmn:sequenceFlow id="Flow_AuthSuccess" name="Успешно" sourceRef="Gateway_AuthCheck" targetRef="Task_TokenValidation" />
    <bpmn:sequenceFlow id="Flow_AuthFailed" name="Неудачно" sourceRef="Gateway_AuthCheck" targetRef="Task_AuthFailed" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_TokenValidation" targetRef="Gateway_ApiRouting" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_AuthFailed" targetRef="Task_LogRequest" />
    <bpmn:sequenceFlow id="Flow_IdentificationRoute" name="GET /api/identification/{client_id}" sourceRef="Gateway_ApiRouting" targetRef="Task_IdentificationService" />
    <bpmn:sequenceFlow id="Flow_ListsRoute" name="GET /api/lists/{client_id}" sourceRef="Gateway_ApiRouting" targetRef="Task_ListsService" />
    <bpmn:sequenceFlow id="Flow_ScoringRoute" name="GET /api/scoring/{client_id}" sourceRef="Gateway_ApiRouting" targetRef="Task_ScoringService" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_IdentificationService" targetRef="Gateway_ResponseMerge" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_ListsService" targetRef="Gateway_ResponseMerge" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_ScoringService" targetRef="Gateway_ResponseMerge" />
    <bpmn:sequenceFlow id="Flow_8" sourceRef="Gateway_ResponseMerge" targetRef="Task_RateLimiting" />
    <bpmn:sequenceFlow id="Flow_9" sourceRef="Task_RateLimiting" targetRef="Task_LogRequest" />
    <bpmn:sequenceFlow id="Flow_10" sourceRef="Task_LogRequest" targetRef="Task_PrepareResponse" />
    <bpmn:sequenceFlow id="Flow_11" sourceRef="Task_PrepareResponse" targetRef="EndEvent_1" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="CrafdApiGatewayProcess">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="232" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="140" y="275" width="60" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_Authentication_di" bpmnElement="Task_Authentication">
        <dc:Bounds x="240" y="210" width="100" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Gateway_AuthCheck_di" bpmnElement="Gateway_AuthCheck" isMarkerVisible="true">
        <dc:Bounds x="395" y="225" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="395" y="195" width="52" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_TokenValidation_di" bpmnElement="Task_TokenValidation">
        <dc:Bounds x="500" y="210" width="100" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_AuthFailed_di" bpmnElement="Task_AuthFailed">
        <dc:Bounds x="500" y="340" width="100" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Gateway_ApiRouting_di" bpmnElement="Gateway_ApiRouting" isMarkerVisible="true">
        <dc:Bounds x="655" y="225" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="640" y="195" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_IdentificationService_di" bpmnElement="Task_IdentificationService">
        <dc:Bounds x="760" y="110" width="100" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_ListsService_di" bpmnElement="Task_ListsService">
        <dc:Bounds x="760" y="210" width="100" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_ScoringService_di" bpmnElement="Task_ScoringService">
        <dc:Bounds x="760" y="310" width="100" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Gateway_ResponseMerge_di" bpmnElement="Gateway_ResponseMerge" isMarkerVisible="true">
        <dc:Bounds x="915" y="225" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="896" y="195" width="88" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_RateLimiting_di" bpmnElement="Task_RateLimiting">
        <dc:Bounds x="1020" y="210" width="100" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_LogRequest_di" bpmnElement="Task_LogRequest">
        <dc:Bounds x="1170" y="210" width="100" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_PrepareResponse_di" bpmnElement="Task_PrepareResponse">
        <dc:Bounds x="1320" y="210" width="100" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="1472" y="232" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1450" y="275" width="81" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- Flow connections -->
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="250" />
        <di:waypoint x="240" y="250" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="250" />
        <di:waypoint x="395" y="250" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_AuthSuccess_di" bpmnElement="Flow_AuthSuccess">
        <di:waypoint x="445" y="250" />
        <di:waypoint x="500" y="250" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="453" y="232" width="40" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_AuthFailed_di" bpmnElement="Flow_AuthFailed">
        <di:waypoint x="420" y="275" />
        <di:waypoint x="420" y="380" />
        <di:waypoint x="500" y="380" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="420" y="323" width="46" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="600" y="250" />
        <di:waypoint x="655" y="250" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="600" y="380" />
        <di:waypoint x="1220" y="380" />
        <di:waypoint x="1220" y="290" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_IdentificationRoute_di" bpmnElement="Flow_IdentificationRoute">
        <di:waypoint x="680" y="225" />
        <di:waypoint x="680" y="150" />
        <di:waypoint x="760" y="150" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="690" y="115" width="80" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_ListsRoute_di" bpmnElement="Flow_ListsRoute">
        <di:waypoint x="705" y="250" />
        <di:waypoint x="760" y="250" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="693" y="218" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_ScoringRoute_di" bpmnElement="Flow_ScoringRoute">
        <di:waypoint x="680" y="275" />
        <di:waypoint x="680" y="350" />
        <di:waypoint x="760" y="350" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="689" y="358" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="860" y="150" />
        <di:waypoint x="940" y="150" />
        <di:waypoint x="940" y="225" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="860" y="250" />
        <di:waypoint x="915" y="250" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
        <di:waypoint x="860" y="350" />
        <di:waypoint x="940" y="350" />
        <di:waypoint x="940" y="275" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_8_di" bpmnElement="Flow_8">
        <di:waypoint x="965" y="250" />
        <di:waypoint x="1020" y="250" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_9_di" bpmnElement="Flow_9">
        <di:waypoint x="1120" y="250" />
        <di:waypoint x="1170" y="250" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_10_di" bpmnElement="Flow_10">
        <di:waypoint x="1270" y="250" />
        <di:waypoint x="1320" y="250" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_11_di" bpmnElement="Flow_11">
        <di:waypoint x="1420" y="250" />
        <di:waypoint x="1472" y="250" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
};

// Получить встроенный BPMN шаблон по ключу
export const getBpmnTemplate = (templateKey: string): string => {
  switch(templateKey) {
    case 'clientVerification':
      return BPMN_TEMPLATES.CLIENT_VERIFICATION;
    case 'crafd-api-gateway':
      return BPMN_TEMPLATES.CRAFD_API_GATEWAY;
    default:
      return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Начало процесса">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="Базовый процесс">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="Завершение процесса">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="135" y="145" width="90" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="240" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="392" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="370" y="145" width="90" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" />
        <di:waypoint x="240" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" />
        <di:waypoint x="392" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
  }
}; 