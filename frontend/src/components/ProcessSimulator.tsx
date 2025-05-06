import React, { useEffect, useRef, useState } from 'react';
import BpmnViewer from 'bpmn-js/lib/Viewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import '../styles/process-simulator.css';
import { 
  Card, 
  Button, 
  Space, 
  Slider, 
  Row, 
  Col, 
  Typography, 
  Timeline,
  Tag,
  Statistic,
  Progress,
  Empty,
  Select,
  Drawer,
  Alert,
  Divider,
  Tooltip
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Types for simulation nodes and paths
interface SimulationNode {
  id: string;
  name: string;
  type: string;
  status: 'waiting' | 'active' | 'completed' | 'error';
  executionTime?: number;
  startTime?: number;
  endTime?: number;
}

interface SimulationPath {
  id: string;
  sourceId: string;
  targetId: string;
  status: 'inactive' | 'active' | 'completed';
}

interface SimulationEvent {
  id: string;
  timestamp: number;
  nodeId: string;
  type: 'start' | 'complete' | 'error';
  message: string;
}

interface ProcessSimulatorProps {
  processXml: string;
  title?: string;
  description?: string;
}

// Mock simulation scenarios
const simulationScenarios = [
  { 
    id: 'normal', 
    name: 'Нормальный путь', 
    description: 'Симуляция стандартного пути выполнения без ошибок' 
  },
  { 
    id: 'error', 
    name: 'Ошибка валидации', 
    description: 'Симуляция процесса с ошибкой валидации данных' 
  },
  { 
    id: 'timeout', 
    name: 'Превышение времени', 
    description: 'Симуляция с превышением времени ожидания'
  },
  { 
    id: 'parallel', 
    name: 'Параллельные пути', 
    description: 'Симуляция с параллельным выполнением задач'
  }
];

const ProcessSimulator: React.FC<ProcessSimulatorProps> = ({ 
  processXml,
  title = 'Симулятор процесса',
  description = 'Визуализация выполнения бизнес-процесса'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bpmnViewerRef = useRef<any>(null);
  
  const [isSettingsVisible, setIsSettingsVisible] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(50);
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [currentScenario, setCurrentScenario] = useState<string>('normal');
  const [simulationNodes, setSimulationNodes] = useState<SimulationNode[]>([]);
  const [simulationPaths, setSimulationPaths] = useState<SimulationPath[]>([]);
  const [simulationEvents, setSimulationEvents] = useState<SimulationEvent[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalSimulationTime, setTotalSimulationTime] = useState<number>(0);
  const [simulationStats, setSimulationStats] = useState<any>({
    totalNodes: 0,
    completedNodes: 0,
    averageExecutionTime: 0,
    errorRate: 0
  });

  // Initialize BPMN viewer
  useEffect(() => {
    if (containerRef.current) {
      // Initialize BPMN viewer
      const bpmnViewer = new BpmnViewer({
        container: containerRef.current
      });

      bpmnViewerRef.current = bpmnViewer;

      // Import XML with delay to ensure DOM is ready
      setTimeout(() => {
        try {
          bpmnViewer.importXML(processXml)
            .then(() => {
              // Center the view after successful import
              const canvas = bpmnViewer.get('canvas') as any;
              canvas.zoom('fit-viewport');
              
              // Parse the diagram to extract nodes and connections
              parseProcessDiagram();
            })
            .catch((err: any) => {
              console.error('Error importing BPMN XML:', err);
            });
        } catch (err) {
          console.error('Error rendering BPMN diagram:', err);
        }
      }, 300);

      return () => {
        try {
          bpmnViewer.destroy();
        } catch (err) {
          console.warn('Error destroying BPMN viewer:', err);
        }
      };
    }
  }, [processXml]);

  // Parse the process diagram to extract nodes and paths
  const parseProcessDiagram = () => {
    if (!bpmnViewerRef.current) return;

    const elementRegistry = bpmnViewerRef.current.get('elementRegistry');
    const nodes: SimulationNode[] = [];
    const paths: SimulationPath[] = [];

    // Get all elements
    elementRegistry.forEach((element: any) => {
      // Handle different types of nodes
      if (element.type === 'bpmn:StartEvent') {
        nodes.push({
          id: element.id,
          name: element.businessObject.name || 'Start Event',
          type: 'startEvent',
          status: 'waiting'
        });
      } else if (element.type === 'bpmn:EndEvent') {
        nodes.push({
          id: element.id,
          name: element.businessObject.name || 'End Event',
          type: 'endEvent',
          status: 'waiting'
        });
      } else if (element.type === 'bpmn:Task' || element.type === 'bpmn:UserTask' || 
                 element.type === 'bpmn:ServiceTask' || element.type === 'bpmn:ScriptTask') {
        nodes.push({
          id: element.id,
          name: element.businessObject.name || 'Task',
          type: 'task',
          status: 'waiting',
          executionTime: Math.floor(Math.random() * 5000) + 1000 // Random execution time between 1-6 seconds
        });
      } else if (element.type === 'bpmn:ExclusiveGateway' || element.type === 'bpmn:ParallelGateway') {
        nodes.push({
          id: element.id,
          name: element.businessObject.name || (element.type === 'bpmn:ExclusiveGateway' ? 'Exclusive Gateway' : 'Parallel Gateway'),
          type: element.type === 'bpmn:ExclusiveGateway' ? 'exclusiveGateway' : 'parallelGateway',
          status: 'waiting'
        });
      }

      // Handle sequence flows (paths)
      if (element.type === 'bpmn:SequenceFlow') {
        paths.push({
          id: element.id,
          sourceId: element.source.id,
          targetId: element.target.id,
          status: 'inactive'
        });
      }
    });

    setSimulationNodes(nodes);
    setSimulationPaths(paths);
    setSimulationStats({
      totalNodes: nodes.length,
      completedNodes: 0,
      averageExecutionTime: 0,
      errorRate: 0
    });
    
    // Calculate estimated total simulation time
    const totalTime = nodes.reduce((total, node) => {
      return total + (node.executionTime || 0);
    }, 0);
    setTotalSimulationTime(totalTime);
  };

  // Highlight a node in the viewer
  const highlightNode = (nodeId: string, className: string) => {
    if (!bpmnViewerRef.current) return;
    
    const canvas = bpmnViewerRef.current.get('canvas') as any;
    
    // Clear existing highlights first if highlighting a new node
    if (className === 'highlight-active') {
      simulationNodes.forEach(node => {
        if (node.status === 'active' && node.id !== nodeId) {
          canvas.removeMarker(node.id, 'highlight-active');
        }
      });
    }
    
    canvas.addMarker(nodeId, className);
  };

  // Highlight a path in the viewer
  const highlightPath = (pathId: string, className: string) => {
    if (!bpmnViewerRef.current) return;
    
    const canvas = bpmnViewerRef.current.get('canvas') as any;
    canvas.addMarker(pathId, className);
  };

  // Run simulation step - this handles the actual simulation logic
  const runSimulationStep = (initialRun = false) => {
    if (initialRun) {
      // Reset all nodes and paths
      setSimulationNodes(prev => prev.map(node => ({
        ...node,
        status: 'waiting',
        startTime: undefined,
        endTime: undefined
      })));
      
      setSimulationPaths(prev => prev.map(path => ({
        ...path,
        status: 'inactive'
      })));
      
      setSimulationEvents([]);
      setCurrentTime(0);
      setSimulationProgress(0);
      setSimulationStats({
        totalNodes: simulationNodes.length,
        completedNodes: 0,
        averageExecutionTime: 0,
        errorRate: 0
      });
      
      // Clear all markers from the diagram
      if (bpmnViewerRef.current) {
        const canvas = bpmnViewerRef.current.get('canvas');
        simulationNodes.forEach(node => {
          canvas.removeMarker(node.id, 'highlight-waiting');
          canvas.removeMarker(node.id, 'highlight-active');
          canvas.removeMarker(node.id, 'highlight-completed');
          canvas.removeMarker(node.id, 'highlight-error');
        });
        
        simulationPaths.forEach(path => {
          canvas.removeMarker(path.id, 'highlight-path-inactive');
          canvas.removeMarker(path.id, 'highlight-path-active');
          canvas.removeMarker(path.id, 'highlight-path-completed');
        });
      }
      
      // Start from the start event
      const startNode = simulationNodes.find(node => node.type === 'startEvent');
      if (startNode) {
        // Update the start node status
        setSimulationNodes(prev => 
          prev.map(node => 
            node.id === startNode.id 
              ? { ...node, status: 'active', startTime: 0 } 
              : node
          )
        );
        
        // Add event
        setSimulationEvents(prev => [
          ...prev,
          {
            id: `event-${Date.now()}`,
            timestamp: 0,
            nodeId: startNode.id,
            type: 'start',
            message: `Начало процесса: ${startNode.name}`
          }
        ]);
        
        // Highlight the start node
        highlightNode(startNode.id, 'highlight-active');
        
        // Schedule completion of start node
        setTimeout(() => {
          completeNode(startNode.id);
        }, 1000);
      }
    } else {
      // Here you would implement the next steps in your simulation
      // This is just a basic implementation - in a real app, this would be more complex
      // based on the actual process model
      
      // Find active nodes
      const activeNodes = simulationNodes.filter(node => node.status === 'active');
      
      // If no active nodes, but still in progress, find next nodes to activate
      if (activeNodes.length === 0) {
        const completedNodeIds = simulationNodes
          .filter(node => node.status === 'completed')
          .map(node => node.id);
        
        // Find paths from completed nodes
        const eligiblePaths = simulationPaths.filter(path => 
          completedNodeIds.includes(path.sourceId) && 
          path.status !== 'completed'
        );
        
        // Activate target nodes of eligible paths
        eligiblePaths.forEach(path => {
          const targetNode = simulationNodes.find(node => node.id === path.targetId);
          if (targetNode && targetNode.status === 'waiting') {
            activateNode(targetNode.id, path.id);
          }
        });
      }
      
      // Update progress
      const completedNodes = simulationNodes.filter(node => 
        node.status === 'completed' || node.status === 'error'
      ).length;
      
      const progress = Math.min(
        100, 
        Math.round((completedNodes / simulationNodes.length) * 100)
      );
      
      setSimulationProgress(progress);
      
      // Update simulation stats
      const completedNodesWithTime = simulationNodes.filter(
        node => node.status === 'completed' && node.startTime !== undefined && node.endTime !== undefined
      );
      
      const errorNodes = simulationNodes.filter(node => node.status === 'error');
      
      const totalExecutionTime = completedNodesWithTime.reduce(
        (total, node) => total + ((node.endTime || 0) - (node.startTime || 0)), 
        0
      );
      
      setSimulationStats({
        totalNodes: simulationNodes.length,
        completedNodes: completedNodes,
        averageExecutionTime: completedNodesWithTime.length > 0 
          ? totalExecutionTime / completedNodesWithTime.length 
          : 0,
        errorRate: simulationNodes.length > 0 
          ? (errorNodes.length / simulationNodes.length) * 100 
          : 0
      });
      
      // Check if simulation is complete
      if (progress === 100) {
        setIsSimulationRunning(false);
        
        // Add completion event
        setSimulationEvents(prev => [
          ...prev,
          {
            id: `event-${Date.now()}`,
            timestamp: currentTime,
            nodeId: 'process',
            type: 'complete',
            message: `Процесс завершен. Общее время: ${formatTime(currentTime)}`
          }
        ]);
      }
    }
  };

  // Activate a node in the simulation
  const activateNode = (nodeId: string, pathId?: string) => {
    const time = currentTime;
    
    // Update node status
    setSimulationNodes(prev => 
      prev.map(node => 
        node.id === nodeId 
          ? { ...node, status: 'active', startTime: time } 
          : node
      )
    );
    
    // Update path status if provided
    if (pathId) {
      setSimulationPaths(prev => 
        prev.map(path => 
          path.id === pathId 
            ? { ...path, status: 'active' } 
            : path
        )
      );
      
      // Highlight the path
      highlightPath(pathId, 'highlight-path-active');
    }
    
    // Add event
    const nodeInfo = simulationNodes.find(n => n.id === nodeId);
    if (nodeInfo) {
      setSimulationEvents(prev => [
        ...prev,
        {
          id: `event-${Date.now()}`,
          timestamp: time,
          nodeId: nodeId,
          type: 'start',
          message: `Начало выполнения: ${nodeInfo.name}`
        }
      ]);
    }
    
    // Highlight the node
    highlightNode(nodeId, 'highlight-active');
    
    // Schedule node completion based on execution time
    const nodeToActivate = simulationNodes.find(n => n.id === nodeId);
    const executionTime = nodeToActivate?.executionTime || 2000;
    const simulationSpeedFactor = simulationSpeed / 50; // 50 is the default speed
    const adjustedTime = executionTime / simulationSpeedFactor;
    
    // Determine if this node should error based on scenario
    let shouldError = false;
    
    if (currentScenario === 'error' && nodeToActivate?.type === 'task') {
      // In error scenario, make some tasks fail
      shouldError = Math.random() < 0.3; // 30% chance of error
    } else if (currentScenario === 'timeout' && nodeToActivate?.type === 'task') {
      // In timeout scenario, make some tasks take longer
      shouldError = Math.random() < 0.2; // 20% chance of timeout
    }
    
    setTimeout(() => {
      if (shouldError) {
        errorNode(nodeId);
      } else {
        completeNode(nodeId);
      }
    }, adjustedTime);
  };

  // Complete a node in the simulation
  const completeNode = (nodeId: string) => {
    const time = currentTime + 
      (simulationNodes.find(n => n.id === nodeId)?.executionTime || 0) / (simulationSpeed / 50);
    
    // Update node status
    setSimulationNodes(prev => 
      prev.map(node => 
        node.id === nodeId 
          ? { ...node, status: 'completed', endTime: time } 
          : node
      )
    );
    
    // Update outgoing paths
    const outgoingPaths = simulationPaths.filter(path => path.sourceId === nodeId);
    outgoingPaths.forEach(path => {
      setSimulationPaths(prev => 
        prev.map(p => 
          p.id === path.id 
            ? { ...p, status: 'completed' } 
            : p
        )
      );
      
      // Highlight the path
      highlightPath(path.id, 'highlight-path-completed');
      
      // Activate target node
      const targetNode = simulationNodes.find(node => node.id === path.targetId);
      if (targetNode && targetNode.status === 'waiting') {
        // For exclusive gateways in different scenarios, choose different paths
        if (targetNode.type === 'exclusiveGateway' && currentScenario === 'error') {
          // In error scenario, choose error path
          const errorPath = simulationPaths.find(p => 
            p.sourceId === targetNode.id && 
            p.targetId.includes('error')
          );
          
          if (errorPath) {
            setTimeout(() => {
              activateNode(targetNode.id, path.id);
              setTimeout(() => {
                completeNode(targetNode.id);
                // Only activate the error path
                const errorTargetNode = simulationNodes.find(n => n.id === errorPath.targetId);
                if (errorTargetNode) {
                  activateNode(errorTargetNode.id, errorPath.id);
                }
              }, 1000);
            }, 500);
            return;
          }
        }
        
        // Normal path activation
        setTimeout(() => {
          activateNode(targetNode.id, path.id);
        }, 500);
      }
    });
    
    // Add event
    const node = simulationNodes.find(n => n.id === nodeId);
    if (node) {
      setSimulationEvents(prev => [
        ...prev,
        {
          id: `event-${Date.now()}`,
          timestamp: time,
          nodeId: nodeId,
          type: 'complete',
          message: `Завершено: ${node.name}`
        }
      ]);
    }
    
    // Highlight the node as completed
    highlightNode(nodeId, 'highlight-completed');
    
    // Update current time
    setCurrentTime(time);
  };

  // Set a node to error status
  const errorNode = (nodeId: string) => {
    const time = currentTime + 
      (simulationNodes.find(n => n.id === nodeId)?.executionTime || 0) / (simulationSpeed / 50);
    
    // Update node status
    setSimulationNodes(prev => 
      prev.map(node => 
        node.id === nodeId 
          ? { ...node, status: 'error', endTime: time } 
          : node
      )
    );
    
    // Add event
    const node = simulationNodes.find(n => n.id === nodeId);
    if (node) {
      setSimulationEvents(prev => [
        ...prev,
        {
          id: `event-${Date.now()}`,
          timestamp: time,
          nodeId: nodeId,
          type: 'error',
          message: `Ошибка: ${node.name} - ${
            currentScenario === 'timeout' 
              ? 'Превышено время ожидания' 
              : 'Ошибка валидации данных'
          }`
        }
      ]);
    }
    
    // Highlight the node as error
    highlightNode(nodeId, 'highlight-error');
    
    // Update current time
    setCurrentTime(time);
    
    // Find error path if exists
    const errorPath = simulationPaths.find(path => 
      path.sourceId === nodeId && 
      path.targetId.includes('error')
    );
    
    if (errorPath) {
      setSimulationPaths(prev => 
        prev.map(p => 
          p.id === errorPath.id 
            ? { ...p, status: 'completed' } 
            : p
        )
      );
      
      // Highlight the path
      highlightPath(errorPath.id, 'highlight-path-completed');
      
      // Activate error handler node
      const targetNode = simulationNodes.find(node => node.id === errorPath.targetId);
      if (targetNode) {
        setTimeout(() => {
          activateNode(targetNode.id, errorPath.id);
        }, 500);
      }
    } else {
      // If no error path, just continue with normal outgoing paths
      const outgoingPaths = simulationPaths.filter(path => path.sourceId === nodeId);
      outgoingPaths.forEach(path => {
        setSimulationPaths(prev => 
          prev.map(p => 
            p.id === path.id 
              ? { ...p, status: 'completed' } 
              : p
          )
        );
        
        // Highlight the path
        highlightPath(path.id, 'highlight-path-completed');
      });
    }
  };

  // Handle start simulation
  const handleStartSimulation = () => {
    setIsSimulationRunning(true);
    runSimulationStep(true);
    
    // Set up interval to advance simulation time
    const interval = setInterval(() => {
      if (isSimulationRunning) {
        runSimulationStep();
      } else {
        clearInterval(interval);
      }
    }, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  };

  // Handle pause simulation
  const handlePauseSimulation = () => {
    setIsSimulationRunning(false);
  };

  // Handle reset simulation
  const handleResetSimulation = () => {
    setIsSimulationRunning(false);
    parseProcessDiagram();
  };

  // Format time in milliseconds to readable format
  const formatTime = (timeMs: number): string => {
    const seconds = Math.floor(timeMs / 1000);
    const milliseconds = timeMs % 1000;
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
  };

  // Get status color for node status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'waiting': return '#d9d9d9';
      case 'active': return '#1890ff';
      case 'completed': return '#52c41a';
      case 'error': return '#f5222d';
      default: return '#d9d9d9';
    }
  };

  // Get icon for event type
  const getEventIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'start': return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'complete': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error': return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      default: return <InfoCircleOutlined />;
    }
  };

  return (
    <div className="process-simulator-container">
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
          <Space>
            <Select
              value={currentScenario}
              onChange={setCurrentScenario}
              style={{ width: 180 }}
              disabled={isSimulationRunning}
            >
              {simulationScenarios.map(scenario => (
                <Option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </Option>
              ))}
            </Select>
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => setIsSettingsVisible(true)}
            />
            {!isSimulationRunning ? (
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                onClick={handleStartSimulation}
              >
                Запустить
              </Button>
            ) : (
              <Button 
                icon={<PauseCircleOutlined />} 
                onClick={handlePauseSimulation}
              >
                Пауза
              </Button>
            )}
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleResetSimulation}
              disabled={isSimulationRunning}
            >
              Сбросить
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Progress 
              percent={simulationProgress} 
              status={simulationProgress === 100 ? "success" : "active"} 
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </Col>
          
          <Col span={16}>
            <Card 
              className="simulator-canvas-card" 
              bodyStyle={{ padding: 0, height: 400, overflow: 'hidden' }}
            >
              <div 
                ref={containerRef} 
                style={{ height: '100%', width: '100%' }}
              />
            </Card>
          </Col>
          
          <Col span={8}>
            <Card title="Статистика симуляции" className="simulation-stats-card">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic 
                    title="Прогресс" 
                    value={simulationProgress} 
                    suffix="%" 
                    precision={0}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="Время" 
                    value={formatTime(currentTime)} 
                    prefix={<ClockCircleOutlined />} 
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="Шагов завершено" 
                    value={`${simulationStats.completedNodes}/${simulationStats.totalNodes}`} 
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="Ошибки" 
                    value={simulationStats.errorRate} 
                    suffix="%" 
                    precision={1}
                    valueStyle={{ color: simulationStats.errorRate > 0 ? '#cf1322' : '#3f8600' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          
          <Col span={24}>
            <Card title="Журнал событий" className="event-log-card" bodyStyle={{ height: 200, overflow: 'auto' }}>
              {simulationEvents.length > 0 ? (
                <Timeline mode="left">
                  {simulationEvents.map(event => (
                    <Timeline.Item 
                      key={event.id}
                      color={event.type === 'error' ? 'red' : (event.type === 'start' ? 'blue' : 'green')}
                      label={formatTime(event.timestamp)}
                    >
                      <Space>
                        {getEventIcon(event.type)}
                        <Text>{event.message}</Text>
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty 
                  description="Запустите симуляцию, чтобы увидеть журнал событий" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                />
              )}
            </Card>
          </Col>
        </Row>
      </Card>
      
      {/* Settings Drawer */}
      <Drawer
        title="Настройки симуляции"
        placement="right"
        onClose={() => setIsSettingsVisible(false)}
        open={isSettingsVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={5}>Скорость симуляции</Title>
            <Slider
              min={10}
              max={100}
              value={simulationSpeed}
              onChange={setSimulationSpeed}
              marks={{
                10: 'Медленно',
                50: 'Нормально',
                100: 'Быстро'
              }}
            />
          </div>
          
          <Divider />
          
          <div>
            <Title level={5}>Выбор сценария</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              {simulationScenarios.map(scenario => (
                <Card 
                  key={scenario.id}
                  size="small"
                  className={currentScenario === scenario.id ? 'scenario-card-selected' : 'scenario-card'}
                  onClick={() => setCurrentScenario(scenario.id)}
                >
                  <Space>
                    <ExperimentOutlined />
                    <div>
                      <Text strong>{scenario.name}</Text>
                      <br />
                      <Text type="secondary">{scenario.description}</Text>
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>
          </div>
          
          <Divider />
          
          <Alert
            message="Информация о симуляции"
            description="Симуляция представляет собой упрощенное моделирование выполнения бизнес-процесса. Фактическое выполнение в реальных системах может отличаться."
            type="info"
            showIcon
          />
        </Space>
      </Drawer>
    </div>
  );
};

export default ProcessSimulator;

// Missing icon import
function CheckCircleOutlined(props: any) {
  return <span role="img" className="anticon" {...props}>✓</span>;
} 