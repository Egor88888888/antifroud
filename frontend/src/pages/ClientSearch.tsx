import React from 'react';
import { Card, Input, Table, Tag, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

const ClientSearch: React.FC = () => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'ФИО',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Активен' : 'Заблокирован'}
        </Tag>
      ),
    },
    {
      title: 'Риск',
      dataIndex: 'risk',
      key: 'risk',
      render: (risk: string) => (
        <Tag color={
          risk === 'high' ? 'red' :
          risk === 'medium' ? 'orange' : 'green'
        }>
          {risk === 'high' ? 'Высокий' :
           risk === 'medium' ? 'Средний' : 'Низкий'}
        </Tag>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      id: 'CL001',
      name: 'Иванов Иван Иванович',
      status: 'active',
      risk: 'low',
    },
    {
      key: '2',
      id: 'CL002',
      name: 'Петров Петр Петрович',
      status: 'blocked',
      risk: 'high',
    },
  ];

  return (
    <Card title="Поиск клиентов">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Search
          placeholder="Введите ФИО, ID или другие данные клиента"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
        />
        <Table columns={columns} dataSource={data} />
      </Space>
    </Card>
  );
};

export default ClientSearch; 