import { generateFullTypeScript, generateTypeScriptInterface } from './typeGenerator';
import { PropertyForm } from '@/types';

describe('generateTypeScriptInterface', () => {
  it('deve gerar interface vazia', () => {
    const properties: PropertyForm[] = [];
    const result = generateTypeScriptInterface(properties, 'TestProps');

    expect(result).toBe('export interface TestProps {\n}');
  });

  it('deve gerar propriedade string simples', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'title',
        type: 'string',
        title: 'Title',
        required: true,
        addConditionalFields: false,
      },
    ];

    const result = generateTypeScriptInterface(properties, 'TestProps');

    expect(result).toContain('title: string;');
  });

  it('deve gerar propriedade opcional', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'subtitle',
        type: 'string',
        title: 'Subtitle',
        required: false,
        addConditionalFields: false,
      },
    ];

    const result = generateTypeScriptInterface(properties, 'TestProps');

    expect(result).toContain('subtitle?: string;');
  });

  it('deve gerar comentário JSDoc para description', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'description',
        type: 'string',
        title: 'Description',
        description: 'The component description',
        required: false,
        addConditionalFields: false,
      },
    ];

    const result = generateTypeScriptInterface(properties, 'TestProps');

    expect(result).toContain('/** The component description */');
  });

  it('deve gerar union type para enum', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'size',
        type: 'enum',
        title: 'Size',
        enumValues: 'small, medium, large',
        required: false,
        addConditionalFields: false,
      },
    ];

    const result = generateTypeScriptInterface(properties, 'TestProps');

    expect(result).toContain("size?: 'small' | 'medium' | 'large';");
  });

  it('deve gerar tipo number', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'count',
        type: 'number',
        title: 'Count',
        required: true,
        addConditionalFields: false,
      },
    ];

    const result = generateTypeScriptInterface(properties, 'TestProps');

    expect(result).toContain('count: number;');
  });

  it('deve gerar tipo boolean', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'enabled',
        type: 'boolean',
        title: 'Enabled',
        required: false,
        addConditionalFields: false,
      },
    ];

    const result = generateTypeScriptInterface(properties, 'TestProps');

    expect(result).toContain('enabled?: boolean;');
  });

  it('deve gerar tipo object', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'config',
        type: 'object',
        title: 'Config',
        required: false,
        addConditionalFields: false,
      },
    ];

    const result = generateTypeScriptInterface(properties, 'TestProps');

    expect(result).toContain('config?: Record<string, any>;');
  });

  it('deve gerar tipo array com itens', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        arrayItemProperties: [
          {
            id: 'arr-1',
            name: 'label',
            type: 'string',
            title: 'Label',
          },
          {
            id: 'arr-2',
            name: 'value',
            type: 'number',
            title: 'Value',
          },
        ],
        required: false,
        addConditionalFields: false,
      },
    ];

    const result = generateTypeScriptInterface(properties, 'TestProps');

    expect(result).toContain('items?: Array<{');
    expect(result).toContain('label: string;');
    expect(result).toContain('value: number;');
  });

  it('deve gerar tipo conditional', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'hasLink',
        type: 'conditional',
        title: 'Has Link',
        required: false,
        addConditionalFields: false,
      },
    ];

    const result = generateTypeScriptInterface(properties, 'TestProps');

    expect(result).toContain("hasLink?: 'none' | 'provide';");
  });
});

describe('generateFullTypeScript', () => {
  it('deve gerar interface com campos condicionais', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'hasLink',
        type: 'conditional',
        title: 'Has Link',
        addConditionalFields: true,
        conditionalFields: [
          {
            id: 'cond-1',
            name: 'url',
            type: 'string',
            title: 'URL',
          },
          {
            id: 'cond-2',
            name: 'openNewTab',
            type: 'boolean',
            title: 'Open in new tab',
          },
        ],
        required: false,
      },
    ];

    const result = generateFullTypeScript(properties, 'TestProps');

    expect(result).toContain("hasLink?: 'none' | 'provide';");
    expect(result).toContain('url?: string;');
    expect(result).toContain('openNewTab?: boolean;');
  });

  it('deve gerar múltiplas propriedades', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'title',
        type: 'string',
        title: 'Title',
        description: 'Component title',
        required: true,
        addConditionalFields: false,
      },
      {
        id: '2',
        name: 'count',
        type: 'number',
        title: 'Count',
        required: false,
        addConditionalFields: false,
      },
      {
        id: '3',
        name: 'enabled',
        type: 'boolean',
        title: 'Enabled',
        required: false,
        addConditionalFields: false,
      },
    ];

    const result = generateFullTypeScript(properties, 'TestProps');

    expect(result).toContain('/** Component title */');
    expect(result).toContain('title: string;');
    expect(result).toContain('count?: number;');
    expect(result).toContain('enabled?: boolean;');
  });

  it('deve ignorar propriedades sem nome', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: '',
        type: 'string',
        title: 'Empty',
        required: false,
        addConditionalFields: false,
      },
      {
        id: '2',
        name: 'valid',
        type: 'string',
        title: 'Valid',
        required: false,
        addConditionalFields: false,
      },
    ];

    const result = generateFullTypeScript(properties, 'TestProps');

    expect(result).toContain('valid?: string;');
    expect(result).not.toContain('Empty');
  });

  it('deve gerar array com __editorItemTitle', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        enableEditorItemTitle: 'true',
        arrayItemProperties: [
          {
            id: 'arr-1',
            name: 'text',
            type: 'string',
            title: 'Text',
          },
        ],
        required: false,
        addConditionalFields: false,
      },
    ];

    const result = generateFullTypeScript(properties, 'TestProps');

    expect(result).toContain('__editorItemTitle?: string;');
    expect(result).toContain('text: string;');
  });
});
