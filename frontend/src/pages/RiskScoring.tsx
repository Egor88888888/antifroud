import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Progress, Space, Typography, Divider, Row, Col, Statistic, Tabs, Select, Button, Tooltip, Alert, Radio } from 'antd';
import { 
  SafetyOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined, 
  WarningOutlined,
  FileSearchOutlined,
  BankOutlined, 
  GlobalOutlined, 
  UserOutlined,
  HistoryOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const RiskScoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskScore, setRiskScore] = useState(65);
  const [riskFactors, setRiskFactors] = useState([
    {
      key: '1',
      factor: 'Identity Verification',
      weight: 80,
      status: 'passed',
      icon: <UserOutlined />,
      description: 'Verification of customer identity documents and biometric checks',
      details: 'Customer identity verified through document analysis and facial recognition. All checks passed successfully.',
      lastChecked: '2023-11-21T08:15:00Z'
    },
    {
      key: '2',
      factor: 'Document Verification',
      weight: 60,
      status: 'warning',
      icon: <FileSearchOutlined />,
      description: 'Analysis and validation of supporting documents provided by the customer',
      details: 'Some supporting documents have minor discrepancies that require follow-up. Additional verification recommended.',
      lastChecked: '2023-11-21T08:17:30Z'
    },
    {
      key: '3',
      factor: 'Sanctions Screening',
      weight: 30,
      status: 'failed',
      icon: <GlobalOutlined />,
      description: 'Checking customer against global sanctions and watchlists',
      details: 'Potential match found on international watchlist. Manual review required to confirm or dismiss match.',
      lastChecked: '2023-11-21T08:20:15Z'
    },
    {
      key: '4',
      factor: 'Transaction Analysis',
      weight: 75,
      status: 'passed',
      icon: <BankOutlined />,
      description: 'Analysis of transaction patterns and financial behavior',
      details: 'Transaction patterns are consistent with declared business activity. No suspicious patterns detected.',
      lastChecked: '2023-11-21T08:22:45Z'
    },
    {
      key: '5',
      factor: 'Behavioral Analysis',
      weight: 45,
      status: 'warning',
      icon: <BarChartOutlined />,
      description: 'Analysis of user behavior patterns and anomaly detection',
      details: 'Some unusual login patterns detected from unexpected locations. Additional monitoring recommended.',
      lastChecked: '2023-11-21T08:25:30Z'
    }
  ]);

  // Define calculateRiskScore with useCallback to avoid dependency cycles
  const calculateRiskScore = useCallback(() => {
    // Simple weighted average calculation
    const totalWeight = riskFactors.reduce((sum, factor) => sum + factor.weight, 0);
    const weightedScore = riskFactors.reduce((sum, factor) => {
      // Convert status to a numerical value
      let statusValue = 0;
      switch (factor.status) {
        case 'passed': statusValue = 1; break;
        case 'warning': statusValue = 0.5; break;
        case 'failed': statusValue = 0; break;
      }
      return sum + (factor.weight * statusValue);
    }, 0);
    
    // Calculate percentage and round to nearest integer
    const newScore = Math.round((weightedScore / totalWeight) * 100);
    setRiskScore(newScore);
  }, [riskFactors]);

  useEffect(() => {
    // Calculate risk score based on factor weights and statuses
    calculateRiskScore();
  }, [calculateRiskScore]);

  const refreshRiskAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate API call with a delay
    setTimeout(() => {
      // Simulate updating risk factors with new values
      setRiskFactors(prev => 
        prev.map(factor => ({
          ...factor,
          weight: Math.min(100, Math.max(10, factor.weight + Math.floor(Math.random() * 20) - 10)),
          lastChecked: new Date().toISOString()
        }))
      );
      setIsAnalyzing(false);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'success';
      case 'warning': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning': return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'failed': return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed': return 'Пройден';
      case 'warning': return 'Требует внимания';
      case 'failed': return 'Не пройден';
      default: return 'Неизвестно';
    }
  };

  const getRiskLevelColor = (score: number) => {
    if (score >= 80) return '#52c41a'; // Green - Low Risk
    if (score >= 60) return '#faad14'; // Yellow - Medium Risk
    return '#f5222d'; // Red - High Risk
  };

  const getRiskLevelText = (score: number) => {
    if (score >= 80) return 'Низкий риск';
    if (score >= 60) return 'Средний риск';
    return 'Высокий риск';
  };

  const columns = [
    {
      title: 'Фактор риска',
      dataIndex: 'factor',
      key: 'factor',
      render: (text: string, record: any) => (
        <Space>
          {record.icon}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Вес',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => (
        <Progress 
          percent={weight} 
          size="small" 
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
          {text}
        </Paragraph>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (text: string, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<InfoCircleOutlined />} 
              onClick={() => console.log('View details for', record.factor)}
            />
          </Tooltip>
          <Tooltip title="Run Check Again">
            <Button 
              type="text" 
              icon={<HistoryOutlined />} 
              onClick={() => console.log('Run check again for', record.factor)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderGauge = () => {
    // Make sure riskScore is a valid number
    const validRiskScore = typeof riskScore === 'number' && !isNaN(riskScore) ? riskScore : 0;
    const riskColor = getRiskLevelColor(validRiskScore);
    const riskText = getRiskLevelText(validRiskScore);
    
    // Simple custom gauge visualization that doesn't rely on problematic component
    return (
      <div style={{ position: 'relative', height: '250px', width: '100%', margin: '0 auto' }}>
        {/* Background circle */}
        <div style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: '#f0f0f0',
          overflow: 'hidden'
        }}>
          {/* Colored fill based on score */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: `${validRiskScore}%`,
            background: riskColor,
            transition: 'height 0.5s ease'
          }} />
        </div>
        
        {/* Score display */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '42px',
            fontWeight: 'bold',
            color: riskColor,
            lineHeight: 1.2
          }}>
            {validRiskScore}
          </div>
          <div style={{
            fontSize: '18px',
            color: riskColor,
            fontWeight: 'bold'
          }}>
            {riskText}
          </div>
        </div>
        
        {/* Gauge ticks */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {[0, 25, 50, 75, 100].map(tick => (
            <div key={tick} style={{
              position: 'absolute',
              bottom: '10%',
              left: `${10 + (tick * 0.8)}%`,
              transform: 'translateX(-50%)',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#666'
            }}>
              {tick}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="risk-scoring-container">
      <Card className="title-card" style={{ marginBottom: 16 }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <SafetyOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <Title level={3} style={{ margin: 0 }}>Оценка рисков</Title>
          </Space>
          <Button 
            type="primary" 
            icon={<ThunderboltOutlined />}
            loading={isAnalyzing}
            onClick={refreshRiskAnalysis}
          >
            Обновить анализ
          </Button>
        </Space>
        <Paragraph style={{ marginTop: 16 }}>
          Система автоматически оценивает различные факторы риска и формирует
          итоговый скоринг-балл для принятия решения. Алгоритм использует комбинацию
          проверок, анализа данных и машинного обучения для точной оценки рисков.
        </Paragraph>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Обзор" key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card 
                title={
                  <Space>
                    <SafetyOutlined />
                    <span>Итоговый скоринг-балл</span>
                  </Space>
                }
                className="score-card"
              >
                <div style={{ height: 250 }}>
                  {renderGauge()}
                </div>

                <Divider />
                
                <Alert
                  message={
                    <Space>
                      <InfoCircleOutlined />
                      <Text strong>Рекомендация:</Text>
                    </Space>
                  }
                  description={
                    riskScore >= 80 
                      ? "Клиент относится к группе низкого риска. Можно проводить стандартные операции."
                      : riskScore >= 60
                        ? "Требуется дополнительная проверка. Рекомендуется запросить дополнительные документы."
                        : "Высокий риск! Необходима углубленная проверка и одобрение службы безопасности."
                  }
                  type={
                    riskScore >= 80 
                      ? "success"
                      : riskScore >= 60
                        ? "warning"
                        : "error"
                  }
                  showIcon={false}
                />
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Card 
                title={
                  <Space>
                    <BarChartOutlined />
                    <span>Факторы риска</span>
                  </Space>
                }
                className="factors-card"
              >
                <Table 
                  columns={columns} 
                  dataSource={riskFactors} 
                  rowClassName={(record) => `risk-factor-row risk-factor-${record.status}`}
                  pagination={false}
                  loading={isAnalyzing}
                />
              </Card>
            </Col>
            
            <Col span={24}>
              <Card
                title={
                  <Space>
                    <InfoCircleOutlined />
                    <span>Подробная информация</span>
                  </Space>
                }
                className="details-card"
              >
                <Row gutter={[16, 16]}>
                  {riskFactors.map(factor => (
                    <Col xs={24} sm={12} md={8} key={factor.key}>
                      <Card 
                        className={`factor-detail-card factor-${factor.status}`}
                        size="small"
                        title={
                          <Space>
                            {factor.icon}
                            <Text strong>{factor.factor}</Text>
                          </Space>
                        }
                        extra={
                          <Tag color={getStatusColor(factor.status)}>
                            {getStatusText(factor.status)}
                          </Tag>
                        }
                        style={{ 
                          height: '100%',
                          borderLeft: factor.status === 'passed' 
                            ? '3px solid #52c41a' 
                            : factor.status === 'warning'
                              ? '3px solid #faad14'
                              : '3px solid #f5222d'
                        }}
                      >
                        <Paragraph>{factor.details}</Paragraph>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">
                            <HistoryOutlined /> Последняя проверка: {new Date(factor.lastChecked).toLocaleString()}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="История" key="history">
          <Card>
            <Text type="secondary">История оценок рисков будет доступна в этом разделе.</Text>
          </Card>
        </TabPane>
        
        <TabPane tab="Настройки" key="settings">
          <Card title="Настройки оценки рисков">
            <Row gutter={[16, 24]}>
              <Col span={24}>
                <Title level={5}>Модель оценки риска</Title>
                <Radio.Group defaultValue="weighted" buttonStyle="solid">
                  <Radio.Button value="weighted">Взвешенная модель</Radio.Button>
                  <Radio.Button value="ml">Машинное обучение</Radio.Button>
                  <Radio.Button value="rules">Правила</Radio.Button>
                </Radio.Group>
              </Col>
              
              <Col span={24}>
                <Title level={5}>Пороговые значения для категорий риска</Title>
                <Row gutter={16}>
                  <Col span={8}>
                    <Text>Высокий риск</Text>
                    <Select defaultValue="60" style={{ width: '100%', marginTop: 8 }}>
                      <Option value="50">{"< 50%"}</Option>
                      <Option value="60">{"< 60%"}</Option>
                      <Option value="70">{"< 70%"}</Option>
                    </Select>
                  </Col>
                  <Col span={8}>
                    <Text>Средний риск</Text>
                    <Select defaultValue="80" style={{ width: '100%', marginTop: 8 }}>
                      <Option value="70">{"70-79%"}</Option>
                      <Option value="80">{"60-79%"}</Option>
                      <Option value="90">{"50-69%"}</Option>
                    </Select>
                  </Col>
                  <Col span={8}>
                    <Text>Низкий риск</Text>
                    <Select defaultValue="80" style={{ width: '100%', marginTop: 8 }}>
                      <Option value="70">{">= 70%"}</Option>
                      <Option value="80">{">= 80%"}</Option>
                      <Option value="90">{">= 90%"}</Option>
                    </Select>
                  </Col>
                </Row>
              </Col>
              
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button type="primary">Сохранить настройки</Button>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RiskScoring; 