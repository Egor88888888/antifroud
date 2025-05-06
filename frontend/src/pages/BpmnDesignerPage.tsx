import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Typography, 
  Card, 
  Tabs, 
  Alert, 
  Space, 
  Button, 
  notification,
  Spin,
  Divider,
  List,
  Tag
} from 'antd';
import {
  BookOutlined,
  ToolOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  CloudUploadOutlined,
  PlusOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import BpmnEditor from '../components/BpmnEditor';
import ProcessSimulator from '../components/ProcessSimulator';
import axios from 'axios';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// Fallback default diagram with complete structure
const DEFAULT_DIAGRAM = `<?xml version="1.0" encoding="UTF-8"?>
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

// Example process templates
const processTemplates = [
  {
    id: 'client-verification',
    name: 'Процесс верификации клиента',
    description: 'Полный процесс проверки и верификации клиента, включая проверку документов, анализ рисков и принятие решения.',
    tags: ['Основные процессы', 'Верификация'],
    lastModified: '2023-11-12',
    path: '/bpmn-templates/client-verification.bpmn'
  },
  {
    id: 'fraud-detection',
    name: 'Обнаружение мошенничества',
    description: 'Процесс обнаружения подозрительных операций и потенциального мошенничества.',
    tags: ['Безопасность', 'Мониторинг'],
    lastModified: '2023-11-10',
    path: '/bpmn-templates/fraud-detection.bpmn'
  },
  {
    id: 'risk-assessment',
    name: 'Оценка рисков клиента',
    description: 'Многоуровневый процесс оценки рисков, связанных с клиентом.',
    tags: ['Аналитика', 'Управление рисками'],
    lastModified: '2023-11-08',
    path: '/bpmn-templates/risk-assessment.bpmn'
  }
];

const BpmnDesignerPage: React.FC = () => {
  const [activeKey, setActiveKey] = useState('editor');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentXml, setCurrentXml] = useState<string>(DEFAULT_DIAGRAM);
  const [currentProcess, setCurrentProcess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Pre-fetch template to validate before using it
  const validateAndLoadTemplate = async (template: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch template with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await axios.get(template.path, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Validate BPMN content
      if (response.data && 
          typeof response.data === 'string' && 
          response.data.includes('bpmn:definitions') && 
          response.data.includes('bpmndi:BPMNDiagram')) {
        
        setCurrentXml(response.data);
        setCurrentProcess(template);
        setActiveKey('editor');
        
        notification.success({
          message: 'Шаблон загружен',
          description: `Шаблон "${template.name}" успешно загружен в редактор.`,
          placement: 'bottomRight'
        });
      } else {
        console.warn('BPMN XML is missing diagram information, using fallback');
        setCurrentXml(DEFAULT_DIAGRAM);
        setCurrentProcess({
          ...template,
          name: template.name + ' (базовый шаблон)'
        });
        setActiveKey('editor');
        setError('Диаграмма не содержит данных для визуализации. Используется базовый шаблон.');
        
        notification.warning({
          message: 'Проблема с шаблоном',
          description: 'Шаблон не содержит данных для визуализации. Используется базовый шаблон.',
          placement: 'bottomRight'
        });
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setCurrentXml(DEFAULT_DIAGRAM);
      setCurrentProcess({
        ...template,
        name: template.name + ' (ошибка загрузки)'
      });
      setActiveKey('editor');
      setError('Не удалось загрузить шаблон. Используется базовый шаблон.');
      
      notification.error({
        message: 'Ошибка загрузки',
        description: 'Не удалось загрузить шаблон. Используется базовый шаблон.',
        placement: 'bottomRight'
      });
    } finally {
      // Delay setting loading to false to prevent flickering
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  // Handle template selection
  const handleSelectTemplate = (template: any) => {
    validateAndLoadTemplate(template);
  };

  // Handle creating new process
  const handleNewProcess = () => {
    setCurrentXml(DEFAULT_DIAGRAM);
    setCurrentProcess(null);
    setActiveKey('editor');
    setError(null);
  };

  // Handle saving process with error prevention
  const handleSaveProcess = (xml: string) => {
    try {
      if (xml && typeof xml === 'string') {
        setCurrentXml(xml);
        // In a real application, you would save the XML to the server
        notification.success({
          message: 'Процесс сохранен',
          description: 'Бизнес-процесс успешно сохранен в системе.',
          placement: 'bottomRight'
        });
      } else {
        throw new Error("Invalid XML format");
      }
    } catch (error) {
      console.error("Error saving BPMN diagram:", error);
      notification.error({
        message: 'Ошибка сохранения',
        description: 'Не удалось сохранить процесс. Пожалуйста, попробуйте снова.',
        placement: 'bottomRight'
      });
    }
  };

  // Handle running simulation
  const handleRunSimulation = () => {
    setActiveKey('simulator');
    notification.info({
      message: 'Запуск симулятора',
      description: 'Переход к симуляции выполнения процесса.',
      placement: 'bottomRight'
    });
  };

  // Render template list
  const renderTemplateList = () => (
    <List
      itemLayout="vertical"
      dataSource={processTemplates}
      renderItem={item => (
        <List.Item
          key={item.id}
          actions={[
            <Button 
              key="use" 
              type="primary" 
              onClick={() => handleSelectTemplate(item)}
            >
              Использовать
            </Button>
          ]}
          extra={
            <Space direction="vertical" align="end">
              <Text type="secondary">Последнее изменение: {item.lastModified}</Text>
              <Space>
                {item.tags.map(tag => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </Space>
            </Space>
          }
        >
          <List.Item.Meta
            title={<Text strong>{item.name}</Text>}
            description={item.description}
          />
        </List.Item>
      )}
    />
  );

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>BPMN Дизайнер процессов</Title>
      <Paragraph>
        Создавайте и редактируйте бизнес-процессы с помощью мощного BPMN-редактора.
        Используйте готовые шаблоны или создавайте свои собственные процессы с нуля.
      </Paragraph>

      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        tabBarExtraContent={
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleNewProcess}
            >
              Новый процесс
            </Button>
            <Button icon={<CloudUploadOutlined />}>
              Импортировать
            </Button>
            {activeKey === 'editor' && (
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                onClick={handleRunSimulation}
              >
                Запустить симуляцию
              </Button>
            )}
          </Space>
        }
      >
        <TabPane 
          tab={
            <span>
              <ToolOutlined />
              Редактор
            </span>
          } 
          key="editor"
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: '20px' }}>
                <Text>Загрузка процесса...</Text>
              </div>
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              <Col span={24}>
                {error && (
                  <Alert
                    message="Предупреждение"
                    description={error}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    closable
                    onClose={() => setError(null)}
                  />
                )}
                <BpmnEditor 
                  title={currentProcess ? currentProcess.name : 'Новый процесс'} 
                  description={currentProcess ? currentProcess.description : 'Создайте новый бизнес-процесс'}
                  processXml={currentXml}
                  onSave={handleSaveProcess}
                />
              </Col>
            </Row>
          )}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <PlayCircleOutlined />
              Симулятор
            </span>
          } 
          key="simulator"
        >
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <ProcessSimulator 
                processXml={currentXml}
                title={currentProcess ? `Симуляция: ${currentProcess.name}` : 'Симуляция процесса'}
                description="Визуализация выполнения бизнес-процесса в реальном времени"
              />
            </Col>
          </Row>
        </TabPane>
        <TabPane 
          tab={
            <span>
              <AppstoreOutlined />
              Шаблоны
            </span>
          } 
          key="templates"
        >
          <Card>
            <Title level={4}>Готовые шаблоны процессов</Title>
            <Paragraph>
              Выберите один из готовых шаблонов для быстрого создания бизнес-процесса.
              Все шаблоны можно настроить под ваши потребности.
            </Paragraph>
            <Divider />
            {renderTemplateList()}
          </Card>
        </TabPane>
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              Документация
            </span>
          } 
          key="docs"
        >
          <Card>
            <Title level={4}>Документация по BPMN</Title>
            <Paragraph>
              Business Process Model and Notation (BPMN) — графическая нотация для моделирования бизнес-процессов.
              Она предоставляет набор стандартных иконок и элементов для описания процессов любой сложности.
            </Paragraph>
            
            <Title level={5}>Основные элементы BPMN</Title>
            <List
              bordered
              dataSource={[
                { title: 'События (Events)', description: 'Обозначают начало, конец или промежуточные события в процессе', icon: '⭕' },
                { title: 'Задачи (Tasks)', description: 'Описывают различные типы работ, которые выполняются в процессе', icon: '🔷' },
                { title: 'Шлюзы (Gateways)', description: 'Управляют разветвлением и соединением потоков процесса', icon: '◇' },
                { title: 'Потоки (Flows)', description: 'Соединяют элементы процесса и показывают порядок их выполнения', icon: '➡️' },
                { title: 'Артефакты (Artifacts)', description: 'Предоставляют дополнительную информацию о процессе', icon: '📝' }
              ]}
              renderItem={item => (
                <List.Item>
                  <Space>
                    <Text style={{ fontSize: '24px' }}>{item.icon}</Text>
                    <div>
                      <Text strong>{item.title}</Text>
                      <br />
                      <Text type="secondary">{item.description}</Text>
                    </div>
                  </Space>
                </List.Item>
              )}
            />
            
            <Divider />
            
            <Space>
              <Button 
                type="primary" 
                icon={<BookOutlined />}
                href="https://www.bpmn.org/" 
                target="_blank"
              >
                Официальная документация BPMN
              </Button>
              <Button 
                icon={<FileTextOutlined />}
                href="https://camunda.com/bpmn/reference/" 
                target="_blank"
              >
                Справочник по элементам BPMN
              </Button>
            </Space>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default BpmnDesignerPage; 