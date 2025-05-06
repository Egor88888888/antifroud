import axios from 'axios';

// Базовая конфигурация axios
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Мок-данные для инцидентов
const mockIncidents = [
  {
    id: 1,
    client_id: 1001,
    type: 'Identity Fraud',
    status: 'open',
    priority: 'high',
    description: 'Подозрительные документы при идентификации личности',
    assignedTo: 'Анна Смирнова',
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
    assignedTo: 'Иван Петров',
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
    assignedTo: 'Сергей Иванов',
    resolution: 'Проверено, активность подтверждена клиентом',
    created_at: '2023-05-09T16:30:00Z',
    updated_at: '2023-05-11T10:45:00Z'
  }
];

// Мок-данные для клиентов
const mockClients = [
  {
    id: 1001,
    name: 'Иванов Иван Иванович',
    birthDate: '1985-05-15',
    passport: '4505 123456',
    phone: '+7 (999) 123-45-67',
    email: 'ivanov@example.com',
    riskLevel: 'low',
    status: 'active'
  },
  {
    id: 1002,
    name: 'Петров Петр Петрович',
    birthDate: '1990-10-20',
    passport: '4510 654321',
    phone: '+7 (999) 765-43-21',
    email: 'petrov@example.com',
    riskLevel: 'medium',
    status: 'pending'
  },
  {
    id: 1003,
    name: 'Сидорова Анна Викторовна',
    birthDate: '1988-03-30',
    passport: '4512 111222',
    phone: '+7 (999) 111-22-33',
    email: 'sidorova@example.com',
    riskLevel: 'high',
    status: 'blocked'
  }
];

// API-функции
export const incidentsApi = {
  getAll: async () => {
    // В реальном проекте был бы запрос: return API.get('/incidents');
    return Promise.resolve({ data: mockIncidents });
  },
  getById: async (id: number) => {
    // В реальном проекте был бы запрос: return API.get(`/incidents/${id}`);
    const incident = mockIncidents.find(inc => inc.id === id);
    return Promise.resolve({ data: incident });
  },
  create: async (data: any) => {
    // В реальном проекте был бы запрос: return API.post('/incidents', data);
    return Promise.resolve({ data: { ...data, id: Date.now() } });
  },
  update: async (id: number, data: any) => {
    // В реальном проекте был бы запрос: return API.put(`/incidents/${id}`, data);
    return Promise.resolve({ data: { ...data, id } });
  },
  delete: async (id: number) => {
    // В реальном проекте был бы запрос: return API.delete(`/incidents/${id}`);
    return Promise.resolve({ data: { success: true } });
  }
};

export const clientsApi = {
  getAll: async () => {
    // В реальном проекте был бы запрос: return API.get('/clients');
    return Promise.resolve({ data: mockClients });
  },
  getById: async (id: number) => {
    // В реальном проекте был бы запрос: return API.get(`/clients/${id}`);
    const client = mockClients.find(c => c.id === id);
    return Promise.resolve({ data: client });
  },
  search: async (query: string) => {
    // В реальном проекте был бы запрос: return API.get(`/clients/search?q=${query}`);
    const filteredClients = mockClients.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) || 
      c.passport.includes(query) || 
      c.phone.includes(query)
    );
    return Promise.resolve({ data: filteredClients });
  }
};

export default API; 