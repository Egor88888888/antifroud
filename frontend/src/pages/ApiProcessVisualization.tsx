import React, { useState, useEffect } from 'react';
import { Card, Typography, Tabs, Alert, Button, Space, message, Upload, Input } from 'antd';
import { UploadOutlined, CodeOutlined, ApiOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import ApiProcessVisualizer from '../components/ApiProcessVisualizer';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Example OpenAPI spec for demo purposes
const DEMO_OPENAPI_SPEC = {
  "openapi": "3.0.0",
  "info": {
    "title": "CRAFD API Gateway",
    "version": "0.1.0",
    "description": "API Gateway for fraud detection and client verification"
  },
  "paths": {
    "/token": {
      "post": {
        "summary": "Login For Access Token",
        "operationId": "login_for_token",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Body_login_for_access_token_token_post"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Token"
                }
              }
            }
          }
        }
      }
    },
    "/users/me": {
      "get": {
        "summary": "Read Users Me",
        "operationId": "read_users_me_users_me_get",
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          }
        },
        "security": [
          {
            "OAuth2PasswordBearer": []
          }
        ]
      }
    },
    "/health": {
      "get": {
        "summary": "Health Check",
        "operationId": "health_check_health_get",
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          }
        }
      }
    },
    "/api/identification/{client_id}": {
      "get": {
        "summary": "Get Client Identification",
        "operationId": "get_client_identification_api_identification__client_id__get",
        "parameters": [
          {
            "required": true,
            "schema": {
              "title": "Client Id",
              "type": "string"
            },
            "name": "client_id",
            "in": "path"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          }
        },
        "security": [
          {
            "OAuth2PasswordBearer": []
          }
        ]
      }
    },
    "/api/lists/{client_id}": {
      "get": {
        "summary": "Check Client Lists",
        "operationId": "check_client_lists_api_lists__client_id__get",
        "parameters": [
          {
            "required": true,
            "schema": {
              "title": "Client Id",
              "type": "string"
            },
            "name": "client_id",
            "in": "path"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          }
        },
        "security": [
          {
            "OAuth2PasswordBearer": []
          }
        ]
      }
    },
    "/api/scoring/{client_id}": {
      "get": {
        "summary": "Get Client Scoring",
        "operationId": "get_client_scoring_api_scoring__client_id__get",
        "parameters": [
          {
            "required": true,
            "schema": {
              "title": "Client Id",
              "type": "string"
            },
            "name": "client_id",
            "in": "path"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          }
        },
        "security": [
          {
            "OAuth2PasswordBearer": []
          }
        ]
      }
    }
  },
  "components": {
    "schemas": {
      "Body_login_for_access_token_token_post": {
        "title": "Body_login_for_access_token_token_post",
        "required": [
          "username",
          "password"
        ],
        "type": "object",
        "properties": {
          "username": {
            "title": "Username",
            "type": "string"
          },
          "password": {
            "title": "Password",
            "type": "string"
          }
        }
      },
      "HTTPValidationError": {
        "title": "HTTPValidationError",
        "type": "object"
      },
      "Token": {
        "title": "Token",
        "required": [
          "access_token",
          "token_type"
        ],
        "type": "object",
        "properties": {
          "access_token": {
            "title": "Access Token",
            "type": "string"
          },
          "token_type": {
            "title": "Token Type",
            "type": "string"
          }
        }
      },
      "User": {
        "title": "User",
        "required": [
          "username",
          "role"
        ],
        "type": "object",
        "properties": {
          "username": {
            "title": "Username",
            "type": "string"
          },
          "role": {
            "title": "Role",
            "type": "string"
          },
          "disabled": {
            "title": "Disabled",
            "type": "boolean"
          }
        }
      }
    },
    "securitySchemes": {
      "OAuth2PasswordBearer": {
        "type": "oauth2",
        "flows": {
          "password": {
            "scopes": {},
            "tokenUrl": "token"
          }
        }
      }
    }
  }
};

