import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Badge,
  Typography
} from 'antd';
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

interface Incident {
  id: number;
  client_id: number;
  type: string;
  status: string;
  priority: string;
  description: string;
  assigned_to: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
}

interface IncidentNote {
  id: number;
  incident_id: number;
  author: string;
  content: string;
  created_at: string;
}

// Мок-данные для инцидентов
const mockIncidents: Incident[] = [
  {
    id: 1,
    client_id: 1001,
    type: 'Identity Fraud',
    status: 'open',
    priority: 'high',
    description: 'Подозрительные документы при идентификации личности',
    assigned_to: 'Анна Смирнова',
    created_at: '2023-05-10T14:23:00Z',
    updated_at: '2023-05-10T14:23:00Z'
  },
  {
    id: 2,
    client_id: 1002,
    type: 'Document Forgery',
    status: 'in_progress',
    priority: 'medium',
    description: 'Возможная подделка паспорта при верификации',
    assigned_to: 'Иван Петров',
    resolution: 'Запрошены дополнительные документы',
    created_at: '2023-05-11T09:45:00Z',
    updated_at: '2023-05-11T13:20:00Z'
  },
  {
    id: 3,
    client_id: 1003,
    type: 'Suspicious Transaction',
    status: 'closed',
    priority: 'low',
    description: 'Необычная активность по счету клиента',
    assigned_to: 'Сергей Иванов',
    resolution: 'Проверено, активность подтверждена клиентом',
    created_at: '2023-05-09T16:30:00Z',
    updated_at: '2023-05-11T10:45:00Z'
  },
  {
    id: 4,
    client_id: 1004,
    type: 'AML Alert',
    status: 'open',
    priority: 'high',
    description: 'Совпадение по санкционному списку',
    assigned_to: 'Мария Козлова',
    created_at: '2023-05-12T11:15:00Z',
    updated_at: '2023-05-12T11:15:00Z'
  },
  {
    id: 5,
    client_id: 1005,
    type: 'Unusual Activity',
    status: 'in_progress',
    priority: 'medium',
    description: 'Множественные попытки входа из разных локаций',
    assigned_to: 'Дмитрий Соколов',
    created_at: '2023-05-11T13:20:00Z',
    updated_at: '2023-05-12T09:30:00Z'
  }
];

// Мок-данные для заметок
const mockNotes: { [key: number]: IncidentNote[] } = {
  1: [
    {
      id: 101,
      incident_id: 1,
      author: 'Анна Смирнова',
      content: 'Начато расследование. Документы отправлены на экспертизу.',
      created_at: '2023-05-10T15:00:00Z'
    }
  ],
  2: [
    {
      id: 201,
      incident_id: 2,
      author: 'Иван Петров',
      content: 'Запрошены дополнительные документы у клиента.',
      created_at: '2023-05-11T10:30:00Z'
    },
    {
      id: 202,
      incident_id: 2,
      author: 'Система',
      content: 'Автоматическое уведомление отправлено клиенту.',
      created_at: '2023-05-11T10:35:00Z'
    }
  ],
  3: [
    {
      id: 301,
      incident_id: 3,
      author: 'Сергей Иванов',
      content: 'Связался с клиентом, активность подтверждена.',
      created_at: '2023-05-10T09:15:00Z'
    },
    {
      id: 302,
      incident_id: 3,
      author: 'Алексей Кузнецов',
      content: 'Проверка завершена, инцидент закрыт.',
      created_at: '2023-05-11T10:45:00Z'
    }
  ],
  4: [
    {
      id: 401,
      incident_id: 4,
      author: 'Мария Козлова',
      content: 'Выявлено совпадение имени с санкционным списком. Требуется дополнительная проверка.',
      created_at: '2023-05-12T11:45:00Z'
    }
  ],
  5: [
    {
      id: 501,
      incident_id: 5,
      author: 'Система',
      content: 'Обнаружены входы из 5 разных локаций за последние 24 часа.',
      created_at: '2023-05-11T13:30:00Z'
    },
    {
      id: 502,
      incident_id: 5,
      author: 'Дмитрий Соколов',
      content: 'Связался с клиентом, подтвердил что находится в путешествии. Запросил дополнительную аутентификацию.',
      created_at: '2023-05-12T09:30:00Z'
    }
  ]
};

