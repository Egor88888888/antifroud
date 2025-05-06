import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/lib/locale/ru_RU';
import 'dayjs/locale/ru';

// BPMN template paths - directly from public folder
const BPMN_TEMPLATES = {
  'client-verification': '/bpmn-templates/client-verification.bpmn',
  'fraud-detection': '/bpmn-templates/fraud-detection.bpmn',
  'dispute-resolution': '/bpmn-templates/dispute-resolution.bpmn',
  'crafd-api-gateway': '/bpmn-templates/crafd-api-gateway.bpmn'
};

// Preload BPMN templates and embed them directly into the HTML document
const preloadBpmnTemplates = async () => {
  try {
    const templateContainer = document.getElementById('bpmn-templates');
    if (!templateContainer) return;

    for (const [id, path] of Object.entries(BPMN_TEMPLATES)) {
      try {
        console.log(`Loading BPMN template: ${path}`);
        const response = await fetch(path);
        if (!response.ok) {
          console.error(`Failed to load template from ${path}, status: ${response.status}`);
          continue;
        }
        
        const content = await response.text();
        console.log(`Template loaded: ${id}, length: ${content.length}`);
        
        // Create an element to store the template
        const template = document.createElement('script');
        template.id = `bpmn-template-${id}`;
        template.type = 'text/plain';
        template.textContent = content;
        templateContainer.appendChild(template);
      } catch (error) {
        console.error(`Error loading template ${id}:`, error);
      }
    }
    console.log('BPMN templates loaded and embedded');
  } catch (error) {
    console.error('Error preloading BPMN templates:', error);
  }
};

// Initialize the app and preload templates
const initApp = async () => {
  await preloadBpmnTemplates();
  
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  
  root.render(
    <React.StrictMode>
      <ConfigProvider locale={ruRU}>
        <App />
      </ConfigProvider>
    </React.StrictMode>
  );
};

initApp(); 