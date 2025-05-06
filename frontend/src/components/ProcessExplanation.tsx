import React from 'react';
import { Card, Typography, Timeline, Tag, Space } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  UserOutlined, 
  FileSearchOutlined,
  SafetyOutlined,
  RobotOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface ProcessStep {
  title: string;
  description: string;
  type: 'automatic' | 'manual' | 'decision';
  details: string[];
  duration: string;
  riskLevel?: 'low' | 'medium' | 'high';
}

const processSteps: ProcessStep[] = [
  {
    title: 'Получение заявки',
    description: 'Автоматическая обработка входящей заявки',
    type: 'automatic',
    details: [
      'Проверка комплектности данных',
      'Форматирование и нормализация',
      'Присвоение уникального идентификатора'
    ],
    duration: '< 1 сек'
  },
  {
    title: 'Проверка личности',
    description: 'Верификация личности через различные источники',
    type: 'automatic',
    details: [
      'Проверка паспортных данных',
      'Верификация фотографии',
      'Проверка актуальности документов'
    ],
    duration: '5-10 сек',
    riskLevel: 'medium'
  },
  {
    title: 'Проверка по спискам',
    description: 'Поиск совпадений в различных списках',
    type: 'automatic',
    details: [
      'Проверка черных списков',
      'Поиск в списках террористов',
      'Проверка списков PEP'
    ],
    duration: '3-5 сек',
    riskLevel: 'high'
  },
  {
    title: 'Оценка рисков',
    description: 'Комплексный анализ всех факторов риска',
    type: 'automatic',
    details: [
      'Агрегация результатов проверок',
      'Применение скоринговой модели',
      'Расчет итогового скора'
    ],
    duration: '2-3 сек'
  },
  {
    title: 'Принятие решения',
    description: 'Автоматическое или ручное принятие решения',
    type: 'decision',
    details: [
      'Анализ уровня риска',
      'Проверка дополнительных факторов',
      'Формирование итогового заключения'
    ],
    duration: 'до 24 часов',
    riskLevel: 'high'
  }
];

const ProcessExplanation: React.FC = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'automatic':
        return <RobotOutlined style={{ color: '#1890ff' }} />;
      case 'manual':
        return <UserOutlined style={{ color: '#52c41a' }} />;
      case 'decision':
        return <SafetyOutlined style={{ color: '#722ed1' }} />;
      default:
        return <FileSearchOutlined />;
    }
  };

  const getRiskTag = (level?: 'low' | 'medium' | 'high') => {
    if (!level) return null;
    
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error'
    };

    return <Tag color={colors[level]}>{level.toUpperCase()}</Tag>;
  };

  return (
    <Card>
      <Title level={3}>Детальное описание процесса</Title>
      <Paragraph>
        Каждый этап процесса проверки тщательно документирован и оптимизирован
        для максимальной эффективности при сохранении высокого качества проверки.
      </Paragraph>

      <Timeline>
        {processSteps.map((step, index) => (
          <Timeline.Item 
            key={index} 
            dot={getIcon(step.type)}
          >
            <Space direction="vertical" size="small" style={{ display: 'flex' }}>
              <Space>
                <Text strong>{step.title}</Text>
                {getRiskTag(step.riskLevel)}
                <Tag color="blue">{step.duration}</Tag>
              </Space>
              
              <Text type="secondary">{step.description}</Text>
              
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {step.details.map((detail, i) => (
                  <li key={i}>
                    <Text>{detail}</Text>
                  </li>
                ))}
              </ul>
            </Space>
          </Timeline.Item>
        ))}
      </Timeline>

      <Card size="small" style={{ marginTop: '20px', backgroundColor: '#f5f5f5' }}>
        <Space>
          <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
          <Text>
            Среднее время полной автоматической проверки: <Text strong>10-15 секунд</Text>
          </Text>
        </Space>
      </Card>
    </Card>
  );
};

export default ProcessExplanation; 