const IncidentManagement: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notes, setNotes] = useState<IncidentNote[]>([]);
  const [form] = Form.useForm();

  // Имитация запроса к API для получения инцидентов
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      // Имитация задержки, как при реальном запросе
      await new Promise(resolve => setTimeout(resolve, 500));
      setIncidents(mockIncidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Имитация запроса к API для получения заметок по инциденту
  const fetchIncidentNotes = async (incidentId: number) => {
    try {
      // Имитация задержки, как при реальном запросе
      await new Promise(resolve => setTimeout(resolve, 300));
      const notesForIncident = mockNotes[incidentId] || [];
      setNotes(notesForIncident);
    } catch (error) {
      console.error('Error fetching incident notes:', error);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    fetchIncidentNotes(incident.id);
    setIsModalVisible(true);
  };

  const handleUpdateStatus = async (values: any) => {
    if (!selectedIncident) return;

    try {
      // Имитация задержки, как при реальном запросе
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Обновляем локальные данные
      const updatedIncidents = incidents.map(inc => 
        inc.id === selectedIncident.id 
          ? {...inc, status: values.status, resolution: values.resolution, updated_at: new Date().toISOString()} 
          : inc
      );
      setIncidents(updatedIncidents);

      // Добавляем заметку, если она была введена
      if (values.note) {
        const newNote: IncidentNote = {
          id: Math.floor(Math.random() * 10000), // Генерируем случайный ID
          incident_id: selectedIncident.id,
          author: 'Текущий пользователь', // В реальной системе - из контекста авторизации
          content: values.note,
          created_at: new Date().toISOString()
        };
        
        // Обновляем локальные данные заметок
        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        
        // Обновляем массив мок-данных
        if (!mockNotes[selectedIncident.id]) {
          mockNotes[selectedIncident.id] = [];
        }
        mockNotes[selectedIncident.id].push(newNote);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error updating incident:', error);
    }
  };

  // Функции для отображения тегов и бейджей
  const getStatusTag = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return <Tag icon={<ExclamationCircleOutlined />} color="error">Открыт</Tag>;
      case 'in_progress':
        return <Tag icon={<ClockCircleOutlined />} color="processing">В работе</Tag>;
      case 'closed':
        return <Tag icon={<CheckCircleOutlined />} color="success">Закрыт</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <Badge status="error" text="Высокий" />;
      case 'medium':
        return <Badge status="warning" text="Средний" />;
      case 'low':
        return <Badge status="default" text="Низкий" />;
      default:
        return <Badge status="default" text={priority} />;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <Tag>{text}</Tag>
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => getPriorityBadge(priority)
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Ответственный',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
    },
    {
      title: 'Создан',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Incident) => (
        <Button type="primary" onClick={() => handleViewIncident(record)}>
          Просмотр
        </Button>
      )
    }
  ];

  return (
    <div>
      <Card title="Управление инцидентами">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button type="primary">Создать инцидент</Button>
          <Table
            columns={columns}
            dataSource={incidents}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Space>
      </Card>

      <Modal
        title="Детали инцидента"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedIncident && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateStatus}
            initialValues={{
              status: selectedIncident.status,
              resolution: selectedIncident.resolution
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Тип инцидента:</Text> {selectedIncident.type}
                <br />
                <Text strong>Приоритет:</Text> {getPriorityBadge(selectedIncident.priority)}
                <br />
                <Text strong>Описание:</Text> {selectedIncident.description}
                <br />
                <Text strong>Клиент ID:</Text> {selectedIncident.client_id}
                <br />
                <Text strong>Создан:</Text> {new Date(selectedIncident.created_at).toLocaleString()}
                <br />
                <Text strong>Обновлен:</Text> {new Date(selectedIncident.updated_at).toLocaleString()}
              </div>

              <Form.Item name="status" label="Статус">
                <Select>
                  <Select.Option value="open">Открыт</Select.Option>
                  <Select.Option value="in_progress">В работе</Select.Option>
                  <Select.Option value="closed">Закрыт</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="resolution" label="Решение">
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="note" label="Добавить заметку">
                <TextArea rows={4} placeholder="Добавьте заметку об этом обновлении..." />
              </Form.Item>

              <div style={{ marginBottom: 16 }}>
                <Text strong>История заметок:</Text>
                {notes.length === 0 ? (
                  <Card size="small" style={{ marginTop: 8 }}>
                    <Text type="secondary">Заметок пока нет</Text>
                  </Card>
                ) : (
                  notes.map(note => (
                    <Card key={note.id} size="small" style={{ marginTop: 8 }}>
                      <Text type="secondary">{new Date(note.created_at).toLocaleString()}</Text>
                      <br />
                      <Text strong>{note.author}:</Text> {note.content}
                    </Card>
                  ))
                )}
              </div>

              <Space>
                <Button type="primary" htmlType="submit">
                  Обновить
                </Button>
                <Button onClick={() => setIsModalVisible(false)}>
                  Отмена
                </Button>
              </Space>
            </Space>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default IncidentManagement; 