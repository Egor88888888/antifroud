import React, { useEffect, useState, useRef } from 'react';
import ReactFlow, { 
  Background, 
  MiniMap, 
  Controls,
  Node, 
  Edge,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Card, 
  Typography, 
  Select, 
  Space, 
  Button, 
  Switch,
  Tooltip,
  Badge,
  Tag,
  Collapse,
  Spin,
  Empty
} from 'antd';
import {
  ApiOutlined,
  LinkOutlined,
  LockOutlined,
  UnlockOutlined,
  InfoCircleOutlined,
  ExportOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  EyeOutlined
} from '@ant-design/icons';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import '../styles/api-visualizer.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// Custom node for API endpoints
const ApiEndpointNode = ({ data, isConnectable }: { data: any; isConnectable: boolean }) => {
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return '#61affe';
      case 'POST': return '#49cc90';
      case 'PUT': return '#fca130';
      case 'DELETE': return '#f93e3e';
      case 'PATCH': return '#50e3c2';
      default: return '#ebebeb';
    }
  };

  return (
    <div className={`api-endpoint-node ${data.isSecure ? 'secure' : ''}`}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div className="method-badge" style={{ backgroundColor: getMethodColor(data.method) }}>
        {data.method}
      </div>
      <div className="endpoint-path">
        {data.path}
        {data.isSecure && <LockOutlined className="secure-icon" />}
      </div>
      <div className="endpoint-description">{data.description}</div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

// Define API endpoint types
interface ApiEndpoint {
  id: string;
  method: string;
  path: string;
  description: string;
  isSecure: boolean;
  tags?: string[];
  parameters?: any[];
  responses?: Record<string, any>;
}

interface ApiProcessVisualizerProps {
  title?: string;
  description?: string;
  endpoints?: ApiEndpoint[];
  apiSpec?: any; // OpenAPI spec object, alternative to endpoints
  showBpmn?: boolean; // Whether to also show BPMN visualization
  onSaveBpmn?: (xml: string) => void;
}

const DEFAULT_ENDPOINTS: ApiEndpoint[] = [
  { id: 'token', method: 'POST', path: '/token', description: 'Login For Access Token', isSecure: false },
  { id: 'users_me', method: 'GET', path: '/users/me', description: 'Read Users Me', isSecure: true },
  { id: 'health', method: 'GET', path: '/health', description: 'Health Check', isSecure: false },
  { id: 'client_id', method: 'GET', path: '/api/identification/{client_id}', description: 'Get Client Identification', isSecure: true },
  { id: 'client_lists', method: 'GET', path: '/api/lists/{client_id}', description: 'Check Client Lists', isSecure: true },
  { id: 'client_scoring', method: 'GET', path: '/api/scoring/{client_id}', description: 'Get Client Scoring', isSecure: true },
];

const ApiProcessVisualizer: React.FC<ApiProcessVisualizerProps> = ({
  title = 'API Процессы',
  description = 'Визуализация API-процессов системы',
  endpoints = DEFAULT_ENDPOINTS,
  apiSpec,
  showBpmn = true,
  onSaveBpmn
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [visualizationType, setVisualizationType] = useState<'flow' | 'bpmn'>('flow');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSecureOnly, setShowSecureOnly] = useState(false);
  const [bpmnDiagram, setBpmnDiagram] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bpmnModelerRef = useRef<any>(null);

  // Parse OpenAPI spec if provided
  useEffect(() => {
    if (apiSpec && Object.keys(apiSpec).length > 0) {
      const parsedEndpoints: ApiEndpoint[] = [];
      
      // Process the paths in the OpenAPI spec
      if (apiSpec.paths) {
        Object.keys(apiSpec.paths).forEach(path => {
          const pathObj = apiSpec.paths[path];
          
          Object.keys(pathObj).forEach(method => {
            if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
              const operation = pathObj[method];
              
              parsedEndpoints.push({
                id: `${method}_${path}`.replace(/[^\w]/g, '_'),
                method: method.toUpperCase(),
                path: path,
                description: operation.summary || operation.description || `${method.toUpperCase()} ${path}`,
                isSecure: operation.security && operation.security.length > 0,
                tags: operation.tags,
                parameters: operation.parameters,
                responses: operation.responses
              });
            }
          });
        });
        
        // Update endpoints with parsed data
        endpoints = parsedEndpoints;
      }
    }
    
    // Initialize nodes based on endpoints
    initializeGraph();
  }, [apiSpec]);

  // Initialize graph visualization
  const initializeGraph = () => {
    const filteredEndpoints = showSecureOnly 
      ? endpoints.filter(ep => ep.isSecure)
      : endpoints;
    
    // Create nodes from endpoints
    const newNodes: Node[] = filteredEndpoints.map((endpoint, index) => ({
      id: endpoint.id,
      type: 'apiEndpoint',
      data: {
        ...endpoint,
        label: `${endpoint.method} ${endpoint.path}`
      },
      position: { x: 200, y: 100 + index * 100 }
    }));

    // Create edges connecting nodes in a process flow
    const newEdges: Edge[] = [];
    
    // Connect auth flow
    const authEndpoint = filteredEndpoints.find(ep => ep.path === '/token');
    if (authEndpoint) {
      const secureEndpoints = filteredEndpoints.filter(ep => ep.isSecure);
      
      secureEndpoints.forEach(endpoint => {
        newEdges.push({
          id: `${authEndpoint.id}-${endpoint.id}`,
          source: authEndpoint.id,
          target: endpoint.id,
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { stroke: '#1890ff' },
          label: 'Requires token'
        });
      });
    }

    // Connect client-related endpoints in flow
    const clientIdEndpoint = filteredEndpoints.find(ep => ep.path.includes('/api/identification'));
    const clientListsEndpoint = filteredEndpoints.find(ep => ep.path.includes('/api/lists'));
    const clientScoringEndpoint = filteredEndpoints.find(ep => ep.path.includes('/api/scoring'));
    
    if (clientIdEndpoint && clientListsEndpoint) {
      newEdges.push({
        id: `${clientIdEndpoint.id}-${clientListsEndpoint.id}`,
        source: clientIdEndpoint.id,
        target: clientListsEndpoint.id,
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: '#722ed1' },
        label: 'Process flow'
      });
    }
    
    if (clientListsEndpoint && clientScoringEndpoint) {
      newEdges.push({
        id: `${clientListsEndpoint.id}-${clientScoringEndpoint.id}`,
        source: clientListsEndpoint.id,
        target: clientScoringEndpoint.id,
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: '#722ed1' },
        label: 'Process flow'
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  // Generate BPMN diagram from API endpoints or load from file
  const generateBpmnFromEndpoints = () => {
    setLoading(true);
    
    // Try to load BPMN file if it matches the title
    if (title.includes('CRAFD API Gateway')) {
      console.log('Loading CRAFD API Gateway BPMN template');
      
      // First try to get the template from the embedded templates in the DOM
      const embeddedTemplate = document.getElementById('bpmn-template-crafd-api-gateway');
      
      if (embeddedTemplate && embeddedTemplate.textContent) {
        console.log('Found embedded CRAFD API Gateway template');
        const xml = embeddedTemplate.textContent;
        
        console.log('BPMN XML loaded from embedded template, length:', xml.length);
        setBpmnDiagram(xml);
        
        setTimeout(() => {
          if (containerRef.current && xml) {
            try {
              if (!bpmnModelerRef.current) {
                console.log('Creating new BPMN modeler');
                const bpmnModeler = new BpmnModeler({
                  container: containerRef.current
                });
                bpmnModelerRef.current = bpmnModeler;
              }
              
              bpmnModelerRef.current.importXML(xml)
                .then(() => {
                  console.log('BPMN XML imported successfully from embedded template');
                  const canvas = bpmnModelerRef.current.get('canvas');
                  canvas.zoom('fit-viewport', 'auto');
                  setLoading(false);
                })
                .catch((err: any) => {
                  console.error('BPMN import error from embedded template:', err);
                  setLoading(false);
                  // Fallback to server loading
                  loadFromServer();
                });
            } catch (err: any) {
              console.error('BPMN initialization error with embedded template:', err);
              setLoading(false);
              // Fallback to server loading
              loadFromServer();
            }
          } else {
            console.error('Container ref or XML not available');
            setLoading(false);
          }
        }, 500);
      } else {
        // Fallback to loading from server if embedded template not found
        console.log('No embedded template found, loading from server');
        loadFromServer();
      }
    } else {
      // For other visualizations, generate the diagram on the fly
      generateDefaultBpmn();
    }
  };

  // Helper function to load from server
  function loadFromServer() {
    // Use the static BPMN template for CRAFD API Gateway with relative path
    fetch('./bpmn-templates/crafd-api-gateway.bpmn')
      .then(response => {
        if (!response.ok) {
          console.error(`Failed to load BPMN template from server, status: ${response.status}`);
          throw new Error(`Failed to load template: ${response.statusText}`);
        }
        return response.text();
      })
      .then(xml => {
        console.log('BPMN XML loaded successfully from server, length:', xml.length);
        setBpmnDiagram(xml);
        setTimeout(() => {
          if (containerRef.current && xml) {
            try {
              if (!bpmnModelerRef.current) {
                console.log('Creating new BPMN modeler');
                const bpmnModeler = new BpmnModeler({
                  container: containerRef.current
                });
                bpmnModelerRef.current = bpmnModeler;
              }
              
              bpmnModelerRef.current.importXML(xml)
                .then(() => {
                  console.log('BPMN XML imported successfully from server');
                  const canvas = bpmnModelerRef.current.get('canvas');
                  canvas.zoom('fit-viewport', 'auto');
                  setLoading(false);
                })
                .catch((err: any) => {
                  console.error('BPMN import error:', err);
                  setLoading(false);
                  // Fallback to generated diagram
                  generateDefaultBpmn();
                });
            } catch (err: any) {
              console.error('BPMN initialization error:', err);
              setLoading(false);
              // Fallback to generated diagram
              generateDefaultBpmn();
            }
          } else {
            console.error('Container ref or XML not available');
            setLoading(false);
          }
        }, 500);
      })
      .catch(error => {
        console.error('Error loading BPMN file from server:', error);
        // Fallback to generated diagram
        generateDefaultBpmn();
      });
  }

  // Generate a default BPMN diagram
  const generateDefaultBpmn = () => {
    // Create a BPMN diagram XML string
    const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_API" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="ApiProcess" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start API Process">
      <bpmn:outgoing>Flow_Start_Auth</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:task id="Task_Auth" name="Authentication&#10;POST /token">
      <bpmn:incoming>Flow_Start_Auth</bpmn:incoming>
      <bpmn:outgoing>Flow_Auth_Gateway</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_Start_Auth" sourceRef="StartEvent_1" targetRef="Task_Auth" />

    <bpmn:exclusiveGateway id="Gateway_Auth" name="Authentication status">
      <bpmn:incoming>Flow_Auth_Gateway</bpmn:incoming>
      <bpmn:outgoing>Flow_Auth_Success</bpmn:outgoing>
      <bpmn:outgoing>Flow_Auth_Failure</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:sequenceFlow id="Flow_Auth_Gateway" sourceRef="Task_Auth" targetRef="Gateway_Auth" />

    <bpmn:task id="Task_GetClient" name="Client Identification&#10;GET /api/identification/{client_id}">
      <bpmn:incoming>Flow_Auth_Success</bpmn:incoming>
      <bpmn:outgoing>Flow_Client_Lists</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_Auth_Success" name="Success" sourceRef="Gateway_Auth" targetRef="Task_GetClient" />

    <bpmn:task id="Task_ClientLists" name="Check Client Lists&#10;GET /api/lists/{client_id}">
      <bpmn:incoming>Flow_Client_Lists</bpmn:incoming>
      <bpmn:outgoing>Flow_Client_Scoring</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_Client_Lists" sourceRef="Task_GetClient" targetRef="Task_ClientLists" />

    <bpmn:task id="Task_ClientScoring" name="Get Client Scoring&#10;GET /api/scoring/{client_id}">
      <bpmn:incoming>Flow_Client_Scoring</bpmn:incoming>
      <bpmn:outgoing>Flow_End_Success</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_Client_Scoring" sourceRef="Task_ClientLists" targetRef="Task_ClientScoring" />

    <bpmn:endEvent id="EndEvent_Success" name="Process Complete">
      <bpmn:incoming>Flow_End_Success</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_End_Success" sourceRef="Task_ClientScoring" targetRef="EndEvent_Success" />

    <bpmn:endEvent id="EndEvent_Failure" name="Authentication Failed">
      <bpmn:incoming>Flow_Auth_Failure</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_Auth_Failure" name="Failure" sourceRef="Gateway_Auth" targetRef="EndEvent_Failure" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="ApiProcess">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="135" y="145" width="90" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Auth_di" bpmnElement="Task_Auth">
        <dc:Bounds x="240" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Auth_di" bpmnElement="Gateway_Auth" isMarkerVisible="true">
        <dc:Bounds x="395" y="95" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="375" y="65" width="90" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_GetClient_di" bpmnElement="Task_GetClient">
        <dc:Bounds x="500" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ClientLists_di" bpmnElement="Task_ClientLists">
        <dc:Bounds x="660" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ClientScoring_di" bpmnElement="Task_ClientScoring">
        <dc:Bounds x="820" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_Success_di" bpmnElement="EndEvent_Success">
        <dc:Bounds x="982" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="955" y="145" width="90" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_Failure_di" bpmnElement="EndEvent_Failure">
        <dc:Bounds x="402" y="232" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="376" y="275" width="90" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_Start_Auth_di" bpmnElement="Flow_Start_Auth">
        <di:waypoint x="188" y="120" />
        <di:waypoint x="240" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Auth_Gateway_di" bpmnElement="Flow_Auth_Gateway">
        <di:waypoint x="340" y="120" />
        <di:waypoint x="395" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Auth_Success_di" bpmnElement="Flow_Auth_Success">
        <di:waypoint x="445" y="120" />
        <di:waypoint x="500" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="460" y="100" width="35" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Client_Lists_di" bpmnElement="Flow_Client_Lists">
        <di:waypoint x="600" y="120" />
        <di:waypoint x="660" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Client_Scoring_di" bpmnElement="Flow_Client_Scoring">
        <di:waypoint x="760" y="120" />
        <di:waypoint x="820" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_End_Success_di" bpmnElement="Flow_End_Success">
        <di:waypoint x="920" y="120" />
        <di:waypoint x="982" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Auth_Failure_di" bpmnElement="Flow_Auth_Failure">
        <di:waypoint x="420" y="145" />
        <di:waypoint x="420" y="232" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="430" y="170" width="35" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    // Set the generated BPMN XML
    setBpmnDiagram(bpmnXml);
    
    setTimeout(() => {
      if (containerRef.current && bpmnDiagram) {
        try {
          if (!bpmnModelerRef.current) {
            const bpmnModeler = new BpmnModeler({
              container: containerRef.current
            });
            bpmnModelerRef.current = bpmnModeler;
          }
          
          bpmnModelerRef.current.importXML(bpmnXml).then(() => {
            const canvas = bpmnModelerRef.current.get('canvas');
            canvas.zoom('fit-viewport', 'auto');
            setLoading(false);
          }).catch((err: any) => {
            console.error('BPMN import error:', err);
            setLoading(false);
          });
        } catch (err: any) {
          console.error('BPMN initialization error:', err);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }, 500);
  };

  // Save BPMN diagram to file or callback
  const handleSaveBpmn = async () => {
    if (bpmnModelerRef.current && onSaveBpmn) {
      try {
        const { xml } = await bpmnModelerRef.current.saveXML({ format: true });
        onSaveBpmn(xml);
      } catch (err) {
        console.error('Error saving BPMN:', err);
      }
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Initialize visualization type
  useEffect(() => {
    if (visualizationType === 'flow') {
      initializeGraph();
    } else if (visualizationType === 'bpmn' && showBpmn) {
      generateBpmnFromEndpoints();
    }
  }, [visualizationType, showSecureOnly]);

  // Register custom node types
  const nodeTypes = {
    apiEndpoint: ApiEndpointNode
  };

  return (
    <div className={`api-process-visualizer ${isFullscreen ? 'fullscreen' : ''}`}>
      <Card
        title={
          <Space>
            <ApiOutlined />
            <Text strong>{title}</Text>
            {description && (
              <Tooltip title={description}>
                <InfoCircleOutlined />
              </Tooltip>
            )}
          </Space>
        }
        extra={
          <Space>
            <Select 
              defaultValue="flow" 
              style={{ width: 180 }} 
              onChange={val => setVisualizationType(val as 'flow' | 'bpmn')}
              value={visualizationType}
            >
              <Option value="flow">Граф процессов API</Option>
              {showBpmn && <Option value="bpmn">BPMN диаграмма</Option>}
            </Select>

            <Tooltip title={showSecureOnly ? "Показать все эндпоинты" : "Только защищенные эндпоинты"}>
              <Button 
                icon={showSecureOnly ? <LockOutlined /> : <UnlockOutlined />}
                onClick={() => setShowSecureOnly(!showSecureOnly)}
              />
            </Tooltip>

            {visualizationType === 'bpmn' && (
              <Button 
                icon={<ExportOutlined />} 
                onClick={handleSaveBpmn}
              >
                Сохранить BPMN
              </Button>
            )}

            <Button 
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
              onClick={toggleFullscreen}
            />
          </Space>
        }
        bodyStyle={{ padding: 0 }}
      >
        <div 
          style={{ 
            height: isFullscreen ? 'calc(100vh - 64px)' : '600px', 
            position: 'relative'
          }}
        >
          {loading && (
            <div className="loading-overlay">
              <Spin size="large" />
            </div>
          )}

          {visualizationType === 'flow' && (
            nodes.length > 0 ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
              >
                <MiniMap />
                <Controls />
                <Background />
              </ReactFlow>
            ) : (
              <Empty 
                description="Нет доступных API-эндпоинтов для отображения" 
                style={{ padding: '100px 0' }}
              />
            )
          )}

          {visualizationType === 'bpmn' && (
            <div 
              ref={containerRef} 
              className="bpmn-container"
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>
      </Card>

      <Collapse ghost style={{ marginTop: '16px' }}>
        <Panel header="Информация об API эндпоинтах" key="1">
          <div className="endpoint-info-grid">
            {endpoints.filter(ep => !showSecureOnly || ep.isSecure).map(endpoint => (
              <div key={endpoint.id} className="endpoint-info-card">
                <div className="endpoint-method">
                  <Tag color={
                    endpoint.method === 'GET' ? 'blue' :
                    endpoint.method === 'POST' ? 'green' :
                    endpoint.method === 'PUT' ? 'orange' :
                    endpoint.method === 'DELETE' ? 'red' : 'default'
                  }>
                    {endpoint.method}
                  </Tag>
                </div>
                <div className="endpoint-path">
                  {endpoint.path} {endpoint.isSecure && <LockOutlined />}
                </div>
                <div className="endpoint-description">{endpoint.description}</div>
              </div>
            ))}
          </div>
        </Panel>
      </Collapse>
    </div>
  );
};

export default ApiProcessVisualizer; 