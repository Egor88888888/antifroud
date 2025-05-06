// Мок-данные для инцидентов
module.exports = [
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
  },
  {
    id: 4,
    client_id: 1004,
    type: 'AML Alert',
    status: 'open',
    priority: 'high',
    description: 'Совпадение по санкционному списку',
    assignedTo: 'Мария Козлова',
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
    assignedTo: 'Дмитрий Соколов',
    created_at: '2023-05-11T13:20:00Z',
    updated_at: '2023-05-12T09:30:00Z'
  }
]; 