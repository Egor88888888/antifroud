import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Card, Input, Space, Typography, Button, Select, Tag, Divider, Tooltip, Radio, Spin, Row, Col, Tabs, Empty } from 'antd';
import { Network } from 'vis-network';
import 'vis-network/dist/dist/vis-network.min.css';
import { 
  SearchOutlined, 
  ApartmentOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  HomeOutlined, 
  AlertOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  UndoOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  ExportOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface Node {
  id: string;
  type: string;
  label: string;
  details?: any;
}

interface Edge {
  from: string;
  to: string;
  type: string;
  id?: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
  timestamp: string;
}

// Sample data for demonstration
const sampleClientData = [
  { id: 'client1', name: 'Акционерное Общество "Технопром"', risk: 'high', country: 'RU', type: 'Corporate' },
  { id: 'client2', name: 'ООО "Глобал Трейд"', risk: 'medium', country: 'RU', type: 'Corporate' },
  { id: 'client3', name: 'Иванов Иван Иванович', risk: 'low', country: 'RU', type: 'Individual' },
  { id: 'client4', name: 'ООО "ТехноСолюшнс"', risk: 'high', country: 'RU', type: 'Corporate' },
  { id: 'client5', name: 'Петрова Мария Сергеевна', risk: 'medium', country: 'RU', type: 'Individual' }
];

const generateSampleGraphData = (clientId: string): GraphData => {
  const client = sampleClientData.find(c => c.id === clientId) || sampleClientData[0];
  
  // Create nodes based on the selected client
  const nodes: Node[] = [
    { id: client.id, type: 'client', label: client.name, details: client },
  ];
  
  // Generate connected entities based on risk level
  // Higher risk means more connections and potential incidents
  const riskMultiplier = client.risk === 'high' ? 1.5 : client.risk === 'medium' ? 1.2 : 1;
  
  const phoneCount = Math.floor(Math.random() * 2 * riskMultiplier) + 1;
  const emailCount = Math.floor(Math.random() * 2 * riskMultiplier) + 1;
  const addressCount = Math.floor(Math.random() * 2 * riskMultiplier) + 1;
  const incidentCount = client.risk === 'high' ? Math.floor(Math.random() * 3) + 1 : 
                        client.risk === 'medium' ? Math.floor(Math.random() * 1.5) : 0;
  
  // Add phone nodes
  for (let i = 1; i <= phoneCount; i++) {
    nodes.push({
      id: `phone_${client.id}_${i}`,
      type: 'phone',
      label: `+7-${Math.floor(900 + Math.random() * 99)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(10 + Math.random() * 90)}`,
      details: { 
        primary: i === 1, 
        verified: Math.random() > 0.3, 
        lastUsed: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString() 
      }
    });
  }
  
  // Add email nodes
  for (let i = 1; i <= emailCount; i++) {
    const domains = ['gmail.com', 'yandex.ru', 'mail.ru', 'company.ru', 'outlook.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    // Транслитерация для email имен
    const username = client.type === 'Corporate' 
      ? `${client.name.toLowerCase().replace(/[^a-zA-Zа-яА-Я0-9]/g, '').replace(/[а-яА-Я]/g, c => {
          const translitMap: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 
            'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 
            'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          };
          return translitMap[c.toLowerCase()] || c;
        })}${i > 1 ? i : ''}`
      : `${client.name.split(' ')[0].toLowerCase().replace(/[^a-zA-Zа-яА-Я]/g, '').replace(/[а-яА-Я]/g, c => {
          const translitMap: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 
            'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 
            'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          };
          return translitMap[c.toLowerCase()] || c;
        })}.${client.name.split(' ')[1]?.toLowerCase().charAt(0) || ''}`;
    
    nodes.push({
      id: `email_${client.id}_${i}`,
      type: 'email',
      label: `${username}@${domain}`,
      details: { primary: i === 1, verified: Math.random() > 0.2, lastUsed: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString() }
    });
  }
  
  // Add address nodes
  for (let i = 1; i <= addressCount; i++) {
    const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург'];
    const streets = ['ул. Ленина', 'пр. Мира', 'ул. Пушкина', 'ул. Гагарина', 'бул. Победы'];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const number = Math.floor(1 + Math.random() * 200);
    
    nodes.push({
      id: `address_${client.id}_${i}`,
      type: 'address',
      label: `${city}, ${street}, д. ${number}`,
      details: { primary: i === 1, verified: Math.random() > 0.4, lastUsed: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString() }
    });
  }
  
  // Add incident nodes if applicable
  if (incidentCount > 0) {
    const incidentTypes = [
      { 
        label: 'Подозрительная транзакция', 
        description: 'Множественные транзакции на крупные суммы за короткий период' 
      },
      { 
        label: 'Фиктивный договор', 
        description: 'Выявлены признаки фиктивности в заключенном договоре' 
      },
      { 
        label: 'Сомнительное происхождение средств', 
        description: 'Не подтверждено легальное происхождение крупной суммы средств' 
      },
      { 
        label: 'Подлог документов', 
        description: 'Обнаружены признаки подделки предоставленных документов' 
      }
    ];
    
    for (let i = 1; i <= incidentCount; i++) {
      const incidentType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
      nodes.push({
        id: `incident_${client.id}_${i}`,
        type: 'incident',
        label: incidentType.label,
        details: { 
          date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          status: Math.random() > 0.3 ? 'Open' : 'Closed',
          severity: Math.random() > 0.5 ? 'High' : 'Medium',
          description: incidentType.description
        }
      });
    }
  }
  
  // Create edges
  const edges: Edge[] = [];
  
  // Connect client to other entities
  nodes.forEach(node => {
    if (node.id !== client.id) {
      edges.push({
        from: client.id,
        to: node.id,
        type: node.type === 'incident' ? 'related' : 'owns'
      });
    }
  });
  
  // Add connections between entities (simulating shared details)
  // For high risk clients, add more complex connections
  if (client.risk === 'high' || client.risk === 'medium') {
    // Find clients that share contact information
    const sharedEntitiesCount = client.risk === 'high' ? 2 : 1;
    
    for (let i = 0; i < sharedEntitiesCount; i++) {
      const otherClients = sampleClientData.filter(c => c.id !== client.id);
      if (otherClients.length > 0) {
        const sharedClientId = otherClients[Math.floor(Math.random() * otherClients.length)].id;
        
        // Select a random entity to be shared (phones and emails are most likely to be shared)
        const entityTypes = ['phone', 'email', 'address'];
        const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
        const entitiesOfType = nodes.filter(n => n.type === entityType);
        
        if (entitiesOfType.length > 0) {
          const sharedEntity = entitiesOfType[Math.floor(Math.random() * entitiesOfType.length)];
          
          // Add the shared client
          nodes.push({
            id: sharedClientId,
            type: 'client',
            label: sampleClientData.find(c => c.id === sharedClientId)?.name || 'Неизвестный клиент',
            details: sampleClientData.find(c => c.id === sharedClientId)
          });
          
          // Create the connection
          edges.push({
            from: sharedClientId,
            to: sharedEntity.id,
            type: 'shares'
          });
        }
      }
    }
  }
  
  return { nodes, edges, timestamp: new Date().toISOString() };
};

const GraphAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{id: string, name: string, risk: string}>>([]);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('network');
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [], timestamp: '' });
  const [viewOptions, setViewOptions] = useState({
    showLabels: true,
    layout: 'hierarchical',
    groupNodes: true,
    highlightConnections: true
  });
  
  const networkContainer = useRef<HTMLDivElement>(null);
  const network = useRef<Network | null>(null);

  // Вынесем функции, используемые в initNetwork, на уровень компонента
  const getNodeTypeLabel = useCallback((type: string) => {
    switch (type) {
      case 'client': return 'Клиент';
      case 'phone': return 'Номер телефона';
      case 'email': return 'Email адрес';
      case 'address': return 'Физический адрес';
      case 'incident': return 'Инцидент';
      default: return 'Сущность';
    }
  }, []);

  const getNodeStyle = useCallback((type: string) => {
    switch (type) {
      case 'client':
        return { 
          color: '#1890ff', 
          shape: 'dot',
          size: 40, 
          font: { size: 16, color: '#333333' } 
        };
      case 'phone':
        return { 
          color: '#52c41a', 
          shape: 'diamond',
          icon: { face: 'FontAwesome', code: '\uf095', color: '#ffffff' } 
        };
      case 'email':
        return { 
          color: '#722ed1', 
          shape: 'diamond',
          icon: { face: 'FontAwesome', code: '\uf0e0', color: '#ffffff' } 
        };
      case 'address':
        return { 
          color: '#fa8c16', 
          shape: 'square',
          icon: { face: 'FontAwesome', code: '\uf015', color: '#ffffff' } 
        };
      case 'incident':
        return { 
          color: '#f5222d', 
          shape: 'triangle',
          size: 35,
          icon: { face: 'FontAwesome', code: '\uf071', color: '#ffffff' } 
        };
      default:
        return { color: '#666666', shape: 'dot' };
    }
  }, []);

  const getEdgeColor = useCallback((type: string): string => {
    switch (type) {
      case 'owns': return '#3498db';
      case 'uses': return '#27ae60';
      case 'lives_at': return '#8e44ad';
      case 'visited': return '#e67e22';
      case 'involved': return '#e74c3c';
      case 'related_to': return '#f39c12';
      case 'shared': return '#1abc9c';
      case 'used': return '#d35400';
      default: return '#95a5a6';
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'passed': return 'Пройден';
      case 'warning': return 'Требует внимания';
      case 'failed': return 'Не пройден';
      default: return 'Неизвестно';
    }
  }, []);

  // Функция для безопасной очистки сетевого графа
  const cleanupNetwork = useCallback(() => {
    if (network.current) {
      try {
        // Проверить, что обработчики событий существуют, и только потом удалять их
        if (typeof network.current.off === 'function') {
          // Явно удаляем все слушатели событий, которые были добавлены
          network.current.off('click');
          network.current.off('doubleClick');
          network.current.off('hoverNode');
          network.current.off('blurNode');
          network.current.off('zoom');
          network.current.off('dragEnd');
        }
        
        // Подчистить другие ресурсы перед уничтожением
        if (typeof network.current.setData === 'function') {
          // Сбросить данные сети на пустые, чтобы освободить ресурсы
          network.current.setData({nodes: [], edges: []});
        }
        
        // Теперь уничтожаем сеть
        if (typeof network.current.destroy === 'function') {
          network.current.destroy();
          console.log('Network graph successfully destroyed');
        }
      } catch (error) {
        console.error('Error destroying network:', error);
      } finally {
        network.current = null;
      }
    }
  }, []);

  const initNetwork = useCallback((data: GraphData) => {
    // Всегда чистим сетевой граф перед инициализацией нового
    cleanupNetwork();

    // Проверяем наличие контейнера и что он всё ещё в DOM
    if (!networkContainer.current || !document.body.contains(networkContainer.current)) {
      console.warn('Network container reference is not available or not in DOM');
      return;
    }

    try {
      // Безопасное создание узлов и рёбер, с проверками на наличие данных
      const nodes = data.nodes.map(node => ({
        id: node.id,
        label: node.label,
        group: node.type,
        title: `${getNodeTypeLabel(node.type)}: ${node.label}`,
        font: {
          size: node.type === 'client' ? 20 : 18,
          face: 'Arial',
          bold: node.type === 'client' ? 'bold' : undefined,
          color: '#333333',
          strokeWidth: 4,
          strokeColor: '#ffffff',
          background: '#ffffff'
        },
        ...getNodeStyle(node.type),
        margin: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }
      }));

      const edges = data.edges.map(edge => ({
        id: edge.id || `${edge.from}-${edge.to}`,
        from: edge.from,
        to: edge.to,
        label: edge.type,
        arrows: 'to',
        color: getEdgeColor(edge.type),
        smooth: { 
          enabled: true, 
          type: 'curvedCW', 
          roundness: 0.2 
        },
        font: {
          size: 14,
          face: 'Arial',
          color: '#555555',
          strokeWidth: 3,
          strokeColor: '#ffffff',
          background: '#ffffff',
          align: 'middle'
        },
        width: 3,
        length: 300
      }));

      // Network configuration
      const options = {
        nodes: {
          shape: 'dot',
          size: 60,
          font: {
            size: 18,
            face: 'Arial',
            color: '#000000',
            bold: {
              color: '#000000',
              size: 20,
              face: 'Arial',
              mod: 'bold'
            },
            strokeWidth: 5,
            strokeColor: '#ffffff',
            background: '#ffffff'
          },
          borderWidth: 4,
          shadow: true,
          scaling: {
            min: 40,
            max: 80,
            label: {
              enabled: true,
              min: 18,
              max: 32
            }
          },
          margin: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          },
          widthConstraint: {
            maximum: 300
          }
        },
        edges: {
          width: 4,
          font: {
            size: 16,
            face: 'Arial',
            align: 'middle',
            background: 'white',
            strokeWidth: 4,
            strokeColor: '#ffffff'
          },
          shadow: true,
          smooth: {
            enabled: true,
            type: 'curvedCW',
            roundness: 0.2
          },
          length: 400,
          arrows: {
            to: {
              enabled: true,
              scaleFactor: 1.5,
              type: 'arrow'
            }
          }
        },
        groups: {
          client: {
            color: { background: '#1890ff', border: '#096dd9' },
            shape: 'dot',
            size: 70,
            font: { size: 20, color: '#000000', strokeWidth: 5, strokeColor: '#ffffff' }
          },
          phone: {
            color: { background: '#52c41a', border: '#389e0d' },
            shape: 'diamond',
            size: 50
          },
          email: {
            color: { background: '#722ed1', border: '#531dab' },
            shape: 'diamond',
            size: 50
          },
          address: {
            color: { background: '#fa8c16', border: '#d46b08' },
            shape: 'square',
            size: 50
          },
          incident: {
            color: { background: '#f5222d', border: '#cf1322' },
            shape: 'triangle',
            size: 55
          }
        },
        physics: viewOptions.layout === 'hierarchical' ? {
          enabled: true,
          hierarchicalRepulsion: {
            centralGravity: 0.0,
            springLength: 200,
            springConstant: 0.01,
            nodeDistance: 250
          },
          solver: 'hierarchicalRepulsion'
        } : {
          barnesHut: {
            gravitationalConstant: -3000,
            springConstant: 0.04,
            springLength: 250
          },
          stabilization: { iterations: 2000 }
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
          navigationButtons: true,
          keyboard: true,
          hoverConnectedEdges: viewOptions.highlightConnections,
          selectConnectedEdges: viewOptions.highlightConnections,
          multiselect: false,
          zoomView: true
        },
        layout: viewOptions.layout === 'hierarchical' ? {
          hierarchical: {
            direction: 'UD',
            sortMethod: 'directed',
            levelSeparation: 250,
            nodeSpacing: 200
          }
        } : undefined
      };

      try {
        // Дополнительная проверка, что контейнер все еще в DOM перед созданием графа
        if (networkContainer.current && document.body.contains(networkContainer.current)) {
          // Создаем новый экземпляр сетевого графа
          network.current = new Network(
            networkContainer.current,
            { nodes, edges },
            options
          );

          // Добавляем обработчики событий только если граф успешно создан
          if (network.current) {
            // Добавляем обработчик для клика по узлу
            network.current.on('click', (params) => {
              if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = data.nodes.find(n => n.id === nodeId);
                if (node?.details) {
                  setSelectedEntity({
                    id: node.id,
                    type: node.type,
                    label: node.label,
                    details: node.details
                  });
                }
              } else {
                setSelectedEntity(null);
              }
            });
            
            // Добавляем обработчик для двойного клика
            network.current.on('doubleClick', (params) => {
              if (params.nodes.length > 0 && network.current) {
                network.current.focus(params.nodes[0], {
                  scale: 1.2,
                  animation: {
                    duration: 1000,
                    easingFunction: 'easeInOutQuad'
                  }
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('Error creating network:', error);
      }
    } catch (error) {
      console.error('Error initializing network:', error);
    }
  }, [viewOptions, cleanupNetwork, getNodeTypeLabel, getEdgeColor, getNodeStyle]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'client': return <UserOutlined />;
      case 'phone': return <PhoneOutlined />;
      case 'email': return <MailOutlined />;
      case 'address': return <HomeOutlined />;
      case 'incident': return <ExclamationCircleOutlined />;
      default: return <ApartmentOutlined />;
    }
  };
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#f5222d';
      case 'medium': return '#fa8c16';
      case 'low': return '#52c41a';
      default: return '#666666';
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Фильтрация тестовых данных на основе запроса
      const results = sampleClientData.filter(client => 
        client.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(results);
    } catch (error) {
      console.error('Ошибка при поиске:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadClientGraph = useCallback(async (clientId: string) => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      // const response = await axios.get(`/api/graph/client/${clientId}`);
      
      // Using mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      const data = generateSampleGraphData(clientId);
      
      setGraphData(data);
      
      // Reset selected entity
      setSelectedEntity(null);
      
      // Clear search results
      setSearchResults([]);
      
      // Switch to graph tab
      setActiveTab('network');
    } catch (error) {
      console.error('Error loading client graph:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const handleViewOptionsChange = (option: string, value: any) => {
    setViewOptions(prev => ({ ...prev, [option]: value }));
  };
  
  const handleZoomIn = useCallback(() => {
    if (network.current) {
      try {
        const scale = network.current.getScale() * 1.2;
        network.current.moveTo({ scale });
      } catch (error) {
        console.error('Error zooming in:', error);
      }
    }
  }, []);
  
  const handleZoomOut = useCallback(() => {
    if (network.current) {
      try {
        const scale = network.current.getScale() / 1.2;
        network.current.moveTo({ scale });
      } catch (error) {
        console.error('Error zooming out:', error);
      }
    }
  }, []);
  
  const handleReset = useCallback(() => {
    if (network.current) {
      try {
        network.current.fit({
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
          }
        });
      } catch (error) {
        console.error('Error resetting view:', error);
      }
    }
  }, []);

  // Инициализация при первом рендере и очистка при размонтировании
  useEffect(() => {
    // При монтировании компонента загружаем данные для первого клиента
    loadClientGraph('client1');
    
    // При размонтировании компонента чистим все ресурсы
    return () => {
      cleanupNetwork();
    };
  }, [loadClientGraph, cleanupNetwork]);
  
  // Обновление графа при изменении данных
  useEffect(() => {
    // Инициализируем сетевой граф только после загрузки данных
    if (graphData.nodes.length > 0 && !loading) {
      initNetwork(graphData);
    }
    
    // Очистка при размонтировании для предотвращения утечек памяти
    return () => {
      if (activeTab !== 'network') {
        cleanupNetwork();
      }
    };
  }, [graphData, loading, initNetwork, activeTab, cleanupNetwork]);
  
  // Обновление графа при изменении опций
  useEffect(() => {
    // Обновляем граф только если он уже создан и есть данные
    if (graphData.nodes.length > 0 && network.current) {
      initNetwork(graphData);
    }
  }, [viewOptions, graphData, initNetwork]);

  const renderEntityDetails = () => {
    if (!selectedEntity) return <Empty description="Выберите элемент для просмотра деталей" />;
    
    const { type, label, details } = selectedEntity;
    
    const renderClientDetails = () => (
      <>
        <Divider orientation="left">Информация о клиенте</Divider>
        <Row gutter={[16, 16]}>
          <Col span={12}><Text strong>Имя:</Text> {label}</Col>
          <Col span={12}>
            <Text strong>Уровень риска:</Text> 
            <Tag color={getRiskColor(details.risk)} style={{ marginLeft: 8 }}>
              {details.risk === 'high' ? 'ВЫСОКИЙ' : details.risk === 'medium' ? 'СРЕДНИЙ' : 'НИЗКИЙ'}
            </Tag>
          </Col>
          <Col span={12}><Text strong>Тип:</Text> {details.type === 'Corporate' ? 'Юридическое лицо' : 'Физическое лицо'}</Col>
          <Col span={12}><Text strong>Страна:</Text> {details.country === 'RU' ? 'Россия' : details.country}</Col>
        </Row>
      </>
    );
    
    const renderContactDetails = () => (
      <>
        <Divider orientation="left">Контактная информация</Divider>
        <Row gutter={[16, 16]}>
          <Col span={12}><Text strong>Значение:</Text> {label}</Col>
          <Col span={12}>
            <Text strong>Основной:</Text> 
            <Tag color={details.primary ? 'green' : 'default'} style={{ marginLeft: 8 }}>
              {details.primary ? 'ДА' : 'НЕТ'}
            </Tag>
          </Col>
          <Col span={12}>
            <Text strong>Подтверждён:</Text> 
            <Tag color={details.verified ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
              {details.verified ? 'ДА' : 'НЕТ'}
            </Tag>
          </Col>
          <Col span={12}>
            <Text strong>Последнее использование:</Text> {new Date(details.lastUsed).toLocaleDateString()}
          </Col>
        </Row>
      </>
    );
    
    const renderIncidentDetails = () => (
      <>
        <Divider orientation="left">Информация об инциденте</Divider>
        <Row gutter={[16, 16]}>
          <Col span={12}><Text strong>Тип:</Text> {label === 'Suspicious Transaction' ? 'Подозрительная транзакция' : label}</Col>
          <Col span={12}>
            <Text strong>Серьезность:</Text> 
            <Tag color={details.severity === 'High' ? 'red' : 'orange'} style={{ marginLeft: 8 }}>
              {details.severity === 'High' ? 'Высокая' : 'Средняя'}
            </Tag>
          </Col>
          <Col span={12}><Text strong>Дата:</Text> {new Date(details.date).toLocaleDateString()}</Col>
          <Col span={12}>
            <Text strong>Статус:</Text> 
            <Tag color={details.status === 'Open' ? 'red' : 'green'} style={{ marginLeft: 8 }}>
              {details.status === 'Open' ? 'Открыт' : 'Закрыт'}
            </Tag>
          </Col>
          <Col span={24}>
            <Text strong>Описание:</Text>
            <Paragraph style={{ marginTop: 8 }}>
              {details.description === 'Multiple high-value transactions in short period' 
                ? 'Множественные транзакции на крупные суммы за короткий период' 
                : details.description}
            </Paragraph>
          </Col>
        </Row>
      </>
    );

    return (
      <Card 
        title={
          <Space>
            {getNodeIcon(type)}
            <Text strong>{getNodeTypeLabel(type)}</Text>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        {type === 'client' && renderClientDetails()}
        {(type === 'phone' || type === 'email' || type === 'address') && renderContactDetails()}
        {type === 'incident' && renderIncidentDetails()}
        
        <Divider />
        <Space>
          <Button type="primary" icon={<ApartmentOutlined />}>Просмотр связей</Button>
          <Button icon={<AlertOutlined />}>Сообщить о подозрении</Button>
        </Space>
      </Card>
    );
  };
  
  const renderLegend = () => (
    <Card 
      title="Легенда графа" 
      size="small" 
      style={{ marginTop: 16 }}
      extra={
        <Tooltip title="Нажмите на элементы графа, чтобы увидеть детали">
          <InfoCircleOutlined />
        </Tooltip>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Tag 
            icon={<UserOutlined />} 
            color="blue"
            style={{ display: 'flex', alignItems: 'center', padding: '4px 8px' }}
          >
            Клиент
          </Tag>
          <Tag 
            icon={<PhoneOutlined />} 
            color="green"
            style={{ display: 'flex', alignItems: 'center', padding: '4px 8px' }}
          >
            Телефон
          </Tag>
          <Tag 
            icon={<MailOutlined />} 
            color="purple"
            style={{ display: 'flex', alignItems: 'center', padding: '4px 8px' }}
          >
            Email
          </Tag>
          <Tag 
            icon={<HomeOutlined />} 
            color="orange"
            style={{ display: 'flex', alignItems: 'center', padding: '4px 8px' }}
          >
            Адрес
          </Tag>
          <Tag 
            icon={<ExclamationCircleOutlined />} 
            color="red"
            style={{ display: 'flex', alignItems: 'center', padding: '4px 8px' }}
          >
            Инцидент
          </Tag>
        </div>
        
        <Divider style={{ margin: '8px 0' }} />
        
        <Text strong>Типы связей:</Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
          <Tag color="blue">Владеет</Tag>
          <Tag color="purple" style={{ borderStyle: 'dashed' }}>Использует совместно</Tag>
          <Tag color="red">Связан с</Tag>
        </div>
      </Space>
    </Card>
  );

  return (
    <div className="graph-analytics-container">
      <Card 
        title={
          <Space>
            <ApartmentOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>Граф взаимосвязей</Title>
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<ZoomInOutlined />} 
              onClick={handleZoomIn}
              disabled={!graphData.nodes.length}
            />
            <Button 
              icon={<ZoomOutOutlined />} 
              onClick={handleZoomOut}
              disabled={!graphData.nodes.length}
            />
            <Button 
              icon={<UndoOutlined />} 
              onClick={handleReset}
              disabled={!graphData.nodes.length}
            />
            <Tooltip title="Экспорт графа">
              <Button 
                icon={<ExportOutlined />} 
                disabled={!graphData.nodes.length}
              />
            </Tooltip>
          </Space>
        }
        style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ padding: '0 24px' }}
        >
          <TabPane tab="Сетевой граф" key="network" />
          <TabPane tab="Поиск и анализ" key="search" />
        </Tabs>
        
        <div style={{ padding: '0 24px', marginBottom: 16 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space size="large">
              <Input.Search
                placeholder="Поиск по имени клиента, ID или контактной информации..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
                style={{ width: 400 }}
                loading={loading}
                allowClear
                enterButton={<><SearchOutlined /> Поиск</>}
              />
              
              <Space>
                <Text>Вид:</Text>
                <Radio.Group 
                  value={viewOptions.layout} 
                  onChange={(e) => handleViewOptionsChange('layout', e.target.value)}
                  disabled={!graphData.nodes.length}
                  buttonStyle="solid"
                  size="small"
                >
                  <Radio.Button value="hierarchical">Иерархический</Radio.Button>
                  <Radio.Button value="force">Силовой</Radio.Button>
                </Radio.Group>
              </Space>
            </Space>
            
            {graphData.nodes.length > 0 && (
              <div>
                <Text type="secondary">
                  Показано {graphData.nodes.length} сущностей и {graphData.edges.length} связей
                </Text>
              </div>
            )}
          </Space>
          
          {/* Показать результаты поиска */}
          {searchResults.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Text strong>Результаты поиска:</Text>
              <div style={{ marginTop: 8 }}>
                {searchResults.map(result => (
                  <Tag 
                    key={result.id} 
                    style={{ margin: '0 8px 8px 0', padding: '4px 8px', cursor: 'pointer' }}
                    icon={<UserOutlined />}
                    color={getRiskColor(result.risk)}
                    onClick={() => loadClientGraph(result.id)}
                  >
                    {result.name}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {activeTab === 'network' ? (
            <div style={{ display: 'flex', width: '100%', height: '100%' }}>
              <div 
                ref={networkContainer} 
                style={{ 
                  flex: 1, 
                  height: '100%', 
                  border: '1px solid #f0f0f0',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {loading && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 10
                  }}>
                    <Spin size="large" tip="Загрузка данных сети..." />
                  </div>
                )}
                
                {!graphData.nodes.length && !loading && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    <ApartmentOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 24 }} />
                    <Title level={4}>Нет данных для визуализации</Title>
                    <Paragraph type="secondary">
                      Выполните поиск клиента для визуализации связей
                    </Paragraph>
                  </div>
                )}
              </div>
              
              <div style={{ width: 300, overflow: 'auto', padding: '0 16px' }}>
                {renderEntityDetails()}
                {renderLegend()}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, padding: 24 }}>
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Card title="Расширенный поиск">
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <Text strong>Тип сущности</Text>
                        <Select 
                          style={{ width: '100%', marginTop: 8 }} 
                          placeholder="Выберите тип"
                          allowClear
                        >
                          <Option value="client">Клиенты</Option>
                          <Option value="phone">Телефоны</Option>
                          <Option value="email">Email-адреса</Option>
                          <Option value="address">Физические адреса</Option>
                          <Option value="incident">Инциденты</Option>
                        </Select>
                      </Col>
                      <Col span={8}>
                        <Text strong>Уровень риска</Text>
                        <Select 
                          style={{ width: '100%', marginTop: 8 }} 
                          placeholder="Выберите уровень риска"
                          allowClear
                          mode="multiple"
                        >
                          <Option value="high">Высокий риск</Option>
                          <Option value="medium">Средний риск</Option>
                          <Option value="low">Низкий риск</Option>
                        </Select>
                      </Col>
                      <Col span={8}>
                        <Text strong>Страна</Text>
                        <Select 
                          style={{ width: '100%', marginTop: 8 }} 
                          placeholder="Выберите страну"
                          allowClear
                          mode="multiple"
                        >
                          <Option value="RU">Россия</Option>
                          <Option value="KZ">Казахстан</Option>
                          <Option value="BY">Беларусь</Option>
                          <Option value="US">США</Option>
                          <Option value="UK">Великобритания</Option>
                        </Select>
                      </Col>
                      <Col span={24} style={{ textAlign: 'right', marginTop: 8 }}>
                        <Button type="primary" icon={<SearchOutlined />}>
                          Поиск
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card title="Типовые шаблоны">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                      <Button 
                        icon={<ApartmentOutlined />} 
                        onClick={() => loadClientGraph('client1')}
                      >
                        Клиент с высоким риском
                      </Button>
                      <Button 
                        icon={<ApartmentOutlined />}
                        onClick={() => loadClientGraph('client3')}
                      >
                        Клиент с низким риском
                      </Button>
                      <Button icon={<ApartmentOutlined />}>Общие идентификаторы</Button>
                      <Button icon={<AlertOutlined />}>Множественные инциденты</Button>
                    </div>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card 
                    title="Рекомендуемый анализ" 
                    extra={<Button type="link">Просмотреть все</Button>}
                  >
                    <Paragraph>
                      Система определила следующие потенциальные паттерны высокого риска, требующие дополнительного расследования:
                    </Paragraph>
                    <ul style={{ paddingLeft: 16 }}>
                      <li>
                        <Text>Несколько клиентов используют общие контактные данные</Text>
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => loadClientGraph('client1')}
                        >
                          Визуализировать
                        </Button>
                      </li>
                      <li>
                        <Text>Частая смена адресов клиентами с высоким риском</Text>
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => loadClientGraph('client4')}
                        >
                          Визуализировать
                        </Button>
                      </li>
                      <li>
                        <Text>Необычные шаблоны связей между сущностями</Text>
                        <Button type="link" size="small">Визуализировать</Button>
                      </li>
                    </ul>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GraphAnalytics; 