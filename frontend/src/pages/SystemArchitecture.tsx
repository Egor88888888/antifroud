import React, { useState, useEffect } from 'react';
import { Card, Tabs, Typography, Tag, Tooltip, Button, Badge, Space, Row, Col, Divider, Collapse, Statistic, Table } from 'antd';
import ReactFlow, { Background, Controls, Node, Edge, Position, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  ApiOutlined, 
  CloudServerOutlined, 
  DatabaseOutlined, 
  RocketOutlined, 
  SafetyOutlined, 
  ApartmentOutlined,
  NodeIndexOutlined,
  ClusterOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// Custom service node component
const ServiceNode = ({ data }: any) => {
  return (
    <Card 
      className="service-node" 
      size="small" 
      title={
        <Space>
          {data.icon}
          <Text strong>{data.label}</Text>
          <Badge 
            status={data.status === 'active' ? 'success' : data.status === 'warning' ? 'warning' : 'error'} 
            text={data.status === 'active' ? 'Running' : data.status === 'warning' ? 'Warning' : 'Offline'} 
          />
        </Space>
      }
      extra={
        <Tooltip title="Service Info">
          <InfoCircleOutlined />
        </Tooltip>
      }
      style={{ width: 240, borderLeft: `4px solid ${data.color}` }}
    >
      <Paragraph ellipsis={{ rows: 2 }}>
        {data.description}
      </Paragraph>
      
      <Row gutter={[8, 8]}>
        <Col span={12}>
          <Statistic 
            title="Uptime" 
            value={data.metrics?.uptime || '99.9%'} 
            valueStyle={{ fontSize: '14px' }} 
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title="Requests" 
            value={data.metrics?.requests || '0'} 
            valueStyle={{ fontSize: '14px' }} 
          />
        </Col>
      </Row>
      
      <Space wrap style={{ marginTop: 8 }}>
        {data.tags?.map((tag: string) => (
          <Tag key={tag} color="blue">{tag}</Tag>
        ))}
      </Space>
    </Card>
  );
};

// Define microservices data
const microservices = [
  {
    id: 'core',
    type: 'serviceNode',
    position: { x: 250, y: 50 },
    data: {
      label: 'Ядро системы',
      description: 'Центральный микросервис, ответственный за оркестрацию процесса обнаружения мошенничества и предоставление API для клиентов.',
      icon: <CloudServerOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
      status: 'active',
      metrics: { uptime: '99.9%', requests: '1.2M' },
      tags: ['API', 'Gateway', 'Оркестрация'],
      details: {
        technology: 'Spring Boot',
        scaling: 'Автомасштабирование (3-10 экземпляров)',
        responsibilities: [
          'Предоставление REST API эндпоинтов',
          'Аутентификация и авторизация',
          'Валидация и маршрутизация запросов',
          'Оркестрация процессов',
          'Обнаружение сервисов и регистрация'
        ]
      }
    }
  },
  {
    id: 'risk-engine',
    type: 'serviceNode',
    position: { x: 50, y: 200 },
    data: {
      label: 'Движок оценки рисков',
      description: 'Продвинутый движок оценки рисков с использованием моделей машинного обучения для расчета вероятности мошенничества.',
      icon: <SafetyOutlined style={{ color: '#eb2f96' }} />,
      color: '#eb2f96',
      status: 'active',
      metrics: { uptime: '99.7%', requests: '950K' },
      tags: ['ML', 'Скоринг', 'Анализ'],
      details: {
        technology: 'Python FastAPI',
        scaling: 'Автомасштабирование (2-8 экземпляров)',
        responsibilities: [
          'Расчет оценки риска',
          'Выполнение моделей машинного обучения',
          'Извлечение признаков',
          'Обработка правил принятия решений',
          'Генерация объяснений оценки'
        ]
      }
    }
  },
  {
    id: 'data-processor',
    type: 'serviceNode',
    position: { x: 450, y: 200 },
    data: {
      label: 'Обработчик данных',
      description: 'Обрабатывает и обогащает данные клиентов, выполняет валидацию и трансформацию данных.',
      icon: <DatabaseOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
      status: 'active',
      metrics: { uptime: '99.8%', requests: '1.5M' },
      tags: ['ETL', 'Обогащение', 'Валидация'],
      details: {
        technology: 'Node.js',
        scaling: 'Автомасштабирование (3-12 экземпляров)',
        responsibilities: [
          'Валидация и очистка данных',
          'Обогащение данных из внешних источников',
          'Трансформация форматов',
          'Нормализация данных',
          'Сопоставление и стандартизация полей'
        ]
      }
    }
  },
  {
    id: 'rules-engine',
    type: 'serviceNode',
    position: { x: 250, y: 350 },
    data: {
      label: 'Движок правил',
      description: 'Движок выполнения бизнес-правил, который оценивает наборы правил относительно данных клиента.',
      icon: <NodeIndexOutlined style={{ color: '#fa8c16' }} />,
      color: '#fa8c16',
      status: 'warning',
      metrics: { uptime: '99.5%', requests: '820K' },
      tags: ['Правила', 'Решения', 'Логика'],
      details: {
        technology: 'Drools + Java',
        scaling: 'Фиксированное (5 экземпляров)',
        responsibilities: [
          'Выполнение бизнес-правил',
          'Управление наборами правил',
          'Обработка таблиц решений',
          'Версионирование правил и история',
          'Объяснение триггеров правил'
        ]
      }
    }
  },
  {
    id: 'notification',
    type: 'serviceNode',
    position: { x: 650, y: 50 },
    data: {
      label: 'Сервис уведомлений',
      description: 'Обрабатывает оповещения, уведомления и отчетность для клиентов и внутренних систем.',
      icon: <RocketOutlined style={{ color: '#722ed1' }} />,
      color: '#722ed1',
      status: 'active',
      metrics: { uptime: '99.9%', requests: '450K' },
      tags: ['Оповещения', 'Уведомления', 'Отчетность'],
      details: {
        technology: 'Go',
        scaling: 'Автомасштабирование (2-6 экземпляров)',
        responsibilities: [
          'Генерация и доставка предупреждений',
          'Шаблонизация уведомлений',
          'Мультиканальные сообщения (email, SMS, webhooks)',
          'Отслеживание статуса уведомлений',
          'Очередь сообщений и механизм повторных попыток'
        ]
      }
    }
  },
  {
    id: 'analytics',
    type: 'serviceNode',
    position: { x: 650, y: 350 },
    data: {
      label: 'Сервис аналитики',
      description: 'Предоставляет аналитику в реальном времени, дашборды и хранит исторические данные для анализа.',
      icon: <LineChartOutlined style={{ color: '#1d39c4' }} />,
      color: '#1d39c4',
      status: 'active',
      metrics: { uptime: '99.6%', requests: '320K' },
      tags: ['Аналитика', 'Метрики', 'Отчетность'],
      details: {
        technology: 'Python + Elasticsearch',
        scaling: 'Фиксированное (3 экземпляра)',
        responsibilities: [
          'Хранение и извлечение исторических данных',
          'Агрегация данных для дашбордов',
          'Анализ трендов',
          'Генерация отчетов',
          'Отслеживание KPI и оповещения'
        ]
      }
    }
  },
  {
    id: 'integration-hub',
    type: 'serviceNode',
    position: { x: 450, y: 350 },
    data: {
      label: 'Интеграционный хаб',
      description: 'Управляет интеграциями с внешними источниками данных и сторонними сервисами.',
      icon: <ApiOutlined style={{ color: '#13c2c2' }} />,
      color: '#13c2c2',
      status: 'active',
      metrics: { uptime: '99.4%', requests: '780K' },
      tags: ['Интеграция', 'API', 'Внешние сервисы'],
      details: {
        technology: 'Java Spring Integration',
        scaling: 'Автомасштабирование (2-8 экземпляров)',
        responsibilities: [
          'Подключение к внешним API',
          'Трансформация данных',
          'Управление подключениями',
          'Обработка ошибок и повторные попытки',
          'Мониторинг доступности сервисов'
        ]
      }
    }
  }
];

// Define connections between services
const serviceConnections = [
  { id: 'core-risk', source: 'core', target: 'risk-engine', animated: true },
  { id: 'core-data', source: 'core', target: 'data-processor', animated: true },
  { id: 'core-rules', source: 'core', target: 'rules-engine', animated: true },
  { id: 'core-notify', source: 'core', target: 'notification', animated: true },
  { id: 'core-analytics', source: 'core', target: 'analytics', animated: true },
  { id: 'core-integration', source: 'core', target: 'integration-hub', animated: true },
  { id: 'data-risk', source: 'data-processor', target: 'risk-engine' },
  { id: 'data-rules', source: 'data-processor', target: 'rules-engine' },
  { id: 'risk-rules', source: 'risk-engine', target: 'rules-engine' },
  { id: 'rules-notify', source: 'rules-engine', target: 'notification' },
  { id: 'analytics-notify', source: 'analytics', target: 'notification', style: { stroke: '#999', strokeDasharray: '5,5' } },
  { id: 'integration-data', source: 'integration-hub', target: 'data-processor' },
  { id: 'integration-risk', source: 'integration-hub', target: 'risk-engine', style: { stroke: '#999', strokeDasharray: '5,5' } }
];

// External integrations data
const externalIntegrations = [
  {
    name: 'CRM Systems',
    icon: <ApartmentOutlined />,
    description: 'Integrates with various CRM systems to retrieve client data',
    connectedTo: ['Integration Hub'],
    dataFlow: 'Bidirectional',
    status: 'Active',
    details: [
      { type: 'SalesForce API', status: 'Active', syncFrequency: 'Real-time' },
      { type: 'MS Dynamics', status: 'Active', syncFrequency: '15 min' },
      { type: 'Custom CRM connectors', status: 'Available', syncFrequency: 'Configurable' }
    ]
  },
  {
    name: 'Banking Systems',
    icon: <SafetyOutlined />,
    description: 'Connects to banking APIs for transaction data and verification',
    connectedTo: ['Integration Hub', 'Data Processor'],
    dataFlow: 'Read-only',
    status: 'Active',
    details: [
      { type: 'Open Banking API', status: 'Active', syncFrequency: 'Real-time' },
      { type: 'SWIFT', status: 'Active', syncFrequency: 'Daily' },
      { type: 'Card Payment Networks', status: 'Active', syncFrequency: 'Near real-time' }
    ]
  },
  {
    name: 'Identity Verification',
    icon: <SafetyOutlined />,
    description: 'Third-party services for identity verification and document validation',
    connectedTo: ['Integration Hub', 'Risk Engine'],
    dataFlow: 'Bidirectional',
    status: 'Active',
    details: [
      { type: 'Document Verification', status: 'Active', syncFrequency: 'On-demand' },
      { type: 'Biometric Verification', status: 'Active', syncFrequency: 'On-demand' },
      { type: 'Digital Identity Validation', status: 'Active', syncFrequency: 'On-demand' }
    ]
  },
  {
    name: 'Watchlists',
    icon: <InfoCircleOutlined />,
    description: 'Connections to various regulatory and sanctions lists',
    connectedTo: ['Integration Hub', 'Rules Engine'],
    dataFlow: 'Read-only',
    status: 'Active',
    details: [
      { type: 'PEP Lists', status: 'Active', syncFrequency: 'Daily' },
      { type: 'Sanctions Lists', status: 'Active', syncFrequency: 'Daily' },
      { type: 'Adverse Media', status: 'Active', syncFrequency: '12 hours' }
    ]
  },
  {
    name: 'Risk Databases',
    icon: <DatabaseOutlined />,
    description: 'External databases with fraud patterns and risk indicators',
    connectedTo: ['Risk Engine'],
    dataFlow: 'Read-only',
    status: 'Active',
    details: [
      { type: 'Fraud Pattern DB', status: 'Active', syncFrequency: 'Hourly' },
      { type: 'Industry Risk Feed', status: 'Active', syncFrequency: 'Daily' },
      { type: 'Consortium Data', status: 'Active', syncFrequency: 'Weekly' }
    ]
  }
];

// Adapters data
const adapters = [
  {
    name: 'REST API Adapter',
    type: 'Input/Output',
    description: 'Handles all REST API communication with client systems',
    compatibility: ['JSON', 'XML'],
    status: 'Active',
    usage: 'High',
    security: 'OAuth 2.0, API Keys, mTLS'
  },
  {
    name: 'SFTP Adapter',
    type: 'Input',
    description: 'Secure file transfer protocol for batch data ingestion',
    compatibility: ['CSV', 'JSON', 'XML', 'Fixed width'],
    status: 'Active',
    usage: 'Medium',
    security: 'SSH Keys, IP Whitelisting'
  },
  {
    name: 'Database Connector',
    type: 'Input/Output',
    description: 'Direct database connection for high-volume data transfer',
    compatibility: ['JDBC', 'ODBC'],
    status: 'Active',
    usage: 'Medium',
    security: 'Encrypted credentials, VPN, IP Whitelisting'
  },
  {
    name: 'Webhook Adapter',
    type: 'Output',
    description: 'Sends real-time notifications via webhooks',
    compatibility: ['JSON'],
    status: 'Active',
    usage: 'High',
    security: 'HMAC Signatures, mTLS'
  },
  {
    name: 'Message Queue Adapter',
    type: 'Input/Output',
    description: 'Integration with message brokers for async communication',
    compatibility: ['Apache Kafka', 'RabbitMQ', 'AWS SQS'],
    status: 'Active',
    usage: 'High',
    security: 'TLS, SASL'
  },
  {
    name: 'GraphQL Adapter',
    type: 'Input/Output',
    description: 'Modern API interface with flexible query capabilities',
    compatibility: ['GraphQL Schema'],
    status: 'Active',
    usage: 'Medium',
    security: 'OAuth 2.0, API Keys'
  }
];

// Custom node types
const nodeTypes = {
  serviceNode: ServiceNode,
};

// Table columns definition for adapters
const adapterColumns = [
  {
    title: 'Adapter Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (type: string) => <Tag color={type.includes('Input') && type.includes('Output') ? 'purple' : type.includes('Input') ? 'blue' : 'orange'}>{type}</Tag>
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Compatibility',
    dataIndex: 'compatibility',
    key: 'compatibility',
    render: (formats: string[]) => (
      <span>
        {formats.map((format: string) => (
          <Tag key={format}>{format}</Tag>
        ))}
      </span>
    )
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Badge status={status === 'Active' ? 'success' : 'warning'} text={status} />
    )
  },
  {
    title: 'Usage',
    dataIndex: 'usage',
    key: 'usage',
  },
  {
    title: 'Security',
    dataIndex: 'security',
    key: 'security',
  }
];

