declare module 'bpmn-js-properties-panel' {
  export const BpmnPropertiesPanelModule: any;
  export const BpmnPropertiesProviderModule: any;
}

declare module 'camunda-bpmn-moddle/resources/camunda.json' {
  const value: any;
  export default value;
}

declare module 'bpmn-js/lib/Modeler' {
  export default class BpmnModeler {
    constructor(options: any);
    importXML(xml: string): Promise<any>;
    saveXML(options?: any): Promise<{ xml: string }>;
    get(moduleName: string): any;
    destroy(): void;
  }
} 