import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Steps, Card, Alert, Spin, Tabs } from 'antd';
import ProcessViewer from '../components/ProcessViewer';
import ProcessExplanation from '../components/ProcessExplanation';
import axios from 'axios';
import Joyride from 'react-joyride';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface Process {
  id: string;
  name: string;
  description: string;
  xml_content: string;
}

const ProcessesPage: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tutorial steps
  const steps = [
    {
      target: '.process-viewer',
      content: 'Здесь вы видите визуализацию бизнес-процесса проверки клиента. Каждый этап процесса представлен отдельным блоком.',
      placement: 'bottom' as const,
    },
    {
      target: '.process-explanation',
      content: 'В этом разделе представлено детальное описание каждого этапа процесса с указанием времени выполнения и уровня риска.',
      placement: 'left' as const,
    },
    {
      target: '.process-controls',
      content: 'Используйте эти кнопки для управления масштабом диаграммы.',
      placement: 'top' as const,
    },
  ];
  const [run, setRun] = useState(true);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await axios.get('/api/processes');
        setProcesses(response.data);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке процессов');
        setLoading(false);
      }
    };

    fetchProcesses();
    setRun(true); // Запускаем тур при загрузке
  }, []);

  const processSteps = [
    {
      title: 'Получение заявки',
      description: 'Система получает заявку на проверку клиента из внешней системы или через API.',
    },
    {
      title: 'Проверка личности',
      description: 'Выполняется верификация личности клиента через различные источники данных.',
    },
    {
      title: 'Проверка документов',
      description: 'Проводится анализ предоставленных документов на подлинность.',
    },
    {
      title: 'Оценка рисков',
      description: 'Производится комплексная оценка рисков на основе собранных данных.',
    },
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showSkipButton
        styles={{ options: { zIndex: 10000 } }}
      />
      <Title level={2}>Процессы проверки клиентов</Title>
      <Paragraph>
        Система CRAFD использует комплексный подход к проверке клиентов,
        включающий несколько этапов верификации и оценки рисков.
        Каждый этап процесса тщательно документирован и может быть настроен
        под конкретные требования банка.
      </Paragraph>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Визуализация процесса" key="1">
          <Row gutter={[24, 24]}>
            <Col span={16}>
              <div className="process-viewer">
                {processes.map(process => (
                  <ProcessViewer
                    key={process.id}
                    processXml={process.xml_content}
                    title={process.name}
                    description={process.description}
                  />
                ))}
              </div>
            </Col>
            <Col span={8} className="process-explanation">
              <ProcessExplanation />
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Статистика и метрики" key="2">
          <Card>
            <Paragraph>
              Здесь будет отображаться статистика по процессам проверки:
              - Среднее время проверки
              - Количество выявленных рисков
              - Эффективность автоматических проверок
              - и другие метрики
            </Paragraph>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProcessesPage; 