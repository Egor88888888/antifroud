import React, { useEffect, useRef } from 'react';
import BpmnJS from 'bpmn-js';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import { Card, Tooltip, Space, Button } from 'antd';
import { InfoCircleOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';

interface ProcessViewerProps {
  processXml: string;
  title: string;
  description?: string;
}

const ProcessViewer: React.FC<ProcessViewerProps> = ({ processXml, title, description }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bpmnViewerRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Initialize BPMN viewer
      const bpmnViewer = new BpmnJS({
        container: containerRef.current,
        height: 400,
        width: '100%'
      });

      bpmnViewerRef.current = bpmnViewer;

      // Import BPMN diagram
      bpmnViewer.importXML(processXml).catch((err: Error) => {
        console.error('Error rendering BPMN diagram:', err);
      });

      return () => {
        bpmnViewer.destroy();
      };
    }
  }, [processXml]);

  const handleZoomIn = () => {
    if (bpmnViewerRef.current) {
      const canvas = bpmnViewerRef.current.get('canvas');
      canvas.zoom(canvas.zoom() + 0.1);
    }
  };

  const handleZoomOut = () => {
    if (bpmnViewerRef.current) {
      const canvas = bpmnViewerRef.current.get('canvas');
      canvas.zoom(canvas.zoom() - 0.1);
    }
  };

  return (
    <Card
      title={
        <Space>
          {title}
          {description && (
            <Tooltip title={description}>
              <InfoCircleOutlined />
            </Tooltip>
          )}
        </Space>
      }
      extra={
        <Space>
          <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
          <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
        </Space>
      }
    >
      <div 
        ref={containerRef} 
        style={{ 
          height: '400px', 
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          overflow: 'hidden'
        }} 
      />
    </Card>
  );
};

export default ProcessViewer; 