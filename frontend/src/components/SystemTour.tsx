import React, { useState, useEffect } from 'react';
import { Tour, Button, Space, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

interface SystemTourProps {
  onFinish?: () => void;
  autoStart?: boolean;
  isVisible?: boolean;
  onClose?: () => void;
}

const SystemTour: React.FC<SystemTourProps> = ({ 
  onFinish, 
  autoStart = false,
  isVisible = false,
  onClose
}) => {
  const [open, setOpen] = useState(autoStart || isVisible);
  const [tourStarted, setTourStarted] = useState(false);

  useEffect(() => {
    // Проверяем, запускался ли тур ранее
    const tourViewed = localStorage.getItem('warevision_tour_viewed') === 'true';
    
    // Если тур еще не запускался и установлен autoStart, открываем его
    if (autoStart && !tourViewed && !tourStarted) {
      setOpen(true);
      setTourStarted(true);
    }
  }, [autoStart, tourStarted]);

  useEffect(() => {
    setOpen(isVisible);
  }, [isVisible]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handleFinish = () => {
    setOpen(false);
    // Сохраняем информацию, что тур просмотрен
    localStorage.setItem('warevision_tour_viewed', 'true');
    if (onFinish) {
      onFinish();
    }
    if (onClose) {
      onClose();
    }
  };

  const steps = [
    {
      title: 'Добро пожаловать в WareVision Anti-Fraud System',
      description: (
        <Space direction="vertical">
          <Paragraph>
            WareVision Anti-Fraud System - это комплексная система для выявления 
            и предотвращения мошеннических действий в финансовой сфере.
          </Paragraph>
          <Paragraph>
            Этот краткий тур познакомит вас с основными возможностями системы.
          </Paragraph>
        </Space>
      ),
      target: () => document.querySelector('h3') as HTMLElement,
    },
    {
      title: 'Дашборд',
      description: (
        <Space direction="vertical">
          <Paragraph>
            Главная страница системы отображает ключевые метрики и статистику:
          </Paragraph>
          <ul>
            <li>Количество инцидентов</li>
            <li>Открытые инциденты</li>
            <li>Общее число клиентов</li>
            <li>Совпадения по спискам</li>
          </ul>
          <Paragraph>
            Графики визуализируют тренды инцидентов и распределение рисков.
          </Paragraph>
        </Space>
      ),
      target: () => document.querySelector('.ant-menu-item:nth-child(1)') as HTMLElement,
    },
    {
      title: 'Поиск клиентов',
      description: (
        <Space direction="vertical">
          <Paragraph>
            Здесь вы можете искать клиентов по различным параметрам:
          </Paragraph>
          <ul>
            <li>ФИО</li>
            <li>ID клиента</li>
            <li>Статус и уровень риска</li>
          </ul>
        </Space>
      ),
      target: () => document.querySelector('.ant-menu-item:nth-child(2)') as HTMLElement,
    },
    {
      title: 'Управление инцидентами',
      description: (
        <Space direction="vertical">
          <Paragraph>
            Раздел для работы с инцидентами безопасности:
          </Paragraph>
          <ul>
            <li>Просмотр всех инцидентов</li>
            <li>Обработка и назначение ответственных</li>
            <li>Отслеживание статуса и добавление комментариев</li>
          </ul>
        </Space>
      ),
      target: () => document.querySelector('.ant-menu-item:nth-child(3)') as HTMLElement,
    },
    {
      title: 'Граф связей',
      description: (
        <Space direction="vertical">
          <Paragraph>
            Визуализация связей между клиентами, счетами, адресами и устройствами:
          </Paragraph>
          <ul>
            <li>Интерактивный граф для анализа связей</li>
            <li>Поиск скрытых взаимосвязей</li>
            <li>Выявление групп связанных лиц</li>
          </ul>
        </Space>
      ),
      target: () => document.querySelector('.ant-menu-item:nth-child(4)') as HTMLElement,
    },
    {
      title: 'Оценка рисков',
      description: (
        <Space direction="vertical">
          <Paragraph>
            Подробная информация о факторах риска клиента:
          </Paragraph>
          <ul>
            <li>Вес каждого фактора</li>
            <li>Итоговый скоринг-балл</li>
            <li>Рекомендации по дальнейшим действиям</li>
          </ul>
        </Space>
      ),
      target: () => document.querySelector('.ant-menu-item:nth-child(5)') as HTMLElement,
    },
    {
      title: 'Визуализация процессов',
      description: (
        <Space direction="vertical">
          <Paragraph>
            Наглядное представление бизнес-процессов проверки:
          </Paragraph>
          <ul>
            <li>BPMN-диаграммы процессов</li>
            <li>Подробные пояснения к каждому этапу</li>
            <li>Оценка времени выполнения</li>
          </ul>
        </Space>
      ),
      target: () => document.querySelector('.ant-menu-item:nth-child(6)') as HTMLElement,
    },
    {
      title: 'Тур завершен!',
      description: (
        <Space direction="vertical">
          <Paragraph>
            Вы успешно ознакомились с основными возможностями системы WareVision Anti-Fraud.
          </Paragraph>
          <Paragraph>
            Чтобы запустить тур повторно, нажмите кнопку справки в правом верхнем углу.
          </Paragraph>
        </Space>
      ),
      target: () => document.body,
    },
  ];

  return (
    <>
      <Tour
        open={open}
        onClose={handleClose}
        steps={steps}
        onFinish={handleFinish}
      />
      
      {!isVisible && (
        <div style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 1000 }}>
          <Button
            type="primary"
            shape="circle"
            icon={<QuestionCircleOutlined />}
            size="large"
            onClick={() => setOpen(true)}
            title="Запустить тур по системе"
          />
        </div>
      )}
    </>
  );
};

export default SystemTour; 