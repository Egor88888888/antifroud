import React, { useEffect, useState } from 'react';
import { Card, Tabs, Typography, Spin, Alert } from 'antd';
import { InfoCircleOutlined, ClockCircleOutlined, SafetyOutlined } from '@ant-design/icons';
import BpmnEditor from '../components/BpmnEditor';
import { getBpmnTemplate } from '../utils/bpmnTemplates';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Fallback template with complete diagram info
const FALLBACK_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_0fr9mxs" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Начало процесса">
      <bpmn:outgoing>SequenceFlow_1yjbz40</bpmn:outgoing>
      </bpmn:startEvent>
    <bpmn:task id="Task_1" name="Проверка клиента">
      <bpmn:incoming>SequenceFlow_1yjbz40</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_0h5w0cd</bpmn:outgoing>
      </bpmn:task>
    <bpmn:sequenceFlow id="SequenceFlow_1yjbz40" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:endEvent id="EndEvent_1" name="Завершение процесса">
      <bpmn:incoming>SequenceFlow_0h5w0cd</bpmn:incoming>
      </bpmn:endEvent>
    <bpmn:sequenceFlow id="SequenceFlow_0h5w0cd" sourceRef="Task_1" targetRef="EndEvent_1" />
    </bpmn:process>
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="157" y="142" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="270" y="77" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_1yjbz40_di" bpmnElement="SequenceFlow_1yjbz40">
        <di:waypoint x="215" y="117" />
        <di:waypoint x="270" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="432" y="99" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="405" y="142" width="90" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_0h5w0cd_di" bpmnElement="SequenceFlow_0h5w0cd">
        <di:waypoint x="370" y="117" />
        <di:waypoint x="432" y="117" />
      </bpmndi:BPMNEdge>
      </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

// Process template paths
// const PROCESS_TEMPLATES = {
  clientVerification: './bpmn-templates/client-verification.bpmn',
  fraudDetection: './bpmn-templates/fraud-detection.bpmn',
  disputeResolution: './bpmn-templates/dispute-resolution.bpmn'
};

// Pre-loading templates to ensure they're ready when needed
const preloadedTemplates = {
  clientVerification: FALLBACK_TEMPLATE,
  fraudDetection: FALLBACK_TEMPLATE,
  disputeResolution: FALLBACK_TEMPLATE
};

const ProcessVisualization: React.FC = () => {
  const [currentProcess, setCurrentProcess] = useState<string>('clientVerification');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processXml, setProcessXml] = useState<string>(FALLBACK_TEMPLATE);

  // Load current template based on selection using hardcoded templates
  const loadCurrentTemplate = (templateKey: string) => {
    setLoading(true);
    setError(null);
    
    console.log(`Loading template for: ${templateKey}`);
    
    try {
      // Get the hardcoded BPMN template
      const templateData = getBpmnTemplate(templateKey);
      
      if (templateData && typeof templateData === 'string' && 
          templateData.includes('bpmn:definitions') && 
          templateData.includes('bpmndi:BPMNDiagram')) {
        // Update the preloaded template and current XML
        preloadedTemplates[templateKey as keyof typeof preloadedTemplates] = templateData;
        setProcessXml(templateData);
            setError(null);
        console.log(`Successfully loaded BPMN template: ${templateKey}`);
        } else {
        console.warn(`Template ${templateKey} missing required BPMN elements`);
        setProcessXml(FALLBACK_TEMPLATE);
        setError(`Структура шаблона ${templateKey} некорректна. Используется базовый шаблон.`);
      }
    } catch (err) {
      console.error(`Error loading template ${templateKey}:`, err);
      setProcessXml(FALLBACK_TEMPLATE);
      setError(`Ошибка при загрузке диаграммы ${templateKey}. Используется базовый шаблон.`);
    }
    
    setLoading(false);
  };
  
  // Handle tab change
  const handleTabChange = (key: string) => {
    setCurrentProcess(key);
    loadCurrentTemplate(key);
  };

  // Initial template loading
  useEffect(() => {
    loadCurrentTemplate(currentProcess);
  }, [currentProcess]);

  // Handle diagram save functionality
  const handleSaveDiagram = (xml: string) => {
    // Here you would typically send this to a backend API
    console.log('Diagram saved:', xml.substring(0, 100) + '...');
  };

  // Process titles and descriptions
  const processInfo = {
    clientVerification: {
      title: 'Процесс верификации клиента',
      description: 'Полный процесс проверки и верификации клиента, включая проверку документов, анализ рисков и принятие решения.'
    },
    fraudDetection: {
      title: 'Обнаружение мошенничества',
      description: 'Процесс обнаружения подозрительных операций и потенциального мошенничества.'
    },
    disputeResolution: {
      title: 'Разрешение споров',
      description: 'Процесс разрешения споров и претензий клиентов.'
    }
  };

  return (
    <div className="process-visualization-container">
      <Card
        title={<Title level={4}>Визуализация бизнес-процессов</Title>}
        style={{ marginBottom: 16 }}
      >
        <Tabs
          activeKey={currentProcess}
          onChange={handleTabChange}
          tabPosition="top"
        >
          <TabPane
            tab={
              <span>
                <SafetyOutlined /> Верификация клиента
              </span>
            }
            key="clientVerification"
          >
            {loading && currentProcess === 'clientVerification' ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: '20px' }}>
                  <Text>Загрузка процесса...</Text>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <Alert
                    message="Предупреждение"
                    description={error}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    closable
                  />
                )}
                <BpmnEditor
                  title={processInfo.clientVerification.title}
                  description={processInfo.clientVerification.description}
                  processXml={processXml}
                  readOnly={true}
                  onSave={handleSaveDiagram}
                />
              </>
            )}
          </TabPane>
          <TabPane
            tab={
              <span>
                <InfoCircleOutlined /> Выявление мошенничества
              </span>
            }
            key="fraudDetection"
          >
            {loading && currentProcess === 'fraudDetection' ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: '20px' }}>
                  <Text>Загрузка процесса...</Text>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <Alert
                    message="Предупреждение"
                    description={error}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    closable
                  />
                )}
                <BpmnEditor
                  title={processInfo.fraudDetection.title}
                  description={processInfo.fraudDetection.description}
                  processXml={processXml}
                  readOnly={true}
                  onSave={handleSaveDiagram}
                />
              </>
            )}
          </TabPane>
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined /> Разрешение споров
              </span>
            }
            key="disputeResolution"
          >
            {loading && currentProcess === 'disputeResolution' ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: '20px' }}>
                  <Text>Загрузка процесса...</Text>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <Alert
                    message="Предупреждение"
                    description={error}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    closable
                  />
                )}
                <BpmnEditor
                  title={processInfo.disputeResolution.title}
                  description={processInfo.disputeResolution.description}
                  processXml={processXml}
                  readOnly={true}
                  onSave={handleSaveDiagram}
                />
              </>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProcessVisualization; 