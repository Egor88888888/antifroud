import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space, Typography, Avatar, Progress, Button, Tooltip, Divider } from 'antd';
import {
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DashboardOutlined,
  FireOutlined,
  SafetyOutlined,
  LineChartOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';
import axios from 'axios';
import CountUp from 'react-countup';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement
);

const { Text, Title: AntTitle } = Typography;

// Define interfaces for type safety
interface IncidentStats {
  total: number;
  open: number;
  in_progress: number;
  closed: number;
  trend?: number;
}

interface ClientStats {
  total: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  new_today?: number;
}

interface ListStats {
  total: number;
  matches_today: number;
  screening_rate?: number;
}

interface Stats {
  incidents: IncidentStats;
  clients: ClientStats;
  lists: ListStats;
}

interface Incident {
  id: string;
  client: string;
  type: string;
  priority: string;
  status: string;
  timestamp: string;
  amount: string;
  risk_score: number;
}

// Function to format numbers with commas
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Custom statistic formatter for CountUp
interface CustomFormatterProps {
  value: number;
  precision?: number;
  prefix?: string;
  suffix?: string;
  countUp?: boolean;
}

const CustomFormatter: React.FC<CustomFormatterProps> = ({ 
  value, 
  precision = 0, 
  prefix = '', 
  suffix = '', 
  countUp = false 
}) => (
  <span>
    {prefix}
    <CountUp 
      end={value} 
      duration={2.5} 
      separator="," 
      decimals={precision}
      redraw={false}
    />
    {suffix}
  </span>
);

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<Stats>({
    incidents: { total: 0, open: 0, in_progress: 0, closed: 0 },
    clients: { total: 0, high_risk: 0, medium_risk: 0, low_risk: 0 },
    lists: { total: 0, matches_today: 0 }
  });

  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch statistics from various services
        const [incidentStats, listStats] = await Promise.all([
          axios.get('/api/incidents/stats'),
          axios.get('/api/lists/stats')
        ]);
        
        // Mock data since the API doesn't exist
        setStats({
          incidents: { 
            total: 254, 
            open: 32, 
            in_progress: 47, 
            closed: 175,
            trend: 12.3 // percent increase from last period
          },
          clients: {
            total: 1450,
            high_risk: 145,
            medium_risk: 435,
            low_risk: 870,
            new_today: 32
          },
          lists: { 
            total: 15, 
            matches_today: 18,
            screening_rate: 92.5 // percent of clients screened
          }
        });
        
        // Mock recent incidents
        setRecentIncidents([
          { id: 'INC-2023112', client: 'Acme Corp', type: 'Suspicious Transaction', priority: 'High', status: 'Open', timestamp: '2023-11-20T14:22:00Z', amount: '$24,500', risk_score: 87 },
          { id: 'INC-2023111', client: 'Global Traders', type: 'Document Verification', priority: 'Medium', status: 'In Progress', timestamp: '2023-11-20T13:15:00Z', amount: '$8,200', risk_score: 64 },
          { id: 'INC-2023110', client: 'Tech Solutions Inc', type: 'Sanctions Match', priority: 'High', status: 'Open', timestamp: '2023-11-20T11:32:00Z', amount: '$15,750', risk_score: 92 },
          { id: 'INC-2023109', client: 'Green Energy Ltd', type: 'Unusual Activity', priority: 'Low', status: 'Closed', timestamp: '2023-11-20T09:45:00Z', amount: '$3,200', risk_score: 45 },
          { id: 'INC-2023108', client: 'Construction Partners', type: 'Identity Verification', priority: 'Medium', status: 'In Progress', timestamp: '2023-11-20T08:17:00Z', amount: '$12,800', risk_score: 72 }
        ]);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Here would be the API calls to refresh the data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      // Then update state with new data
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Chart data for incident trends with gradient
  const incidentTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Incidents',
        data: [65, 59, 80, 81, 56, 55, 72],
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(75, 192, 192, 0.5)');
          gradient.addColorStop(1, 'rgba(75, 192, 192, 0.0)');
          return gradient;
        },
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  // Chart data for risk distribution
  const riskDistributionData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [
      {
        data: [145, 435, 870],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1,
        hoverOffset: 10
      }
    ]
  };

  // Chart data for alerts by category
  const alertsByCategoryData = {
    labels: ['KYC', 'AML', 'Fraud', 'Sanctions', 'PEP'],
    datasets: [
      {
        label: 'Alerts',
        data: [42, 28, 35, 15, 12],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderRadius: 5
      }
    ]
  };

  // Recent incidents table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string, record: Incident) => (
        <Button type="link" style={{ padding: 0 }}>{text}</Button>
      )
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      render: (text: string) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>{text.charAt(0)}</Avatar>
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Risk Score',
      dataIndex: 'risk_score',
      key: 'risk_score',
      render: (score: number) => {
        let color = score >= 80 ? '#f5222d' : score >= 60 ? '#fa8c16' : '#52c41a';
        return (
          <Tooltip title={`Risk Level: ${score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low'}`}>
            <Progress 
              percent={score} 
              size="small" 
              showInfo={false}
              strokeColor={color}
              trailColor="#f0f0f0"
              style={{ width: 80 }}
            />
            <Text style={{ color }}>{score}</Text>
          </Tooltip>
        );
      }
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors: Record<string, string> = {
          High: 'red',
          Medium: 'orange',
          Low: 'green'
        };
        return <Tag color={colors[priority]}>{priority}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const icons: Record<string, React.ReactNode> = {
          Open: <ExclamationCircleOutlined />,
          'In Progress': <AlertOutlined />,
          Closed: <CheckCircleOutlined />
        };
        const colors: Record<string, string> = {
          Open: 'red',
          'In Progress': 'blue',
          Closed: 'green'
        };
        return (
          <Tag icon={icons[status]} color={colors[status]}>
            {status}
          </Tag>
        );
      }
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string) => <Text strong>{amount}</Text>
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <DashboardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <AntTitle level={3} style={{ margin: 0 }}>WareVision Anti-Fraud Dashboard</AntTitle>
        </Space>
        
        <Space>
          <Button 
            type="primary" 
            icon={<ReloadOutlined spin={refreshing} />} 
            onClick={handleRefresh} 
            loading={refreshing}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            className="stat-card" 
            bordered={false}
            style={{ 
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.85)' }}>Total Incidents</Text>
                <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 4, color: 'white' }}>
                  <CustomFormatter value={stats.incidents.total} />
                </div>
                <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)' }}>
                  <ArrowUpOutlined /> {stats.incidents.trend ?? 0}% from last week
                </Text>
              </div>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <AlertOutlined style={{ fontSize: 24, color: 'white' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            className="stat-card"
            bordered={false}
            style={{ 
              background: 'linear-gradient(135deg, #f5222d 0%, #cf1322 100%)',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(245, 34, 45, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.85)' }}>Open Incidents</Text>
                <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 4, color: 'white' }}>
                  <CustomFormatter value={stats.incidents.open} />
                </div>
                <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)' }}>
                  <FireOutlined /> Requires immediate attention
                </Text>
              </div>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <ExclamationCircleOutlined style={{ fontSize: 24, color: 'white' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            className="stat-card"
            bordered={false}
            style={{ 
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.85)' }}>Total Clients</Text>
                <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 4, color: 'white' }}>
                  <CustomFormatter value={stats.clients.total} />
                </div>
                <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)' }}>
                  <ArrowUpOutlined /> {stats.clients.new_today ?? 0} new today
                </Text>
              </div>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <UserOutlined style={{ fontSize: 24, color: 'white' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            className="stat-card"
            bordered={false}
            style={{ 
              background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(114, 46, 209, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.85)' }}>Watchlist Matches</Text>
                <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 4, color: 'white' }}>
                  <CustomFormatter value={stats.lists.matches_today} />
                </div>
                <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)' }}>
                  <SafetyOutlined /> {stats.lists.screening_rate ?? 0}% screening rate
                </Text>
              </div>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: '50%', 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: 'white' }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <LineChartOutlined style={{ color: '#1890ff' }} />
                  <Text strong>Weekly Incident Trends</Text>
                </Space>
                <div>
                  <Button.Group size="small">
                    <Button type={timeRange === 'week' ? 'primary' : 'default'} onClick={() => setTimeRange('week')}>Week</Button>
                    <Button type={timeRange === 'month' ? 'primary' : 'default'} onClick={() => setTimeRange('month')}>Month</Button>
                    <Button type={timeRange === 'year' ? 'primary' : 'default'} onClick={() => setTimeRange('year')}>Year</Button>
                  </Button.Group>
                </div>
              </div>
            }
            bordered={false}
            className="chart-card"
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)'
            }}
          >
            <Line
              data={incidentTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: 'top' as const,
                    labels: {
                      usePointStyle: true,
                      boxWidth: 6
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    bodyFont: {
                      size: 13
                    },
                    padding: 10,
                    cornerRadius: 4,
                    boxPadding: 4
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
              style={{ height: '300px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            title={
              <Space>
                <SafetyOutlined style={{ color: '#1890ff' }} />
                <Text strong>Client Risk Distribution</Text>
              </Space>
            }
            bordered={false}
            className="chart-card"
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
              height: '100%'
            }}
          >
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pie
                data={riskDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        usePointStyle: true,
                        padding: 15,
                        boxWidth: 8
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      bodyFont: {
                        size: 13
                      },
                      padding: 10,
                      cornerRadius: 4,
                      boxPadding: 4,
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw as number;
                          const total = (context.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                          const percentage = Math.round((value / total) * 100);
                          return `${label}: ${formatNumber(value)} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            title={
              <Space>
                <AlertOutlined style={{ color: '#1890ff' }} />
                <Text strong>Alerts by Category</Text>
              </Space>
            }
            bordered={false}
            className="chart-card"
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
              height: '100%'
            }}
          >
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bar
                data={alertsByCategoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y' as const,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      bodyFont: {
                        size: 13
                      },
                      padding: 10,
                      cornerRadius: 4,
                      boxPadding: 4
                    }
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: {
                        display: false
                      }
                    },
                    y: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Incidents Table */}
      <Card 
        title={
          <Space>
            <AlertOutlined style={{ color: '#1890ff' }} />
            <Text strong>Recent Incidents</Text>
            <Tag color="blue">{recentIncidents.length} new today</Tag>
          </Space>
        }
        extra={<Button type="link">View All</Button>}
        bordered={false}
        className="incidents-card"
        style={{ 
          marginTop: 16,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)'
        }}
      >
        <Table
          columns={columns}
          dataSource={recentIncidents}
          loading={loading}
          rowKey="id"
          pagination={false}
          style={{ marginTop: 8 }}
          rowClassName="incident-row"
          onRow={(record) => ({
            onClick: () => {
              console.log('Clicked on incident:', record);
              // Add navigation or modal open here
            },
            style: { cursor: 'pointer' }
          })}
        />
      </Card>
    </div>
  );
};

export default Dashboard; 