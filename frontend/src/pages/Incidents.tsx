import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Typography, Input, Badge } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Мок-данные для таблицы инцидентов
const mockIncidents = [
  {
    key: '1',
    id: 'INC001',
    type: 'Identity Fraud',
    status: 'open',
    priority: 'high',
    description: 'Подозрительные документы при идентификации личности',
    assignedTo: 'Анна Смирнова',
    created: '2023-05-10 14:23',
  },
  {
    key: '2',
    id: 'INC002',
    type: 'Document Forgery',
    status: 'in_progress',
    priority: 'medium',
    description: 'Возможная подделка паспорта при верификации',
    assignedTo: 'Иван Петров',
    created: '2023-05-11 09:45',
  },
  {
    key: '3',
    id: 'INC003',
    type: 'Suspicious Transaction',
    status: 'closed',
    priority: 'low',
    description: 'Необычная активность по счету клиента',
    assignedTo: 'Сергей Иванов',
    created: '2023-05-09 16:30',
  },
  {
    key: '4',
    id: 'INC004',
    type: 'AML Alert',
    status: 'open',
    priority: 'high',
    description: 'Совпадение по санкционному списку',
    assignedTo: 'Мария Козлова',
    created: '2023-05-12 11:15',
  },
  {
    key: '5',
    id: 'INC005',
    type: 'Unusual Activity',
    status: 'in_progress',
    priority: 'medium',
    description: 'Множественные попытки входа из разных локаций',
    assignedTo: 'Дмитрий Соколов',
    created: '2023-05-11 13:20',
  },
];

const Incidents: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [incidents, setIncidents] = useState(mockIncidents);

  // Функция для фильтрации инцидентов по поисковому запросу
  const handleSearch = (value: string) => {
    setSearchText(value);
    const filteredData = mockIncidents.filter(
      (incident) =>
        incident.id.toLowerCase().includes(value.toLowerCase()) ||
        incident.type.toLowerCase().includes(value.toLowerCase()) ||
        incident.description.toLowerCase().includes(value.toLowerCase()) ||
        incident.assignedTo.toLowerCase().includes(value.toLowerCase())
    );
    setIncidents(filteredData);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: any, b: any) => a.id.localeCompare(b.id),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case 'open':
            color = 'red';
            text = 'Открыт';
            break;
          case 'in_progress':
            color = 'orange';
            text = 'В работе';
            break;
          case 'closed':
            color = 'green';
            text = 'Закрыт';
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return <Badge status={status === 'open' ? 'error' : status === 'in_progress' ? 'processing' : 'success'} text={text} />;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const color = priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'green';
        const text = priority === 'high' ? 'Высокий' : priority === 'medium' ? 'Средний' : 'Низкий';
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      sorter: (a: any, b: any) => new Date(a.created).getTime() - new Date(b.created).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => console.log('View incident', record.id)}
          >
            Просмотр
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => console.log('Delete incident', record.id)}
          >
            Удалить
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Incident Management" style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space>
          <Input.Search
            placeholder="Поиск по ID, типу, описанию или ответственному"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ width: 400 }}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={handleSearch}
          />
          <Button type="primary" size="large">
            Создать инцидент
          </Button>
        </Space>
        
        <Table 
          columns={columns} 
          dataSource={incidents}
          pagination={{ pageSize: 5 }}
          rowKey="id"
        />
      </Space>
    </Card>
  );
};

export default Incidents; 