// Other API processes that we might want to visualize
const apiProcesses = [
  {
    id: 'fraud-detection',
    name: 'Процесс обнаружения мошенничества',
    description: 'API-процесс обнаружения и обработки подозрительной активности',
    endpoints: [
      { id: 'token', method: 'POST', path: '/token', description: 'Login For Access Token', isSecure: false },
      { id: 'transaction', method: 'POST', path: '/api/transactions', description: 'Register New Transaction', isSecure: true },
      { id: 'check_fraud', method: 'POST', path: '/api/check/fraud', description: 'Check Transaction for Fraud', isSecure: true },
      { id: 'risk_score', method: 'GET', path: '/api/risk/score/{transaction_id}', description: 'Get Risk Scoring', isSecure: true },
      { id: 'transaction_decision', method: 'PUT', path: '/api/transactions/{transaction_id}/decision', description: 'Update Transaction Decision', isSecure: true }
    ]
  },
  {
    id: 'client-registration',
    name: 'Процесс регистрации клиента',
    description: 'API-процесс регистрации и верификации нового клиента',
    endpoints: [
      { id: 'token', method: 'POST', path: '/token', description: 'Login For Access Token', isSecure: false },
      { id: 'register_client', method: 'POST', path: '/api/clients', description: 'Register New Client', isSecure: true },
      { id: 'verify_documents', method: 'POST', path: '/api/clients/{client_id}/documents', description: 'Upload and Verify Documents', isSecure: true },
      { id: 'aml_check', method: 'GET', path: '/api/clients/{client_id}/aml', description: 'Run AML Check', isSecure: true },
      { id: 'approve_client', method: 'PUT', path: '/api/clients/{client_id}/approve', description: 'Approve Client', isSecure: true }
    ]
  }
];

