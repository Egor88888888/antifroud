const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Инициализация Express
const app = express();
const port = process.env.PORT || 5000;

// Мок-данные вместо маршрутов API (для быстрой реализации)
const mockIncidents = require('./mock-data/incidents');
const mockClients = require('./mock-data/clients');
const mockAnalytics = require('./mock-data/analytics');

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Маршруты API для инцидентов
app.get('/api/incidents', (req, res) => {
  res.json(mockIncidents);
});

app.get('/api/incidents/:id', (req, res) => {
  const incident = mockIncidents.find(inc => inc.id === parseInt(req.params.id));
  if (!incident) return res.status(404).json({ message: 'Инцидент не найден' });
  res.json(incident);
});

app.post('/api/incidents', (req, res) => {
  const newIncident = { ...req.body, id: Date.now() };
  mockIncidents.push(newIncident);
  res.status(201).json(newIncident);
});

app.put('/api/incidents/:id', (req, res) => {
  const index = mockIncidents.findIndex(inc => inc.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Инцидент не найден' });
  
  mockIncidents[index] = { ...mockIncidents[index], ...req.body };
  res.json(mockIncidents[index]);
});

app.delete('/api/incidents/:id', (req, res) => {
  const index = mockIncidents.findIndex(inc => inc.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Инцидент не найден' });
  
  mockIncidents.splice(index, 1);
  res.json({ message: 'Инцидент удален' });
});

// Маршруты API для клиентов
app.get('/api/clients', (req, res) => {
  res.json(mockClients);
});

app.get('/api/clients/:id', (req, res) => {
  const client = mockClients.find(c => c.id === parseInt(req.params.id));
  if (!client) return res.status(404).json({ message: 'Клиент не найден' });
  res.json(client);
});

app.get('/api/clients/search', (req, res) => {
  const query = req.query.q || '';
  const filteredClients = mockClients.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.passport.includes(query) || 
    c.phone.includes(query)
  );
  res.json(filteredClients);
});

// Маршруты API для аналитики
app.get('/api/analytics/dashboard', (req, res) => {
  res.json(mockAnalytics.dashboard);
});

app.get('/api/analytics/risks', (req, res) => {
  res.json(mockAnalytics.risks);
});

// Базовый маршрут для проверки работы API
app.get('/api', (req, res) => {
  res.json({ 
    message: 'WareVision Anti-Fraud System API работает',
    version: '1.0.0',
    endpoints: [
      '/api/incidents',
      '/api/clients',
      '/api/analytics/dashboard',
      '/api/analytics/risks'
    ]
  });
});

// Статическое обслуживание фронтенда в production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Запуск сервера
app.listen(port, () => {
  console.log(`WareVision Anti-Fraud System API сервер запущен на порту ${port}`);
  console.log(`API доступно по адресу http://localhost:${port}/api`);
}); 