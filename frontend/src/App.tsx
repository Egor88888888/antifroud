import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, ConfigProvider, Button, Typography } from 'antd';
import {
  UserOutlined,
  AlertOutlined,
  ApartmentOutlined,
  DashboardOutlined,
  SafetyOutlined,
  ShareAltOutlined,
  QuestionCircleOutlined,
  ClusterOutlined,
  FileOutlined,
  ApiOutlined
} from '@ant-design/icons';

// Import pages
import Dashboard from './pages/Dashboard';
import ClientSearch from './pages/ClientSearch';
import IncidentManagement from './pages/IncidentManagement';
import GraphAnalytics from './pages/GraphAnalytics';
import RiskScoring from './pages/RiskScoring';
import ProcessVisualization from './pages/ProcessVisualization';
import ApiProcessVisualization from './pages/ApiProcessVisualization';
import SystemArchitecture from './pages/SystemArchitecture';
import BpmnDesignerPage from './pages/BpmnDesignerPage';

// Import components
import SystemTour from './components/SystemTour';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

// Настройки темы
const theme = {
  token: {
    colorPrimary: '#004B85',
    colorLink: '#8EC0FF',
    colorSuccess: '#CAFF85',
    borderRadius: 4,
    fontFamily: 'Roboto, sans-serif',
  },
};

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [tourVisible, setTourVisible] = useState(false);

  return (
    <ConfigProvider theme={theme}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ 
            padding: '0 24px', 
            background: '#004B85', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Title level={3} style={{ margin: 0, color: '#FFFFFF' }}>
                WareVision Anti-Fraud System
              </Title>
            </div>
            <Button 
              type="text" 
              icon={<QuestionCircleOutlined />} 
              style={{ color: '#FFFFFF' }}
              onClick={() => setTourVisible(true)}
            >
              Тур по системе
            </Button>
          </Header>
          
          <Layout>
            <Sider 
              width={200} 
              collapsible 
              collapsed={collapsed}
              onCollapse={value => setCollapsed(value)}
              style={{ background: '#fff' }}
            >
              <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                style={{ height: '100%', borderRight: 0 }}
              >
                <Menu.Item key="1" icon={<DashboardOutlined />}>
                  <Link to="/">Dashboard</Link>
                </Menu.Item>
                <Menu.Item key="2" icon={<UserOutlined />}>
                  <Link to="/clients">Client Search</Link>
                </Menu.Item>
                <Menu.Item key="3" icon={<AlertOutlined />}>
                  <Link to="/incidents">Incidents</Link>
                </Menu.Item>
                <Menu.Item key="4" icon={<ApartmentOutlined />}>
                  <Link to="/graph">Graph Analytics</Link>
                </Menu.Item>
                <Menu.Item key="5" icon={<SafetyOutlined />}>
                  <Link to="/scoring">Risk Scoring</Link>
                </Menu.Item>
                <Menu.Item key="6" icon={<ShareAltOutlined />}>
                  <Link to="/processes">Process Visualization</Link>
                </Menu.Item>
                <Menu.Item key="7" icon={<ApiOutlined />}>
                  <Link to="/api-processes">API Processes</Link>
                </Menu.Item>
                <Menu.Item key="8" icon={<FileOutlined />}>
                  <Link to="/bpmn-designer">BPMN Designer</Link>
                </Menu.Item>
                <Menu.Item key="9" icon={<ClusterOutlined />}>
                  <Link to="/architecture">System Architecture</Link>
                </Menu.Item>
              </Menu>
            </Sider>
            
            <Layout style={{ padding: '24px' }}>
              <Content style={{
                background: '#fff',
                padding: 24,
                margin: 0,
                minHeight: 280,
                borderRadius: 4,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/clients" element={<ClientSearch />} />
                  <Route path="/incidents" element={<IncidentManagement />} />
                  <Route path="/graph" element={<GraphAnalytics />} />
                  <Route path="/scoring" element={<RiskScoring />} />
                  <Route path="/processes" element={<ProcessVisualization />} />
                  <Route path="/api-processes" element={<ApiProcessVisualization />} />
                  <Route path="/bpmn-designer" element={<BpmnDesignerPage />} />
                  <Route path="/architecture" element={<SystemArchitecture />} />
                </Routes>
              </Content>
            </Layout>
          </Layout>

          {/* Интерактивный тур по системе */}
          <SystemTour autoStart={false} isVisible={tourVisible} onClose={() => setTourVisible(false)} />
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App; 