const ApiProcessVisualization: React.FC = () => {
  const [activeProcess, setActiveProcess] = useState('crafd-gateway');
  const [customOpenApiSpec, setCustomOpenApiSpec] = useState<any>(null);
  const [openApiInput, setOpenApiInput] = useState('');
  const [openApiError, setOpenApiError] = useState<string | null>(null);

  // Handle process tab change
  const handleTabChange = (key: string) => {
    setActiveProcess(key);
  };

  // Handle OpenAPI file upload
  const handleOpenApiUpload: UploadProps['customRequest'] = (options) => {
    const { file, onSuccess, onError } = options;
    
    const reader = new FileReader();
    reader.readAsText(file as Blob);
    reader.onload = () => {
      try {
        const spec = JSON.parse(reader.result as string);
        if (!spec.openapi || !spec.paths) {
          throw new Error('Invalid OpenAPI specification format');
        }
        setCustomOpenApiSpec(spec);
        setOpenApiError(null);
        message.success('OpenAPI спецификация успешно загружена');
        onSuccess && onSuccess('ok');
      } catch (err) {
        setOpenApiError('Не удалось загрузить OpenAPI спецификацию. Убедитесь, что это валидный JSON формат.');
        onError && onError(new Error('Invalid OpenAPI specification'));
      }
    };
    reader.onerror = () => {
      setOpenApiError('Ошибка при чтении файла');
      onError && onError(new Error('Error reading file'));
    };
  };

  // Parse OpenAPI spec from text input
  const parseOpenApiInput = () => {
    try {
      const spec = JSON.parse(openApiInput);
      if (!spec.openapi || !spec.paths) {
        throw new Error('Invalid OpenAPI specification format');
      }
      setCustomOpenApiSpec(spec);
      setOpenApiError(null);
      message.success('OpenAPI спецификация успешно применена');
    } catch (err) {
      setOpenApiError('Не удалось применить OpenAPI спецификацию. Убедитесь, что это валидный JSON формат.');
    }
  };

  // Handle BPMN save
  const handleSaveBpmn = (xml: string) => {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-process-${activeProcess}.bpmn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('BPMN диаграмма сохранена');
  };

  return (
    <div className="api-process-visualization-page">
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Title level={4}>Визуализация API процессов</Title>
          <Paragraph>
            Интерактивная визуализация API-процессов и эндпоинтов системы. Позволяет увидеть взаимосвязи 
            между API-эндпоинтами и последовательности вызовов в рамках бизнес-процессов.
          </Paragraph>
        </Space>
      </Card>

      <Tabs 
        activeKey={activeProcess} 
        onChange={handleTabChange}
        tabPosition="top"
        type="card"
        style={{ marginBottom: 32 }}
      >
        <TabPane 
          tab={
            <span>
              <ApiOutlined /> CRAFD API Gateway
            </span>
          } 
          key="crafd-gateway"
        >
          <ApiProcessVisualizer 
            title="CRAFD API Gateway Процессы"
            description="Визуализация процессов API Gateway для антифрод системы"
            apiSpec={DEMO_OPENAPI_SPEC}
            onSaveBpmn={handleSaveBpmn}
          />
        </TabPane>

        {apiProcesses.map(process => (
          <TabPane 
            tab={
              <span>
                <ApiOutlined /> {process.name}
              </span>
            } 
            key={process.id}
            forceRender
          >
            <ApiProcessVisualizer 
              title={process.name}
              description={process.description}
              endpoints={process.endpoints}
              onSaveBpmn={handleSaveBpmn}
            />
          </TabPane>
        ))}

        <TabPane 
          tab={
            <span>
              <CodeOutlined /> Загрузить OpenAPI
            </span>
          } 
          key="custom-openapi"
        >
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Title level={5}>Загрузить свою OpenAPI спецификацию</Title>
              
              <div>
                <Upload 
                  customRequest={handleOpenApiUpload}
                  showUploadList={false}
                  accept=".json"
                >
                  <Button icon={<UploadOutlined />}>Загрузить OpenAPI файл</Button>
                </Upload>
              </div>

              <div>
                <Title level={5}>Или вставьте OpenAPI спецификацию в формате JSON</Title>
                <TextArea 
                  rows={8} 
                  value={openApiInput}
                  onChange={(e) => setOpenApiInput(e.target.value)}
                  placeholder="Вставьте OpenAPI спецификацию в формате JSON..."
                />
                <Button 
                  type="primary" 
                  onClick={parseOpenApiInput}
                  style={{ marginTop: 16 }}
                >
                  Применить спецификацию
                </Button>
              </div>

              {openApiError && (
                <Alert
                  message="Ошибка"
                  description={openApiError}
                  type="error"
                  showIcon
                />
              )}

              {customOpenApiSpec && (
                <div style={{ marginTop: 32 }}>
                  <Title level={5}>Визуализация загруженной спецификации</Title>
                  <ApiProcessVisualizer 
                    title={customOpenApiSpec.info?.title || "Пользовательская API спецификация"}
                    description={customOpenApiSpec.info?.description || "Визуализация загруженной OpenAPI спецификации"}
                    apiSpec={customOpenApiSpec}
                    onSaveBpmn={handleSaveBpmn}
                  />
                </div>
              )}
            </Space>
          </Card>
        </TabPane>
      </Tabs>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space align="center">
            <InfoCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <Title level={5} style={{ margin: 0 }}>О визуализации API процессов</Title>
          </Space>
          
          <Paragraph>
            Визуализация API процессов позволяет:
          </Paragraph>
          
          <ul>
            <li>Наглядно представить структуру API системы и взаимосвязи между эндпоинтами</li>
            <li>Отобразить последовательность вызовов API в рамках бизнес-процессов</li>
            <li>Автоматически генерировать BPMN-диаграммы на основе API спецификаций</li>
            <li>Визуализировать защищенные и публичные эндпоинты</li>
            <li>Импортировать собственные OpenAPI спецификации для визуализации</li>
          </ul>
          
          <Paragraph>
            Визуализация доступна в двух режимах:
          </Paragraph>
          
          <ol>
            <li><Text strong>Граф процессов API</Text> - интерактивный граф, показывающий взаимосвязи между эндпоинтами</li>
            <li><Text strong>BPMN диаграмма</Text> - стандартизированная нотация бизнес-процессов для API-потоков</li>
          </ol>
        </Space>
      </Card>
    </div>
  );
};

export default ApiProcessVisualization; 