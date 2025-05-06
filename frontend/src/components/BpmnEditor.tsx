import React, { useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import '../styles/bpmn-editor.css';
import { BpmnPropertiesPanelModule } from 'bpmn-js-properties-panel';
import { BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import { 
  Card, 
  Tooltip, 
  Space, 
  Button, 
  Row, 
  Col, 
  Divider, 
  Typography,
  Select,
  message,
  Drawer,
  Input,
  Tag,
  Switch,
  Collapse
} from 'antd';
import { 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  SaveOutlined, 
  UndoOutlined, 
  RedoOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// Default BPMN template
const defaultBpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
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

// Template options for different business processes
const templates = [
  { 
    name: 'Пустая диаграмма', 
    description: 'Начните с чистого листа',
    value: 'empty' 
  },
  { 
    name: 'Процесс проверки клиента', 
    description: 'Полный процесс верификации и проверки клиента',
    value: 'client-verification' 
  },
  { 
    name: 'Управление инцидентами', 
    description: 'Процесс обработки инцидентов мошенничества',
    value: 'incident-management' 
  },
  { 
    name: 'Оценка рисков', 
    description: 'Процесс многоуровневой оценки рисков клиента',
    value: 'risk-assessment' 
  },
];

interface BpmnEditorProps {
  processXml?: string;
  title?: string;
  description?: string;
  readOnly?: boolean;
  onSave?: (xml: string) => void;
}

// Custom error handling module
const safeRenderModule = {
  __init__: ['safeRenderer'],
  safeRenderer: ['type', function() {
    return {
      // @ts-ignore
      init: function(canvas) {
        // Patch the addMarker method to prevent errors with undefined layers
        const originalAddMarker = canvas.addMarker;
        // @ts-ignore
        canvas.addMarker = function(elementId, marker) {
          try {
            return originalAddMarker.call(this, elementId, marker);
          } catch (error) {
            console.warn('Error adding marker, safely handled:', error);
            return this;
          }
        };
        
        // Patch the removeMarker method
        const originalRemoveMarker = canvas.removeMarker;
        // @ts-ignore
        canvas.removeMarker = function(elementId, marker) {
          try {
            return originalRemoveMarker.call(this, elementId, marker);
          } catch (error) {
            console.warn('Error removing marker, safely handled:', error);
            return this;
          }
        };
      }
    };
  }]
};

const BpmnEditor: React.FC<BpmnEditorProps> = ({ 
  processXml = defaultBpmnXml,
  title = 'BPMN Редактор процессов',
  description = 'Редактор бизнес-процессов в нотации BPMN 2.0',
  readOnly = false,
  onSave
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const bpmnModelerRef = useRef<any>(null);
  const [isPropertiesPanelVisible, setIsPropertiesPanelVisible] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState<boolean>(false);
  const [templateValue, setTemplateValue] = useState<string>('');
  const [diagramName, setDiagramName] = useState<string>('Новый процесс');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (containerRef.current) {
      // Initialize BPMN modeler with safe rendering module
      const bpmnModeler = new BpmnModeler({
        container: containerRef.current,
        propertiesPanel: {
          parent: propertiesPanelRef.current
        },
        additionalModules: [
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          safeRenderModule // Add our safe render module
        ],
        moddleExtensions: {
          camunda: camundaModdleDescriptor
        },
        keyboard: {
          bindTo: window
        }
      });

      bpmnModelerRef.current = bpmnModeler;

      // Add a small delay before importing to ensure DOM is ready
      setTimeout(() => {
        try {
          bpmnModeler.importXML(processXml)
            .then(result => {
              if (result.warnings && result.warnings.length) {
                console.warn('BPMN import warnings:', result.warnings);
              }
              
              try {
                // Safely adjust the canvas
                const canvas = bpmnModeler.get('canvas');
                if (canvas && typeof canvas.zoom === 'function') {
                  canvas.zoom('fit-viewport', 'auto');
                }
              } catch (error) {
                console.warn('Error adjusting canvas zoom:', error);
              }
            })
            .catch(err => {
              console.error('Error importing BPMN XML:', err);
              message.error('Ошибка при загрузке диаграммы: ' + (err.message || 'Неизвестная ошибка'));
            });
        } catch (err) {
          console.error('Error rendering BPMN diagram:', err);
          message.error('Ошибка при загрузке диаграммы');
        }
      }, 300); // Increased delay to ensure DOM is fully rendered

      // Add event listener for selection changes with error handling
      try {
        const eventBus = bpmnModeler.get('eventBus');
        (eventBus as any).on('selection.changed', () => {
          // You can add logic here to react to selection changes
        });
      } catch (err) {
        console.warn('Error setting up event handlers:', err);
      }

      return () => {
        try {
          bpmnModeler.destroy();
        } catch (err) {
          console.warn('Error destroying BPMN modeler:', err);
        }
      };
    }
  }, [processXml]);

  // Handle zoom in
  const handleZoomIn = () => {
    if (bpmnModelerRef.current) {
      const canvas = bpmnModelerRef.current.get('canvas');
      canvas.zoom(canvas.zoom() + 0.1);
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (bpmnModelerRef.current) {
      const canvas = bpmnModelerRef.current.get('canvas');
      canvas.zoom(canvas.zoom() - 0.1);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle undo
  const handleUndo = () => {
    if (bpmnModelerRef.current) {
      bpmnModelerRef.current.get('commandStack').undo();
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (bpmnModelerRef.current) {
      bpmnModelerRef.current.get('commandStack').redo();
    }
  };

  // Handle save
  const handleSave = async () => {
    if (bpmnModelerRef.current) {
      try {
        const { xml } = await bpmnModelerRef.current.saveXML({ format: true });
        message.success('Диаграмма успешно сохранена');
        if (onSave) {
          onSave(xml);
        }
      } catch (err) {
        console.error('Error saving diagram:', err);
        message.error('Ошибка при сохранении диаграммы');
      }
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (bpmnModelerRef.current) {
      try {
        const { xml } = await bpmnModelerRef.current.saveXML({ format: true });
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${diagramName.replace(/\s+/g, '_')}.bpmn`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error downloading diagram:', err);
        message.error('Ошибка при скачивании диаграммы');
      }
    }
  };

  // Handle template selection
  const handleTemplateChange = (value: string) => {
    setTemplateValue(value);
    if (value === 'empty') {
      // Load empty diagram
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
      bpmnModelerRef.current.importXML(emptyXml);
    } else {
      // In a real application, you would load the template from the server
      message.info(`Загружен шаблон: ${templates.find(t => t.value === value)?.name}`);
    }
  };

  // Toggle grid display
  const handleGridToggle = (checked: boolean) => {
    setShowGrid(checked);
    if (bpmnModelerRef.current) {
      const canvas = bpmnModelerRef.current.get('canvas');
      if (checked) {
        canvas.addMarker('Process_1', 'show-grid');
      } else {
        canvas.removeMarker('Process_1', 'show-grid');
      }
    }
  };

  // Toggle dark mode
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  return (
    <div className={`bpmn-editor-container ${darkMode ? 'dark-mode' : ''}`}>
      <Card
        title={
          <Space>
            {title}
            {description && (
              <Tooltip title={description}>
                <InfoCircleOutlined />
              </Tooltip>
            )}
          </Space>
        }
        extra={
          <Space className="process-controls">
            <Button 
              icon={<UndoOutlined />} 
              onClick={handleUndo} 
              disabled={readOnly}
              title="Отменить действие"
            />
            <Button 
              icon={<RedoOutlined />} 
              onClick={handleRedo} 
              disabled={readOnly}
              title="Повторить действие"
            />
            <Divider type="vertical" />
            <Button 
              icon={<ZoomOutOutlined />} 
              onClick={handleZoomOut}
              title="Уменьшить масштаб"
            />
            <Button 
              icon={<ZoomInOutlined />} 
              onClick={handleZoomIn}
              title="Увеличить масштаб"
            />
            <Divider type="vertical" />
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => setIsSettingsVisible(true)}
              title="Настройки диаграммы"
            />
            <Button 
              icon={isPropertiesPanelVisible ? <CloseCircleOutlined /> : <EyeOutlined />} 
              onClick={() => setIsPropertiesPanelVisible(!isPropertiesPanelVisible)}
              title={isPropertiesPanelVisible ? "Скрыть панель свойств" : "Показать панель свойств"}
            />
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownload}
              title="Скачать диаграмму"
            />
            {!readOnly && (
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSave}
                title="Сохранить диаграмму"
              >
                Сохранить
              </Button>
            )}
            <Button 
              icon={<FullscreenOutlined />} 
              onClick={toggleFullscreen}
              title={isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
            />
          </Space>
        }
        bodyStyle={{ padding: 0 }}
        style={{ 
          width: '100%',
          height: isFullscreen ? '100vh' : 'auto',
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          zIndex: isFullscreen ? 1000 : 'auto',
        }}
      >
        <Row style={{ height: '600px' }}>
          <Col 
            span={isPropertiesPanelVisible ? 18 : 24} 
            style={{ height: '100%', transition: 'all 0.3s ease' }}
          >
            <div 
              ref={containerRef} 
              style={{ 
                height: '100%', 
                width: '100%',
                border: '1px solid #d9d9d9',
                borderRadius: '0 0 4px 4px',
                overflow: 'hidden'
              }} 
              className={showGrid ? 'with-grid' : ''}
            />
          </Col>
          {isPropertiesPanelVisible && (
            <Col span={6} style={{ height: '100%', borderLeft: '1px solid #d9d9d9', overflow: 'auto' }}>
              <div ref={propertiesPanelRef} style={{ height: '100%' }} />
            </Col>
          )}
        </Row>
      </Card>

      {/* Settings Drawer */}
      <Drawer
        title="Настройки диаграммы"
        placement="right"
        onClose={() => setIsSettingsVisible(false)}
        open={isSettingsVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={5}>Название диаграммы</Title>
            <Input 
              placeholder="Введите название" 
              value={diagramName} 
              onChange={(e) => setDiagramName(e.target.value)}
            />
          </div>

          <div>
            <Title level={5}>Шаблоны</Title>
            <Select
              style={{ width: '100%' }}
              placeholder="Выберите шаблон"
              value={templateValue}
              onChange={handleTemplateChange}
            >
              {templates.map(template => (
                <Option key={template.value} value={template.value}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>{template.name}</Text>
                    <Text type="secondary">{template.description}</Text>
                  </Space>
                </Option>
              ))}
            </Select>
            <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
              Выбор шаблона заменит текущую диаграмму
            </Text>
          </div>

          <Divider />

          <Collapse defaultActiveKey={['1']} ghost>
            <Panel header="Настройки отображения" key="1">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Показывать сетку</Text>
                  <Switch checked={showGrid} onChange={handleGridToggle} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Темный режим</Text>
                  <Switch checked={darkMode} onChange={handleDarkModeToggle} />
                </div>
              </Space>
            </Panel>
            <Panel header="Помощь и информация" key="2">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Paragraph>
                  <Text strong>Основные элементы BPMN:</Text>
                </Paragraph>
                <Space>
                  <Tag color="green">События</Tag>
                  <Tag color="blue">Задачи</Tag>
                  <Tag color="purple">Шлюзы</Tag>
                  <Tag color="orange">Потоки</Tag>
                </Space>
                <Paragraph style={{ marginTop: '8px' }}>
                  <Text>
                    Для добавления элемента перетащите его из палитры слева на диаграмму.
                    Для соединения элементов используйте инструмент "Соединение".
                  </Text>
                </Paragraph>
                <Button 
                  type="link" 
                  icon={<QuestionCircleOutlined />}
                  target="_blank"
                  href="https://camunda.com/bpmn/reference/"
                >
                  Справочник по BPMN
                </Button>
              </Space>
            </Panel>
          </Collapse>
        </Space>
      </Drawer>
    </div>
  );
};

export default BpmnEditor; 