const SystemArchitecture: React.FC = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [tab, setTab] = useState('overview');

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    const service = microservices.find(s => s.id === node.id);
    setSelectedService(service);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Архитектура WareVision Anti-Fraud System</Title>
      <Paragraph>
        Интерактивная визуализация микросервисной архитектуры, показывающая все компоненты, интеграции и потоки данных в системе.
      </Paragraph>

      <Tabs activeKey={tab} onChange={setTab}>
        <TabPane tab="Обзор системы" key="overview">
          <Row gutter={[16, 16]}>
            <Col span={18}>
              <Card title="Микросервисная архитектура" bordered={false}>
                <div style={{ height: 500 }}>
                  <ReactFlowProvider>
                    <ReactFlow
                      nodes={microservices}
                      edges={serviceConnections}
                      nodeTypes={nodeTypes}
                      onNodeClick={onNodeClick}
                      fitView
                    >
                      <Background />
                      <Controls />
                    </ReactFlow>
                  </ReactFlowProvider>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                title="Детали сервиса" 
                bordered={false}
                style={{ height: 500, overflow: 'auto' }}
              >
                {selectedService ? (
                  <div>
                    <Title level={4}>{selectedService.data.label}</Title>
                    <Badge 
                      status={selectedService.data.status === 'active' ? 'success' : selectedService.data.status === 'warning' ? 'warning' : 'error'} 
                      text={selectedService.data.status === 'active' ? 'Работает' : selectedService.data.status === 'warning' ? 'Предупреждение' : 'Офлайн'} 
                      style={{ marginBottom: 16 }}
                    />
                    
                    <Paragraph>{selectedService.data.description}</Paragraph>
                    
                    <Divider orientation="left">Метрики</Divider>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic title="Доступность" value={selectedService.data.metrics?.uptime || '99.9%'} />
                      </Col>
                      <Col span={12}>
                        <Statistic title="Запросы" value={selectedService.data.metrics?.requests || '0'} />
                      </Col>
                    </Row>
                    
                    <Divider orientation="left">Детали</Divider>
                    <p><strong>Технология:</strong> {selectedService.data.details?.technology}</p>
                    <p><strong>Масштабирование:</strong> {selectedService.data.details?.scaling}</p>
                    
                    <Divider orientation="left">Обязанности</Divider>
                    <ul>
                      {selectedService.data.details?.responsibilities.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                    
                    <Space wrap style={{ marginTop: 8 }}>
                      {selectedService.data.tags?.map((tag: string) => (
                        <Tag key={tag} color="blue">{tag}</Tag>
                      ))}
                    </Space>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <Paragraph style={{ marginTop: 100 }}>
                      <InfoCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                      <br />
                      Нажмите на любой сервис, чтобы увидеть детали
                    </Paragraph>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Collapse defaultActiveKey={['1']}>
                <Panel header="Общее состояние системы" key="1">
                  <Row gutter={[16, 16]}>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="Общее состояние системы"
                          value={98.2}
                          suffix="%"
                          valueStyle={{ color: '#3f8600' }}
                          prefix={<CheckCircleOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="Сервисы онлайн"
                          value="6/7"
                          valueStyle={{ color: '#cf1322' }}
                          prefix={<ClusterOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="Среднее время ответа"
                          value={124}
                          suffix="мс"
                          valueStyle={{ color: '#1890ff' }}
                          prefix={<SyncOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="Активные интеграции"
                          value="18/20"
                          valueStyle={{ color: '#faad14' }}
                          prefix={<ApiOutlined />}
                        />
                      </Card>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Интеграции" key="integrations">
          <Card title="Интеграции с внешними системами" bordered={false}>
            <Paragraph>
              WareVision Anti-Fraud System интегрируется с различными внешними системами через безопасные и стандартизированные интерфейсы.
              Эти интеграции позволяют обогащать и проверять данные в реальном времени для комплексного обнаружения мошенничества.
            </Paragraph>
            
            <Row gutter={[16, 16]}>
              {externalIntegrations.map((integration, index) => (
                <Col span={8} key={index}>
                  <Card 
                    title={
                      <Space>
                        {integration.icon}
                        {integration.name}
                      </Space>
                    }
                    extra={
                      <Tag color={integration.status === 'Active' ? 'green' : 'orange'}>
                        {integration.status === 'Active' ? 'Активна' : 'В разработке'}
                      </Tag>
                    }
                  >
                    <Paragraph>{integration.description}</Paragraph>
                    <p><strong>Связано с:</strong> {integration.connectedTo.join(', ')}</p>
                    <p><strong>Поток данных:</strong> {integration.dataFlow}</p>
                    
                    <Divider orientation="left">Детали интеграции</Divider>
                    <ul>
                      {integration.details.map((detail, idx) => (
                        <li key={idx}>
                          <strong>{detail.type}</strong>: {detail.status}, 
                          синхронизация {
                            detail.syncFrequency === 'real-time' ? 'в реальном времени' : 
                            detail.syncFrequency === 'hourly' ? 'ежечасно' : 
                            detail.syncFrequency === 'daily' ? 'ежедневно' : 
                            detail.syncFrequency
                          }
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </TabPane>
        
        <TabPane tab="Адаптеры" key="adapters">
          <Card title="Системные адаптеры" bordered={false}>
            <Paragraph>
              WareVision использует различные адаптеры для обеспечения бесшовной интеграции с клиентскими системами и внешними сервисами.
              Эти адаптеры обрабатывают различные протоколы связи, форматы данных и требования безопасности.
            </Paragraph>
            
            <Table
              dataSource={adapters}
              columns={adapterColumns}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SystemArchitecture;
