// Мок-данные для аналитики
module.exports = {
  // Данные для дашборда
  dashboard: {
    // Ключевые метрики
    metrics: {
      totalClients: 1250,
      openIncidents: 42,
      highRiskClients: 87,
      blockedAccounts: 23,
      detectionRate: 78.5 // в процентах
    },
    
    // Тренды инцидентов по дням
    incidentTrends: [
      { date: '2023-05-01', count: 12 },
      { date: '2023-05-02', count: 15 },
      { date: '2023-05-03', count: 10 },
      { date: '2023-05-04', count: 8 },
      { date: '2023-05-05', count: 14 },
      { date: '2023-05-06', count: 11 },
      { date: '2023-05-07', count: 9 },
      { date: '2023-05-08', count: 13 },
      { date: '2023-05-09', count: 18 },
      { date: '2023-05-10', count: 16 },
      { date: '2023-05-11', count: 12 },
      { date: '2023-05-12', count: 14 }
    ],
    
    // Распределение по типам инцидентов
    incidentTypes: [
      { type: 'Identity Fraud', count: 45 },
      { type: 'Document Forgery', count: 32 },
      { type: 'Suspicious Transaction', count: 67 },
      { type: 'AML Alert', count: 29 },
      { type: 'Unusual Activity', count: 51 }
    ],
    
    // Распределение клиентов по уровням риска
    riskDistribution: [
      { level: 'low', percentage: 65 },
      { level: 'medium', percentage: 20 },
      { level: 'high', percentage: 15 }
    ],
    
    // Эффективность аналитиков
    analystPerformance: [
      { name: 'Анна Смирнова', resolved: 42, pending: 5 },
      { name: 'Иван Петров', resolved: 38, pending: 7 },
      { name: 'Сергей Иванов', resolved: 45, pending: 3 },
      { name: 'Мария Козлова', resolved: 36, pending: 4 },
      { name: 'Дмитрий Соколов', resolved: 40, pending: 6 }
    ]
  },
  
  // Данные для риск-скоринга
  risks: {
    // Факторы риска
    riskFactors: [
      { id: 1, name: 'Проверка личности', weight: 80, status: 'passed' },
      { id: 2, name: 'Проверка документов', weight: 60, status: 'warning' },
      { id: 3, name: 'Проверка по спискам', weight: 30, status: 'failed' },
      { id: 4, name: 'Анализ транзакций', weight: 40, status: 'passed' },
      { id: 5, name: 'Геолокационная проверка', weight: 25, status: 'warning' }
    ],
    
    // Сводный скоринг
    overallScore: 65, // в процентах
    
    // Рекомендации
    recommendation: 'Требуется дополнительная проверка',
    
    // История изменения скоринга
    scoreHistory: [
      { date: '2023-05-01', score: 72 },
      { date: '2023-05-02', score: 70 },
      { date: '2023-05-03', score: 68 },
      { date: '2023-05-04', score: 65 },
      { date: '2023-05-05', score: 65 }
    ]
  }
}; 