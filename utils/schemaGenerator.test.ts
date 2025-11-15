import { generateVtexSchema } from './schemaGenerator';
import { PropertyForm } from '@/types';

describe('generateVtexSchema', () => {
  it('deve gerar um schema básico com título e propriedades vazias', () => {
    const properties: PropertyForm[] = [];
    const componentTitle = 'Test Component';

    const schema = generateVtexSchema(properties, componentTitle);

    expect(schema).toEqual({
      title: 'Test Component',
      type: 'object',
      properties: {},
    });
  });

  it('deve gerar uma propriedade string simples', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'title',
        type: 'string',
        title: 'Title',
        description: 'Component title',
        defaultValue: 'Hello',
        required: false,
        addConditionalFields: false,
      },
    ];

    const schema = generateVtexSchema(properties, 'Test Component');

    expect(schema.properties.title).toEqual({
      type: 'string',
      title: 'Title',
      description: 'Component title',
      default: 'Hello',
    });
  });

  it('deve gerar uma propriedade number com conversão correta', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'count',
        type: 'number',
        title: 'Count',
        defaultValue: '42',
        required: false,
        addConditionalFields: false,
      },
    ];

    const schema = generateVtexSchema(properties, 'Test Component');

    expect(schema.properties.count).toEqual({
      type: 'number',
      title: 'Count',
      default: 42,
    });
  });

  it('deve gerar uma propriedade boolean com conversão correta', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'enabled',
        type: 'boolean',
        title: 'Enabled',
        defaultValue: 'true',
        required: false,
        addConditionalFields: false,
      },
    ];

    const schema = generateVtexSchema(properties, 'Test Component');

    expect(schema.properties.enabled).toEqual({
      type: 'boolean',
      title: 'Enabled',
      default: true,
    });
  });

  it('deve gerar uma propriedade com widget', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'image',
        type: 'string',
        title: 'Image',
        widget: 'image-uploader',
        required: false,
        addConditionalFields: false,
      },
    ];

    const schema = generateVtexSchema(properties, 'Test Component');

    expect(schema.properties.image).toEqual({
      type: 'string',
      title: 'Image',
      widget: { 'ui:widget': 'image-uploader' },
    });
  });

  it('deve gerar uma propriedade com formato', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'email',
        type: 'string',
        title: 'Email',
        format: 'email',
        required: false,
        addConditionalFields: false,
      },
    ];

    const schema = generateVtexSchema(properties, 'Test Component');

    expect(schema.properties.email).toEqual({
      type: 'string',
      title: 'Email',
      format: 'email',
    });
  });

  it('deve gerar uma propriedade enum', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'size',
        type: 'enum',
        title: 'Size',
        enumValues: 'small, medium, large',
        enumNames: 'Pequeno, Médio, Grande',
        required: false,
        addConditionalFields: false,
      },
    ];

    const schema = generateVtexSchema(properties, 'Test Component');

    expect(schema.properties.size).toEqual({
      type: 'string',
      title: 'Size',
      enum: ['small', 'medium', 'large'],
      enumNames: ['Pequeno', 'Médio', 'Grande'],
    });
  });

  it('deve gerar uma propriedade array com itens', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        arrayItemTitle: 'Item',
        arrayItemProperties: [
          {
            id: 'arr-1',
            name: 'label',
            type: 'string',
            title: 'Label',
            defaultValue: 'Item label',
          },
          {
            id: 'arr-2',
            name: 'value',
            type: 'number',
            title: 'Value',
            defaultValue: '10',
          },
        ],
        required: false,
        addConditionalFields: false,
      },
    ];

    const schema = generateVtexSchema(properties, 'Test Component');

    expect(schema.properties.items).toEqual({
      type: 'array',
      title: 'Items',
      items: {
        type: 'object',
        title: 'Item',
        properties: {
          label: {
            type: 'string',
            title: 'Label',
            default: 'Item label',
          },
          value: {
            type: 'number',
            title: 'Value',
            default: 10,
          },
        },
      },
    });
  });

  it('deve gerar uma propriedade array com __editorItemTitle', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        arrayItemTitle: 'Item',
        enableEditorItemTitle: 'true',
        editorItemTitleLabel: 'Nome do Item',
        editorItemTitleDefault: 'Meu Item',
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

    const schema = generateVtexSchema(properties, 'Test Component');

    expect(schema.properties.items.items).toEqual({
      type: 'object',
      title: 'Item',
      properties: {
        __editorItemTitle: {
          type: 'string',
          title: 'Nome do Item',
          default: 'Meu Item',
        },
        text: {
          type: 'string',
          title: 'Text',
        },
      },
    });
  });

  it('deve gerar uma propriedade conditional', () => {
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

    const schema = generateVtexSchema(properties, 'Test Component');

    expect(schema.properties.hasLink).toEqual({
      type: 'string',
      title: 'Has Link',
      enum: ['none', 'provide'],
      enumNames: ['Não', 'Sim'],
      default: 'none',
      widget: { 'ui:widget': 'radio' },
    });
  });

  it('deve gerar uma propriedade conditional com campos dependentes', () => {
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
            defaultValue: 'https://',
          },
          {
            id: 'cond-2',
            name: 'openNewTab',
            type: 'boolean',
            title: 'Open in new tab',
            defaultValue: 'true',
          },
        ],
        required: false,
      },
    ];

    const schema = generateVtexSchema(properties, 'Test Component');

    expect(schema.properties.hasLink).toEqual({
      type: 'string',
      title: 'Has Link',
      enum: ['none', 'provide'],
      enumNames: ['Não', 'Sim'],
      default: 'none',
      widget: { 'ui:widget': 'radio' },
    });

    expect(schema.dependencies).toEqual({
      hasLink: {
        oneOf: [
          {
            properties: {
              hasLink: {
                enum: ['provide'],
              },
              url: {
                type: 'string',
                default: 'https://',
              },
              openNewTab: {
                type: 'boolean',
                default: true,
              },
            },
          },
        ],
      },
    });
  });

  it('deve ignorar propriedades sem nome', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: '',
        type: 'string',
        title: 'Empty Name',
        required: false,
        addConditionalFields: false,
      },
      {
        id: '2',
        name: 'valid',
        type: 'string',
        title: 'Valid Property',
        required: false,
        addConditionalFields: false,
      },
    ];

    const schema = generateVtexSchema(properties, 'Test Component');

    expect(Object.keys(schema.properties)).toEqual(['valid']);
  });

  it('deve tratar JSON inválido no arrayDefaultValue', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        arrayItemTitle: 'Item',
        arrayItemProperties: [
          {
            id: 'arr-1',
            name: 'text',
            type: 'string',
            title: 'Text',
          },
        ],
        arrayDefaultValue: 'invalid json',
        required: false,
        addConditionalFields: false,
      },
    ];

    const schema = generateVtexSchema(properties, 'Test Component');

    // Não deve ter default se o JSON for inválido
    expect(schema.properties.items.default).toBeUndefined();
  });

  it('deve adicionar default válido para array quando JSON é válido', () => {
    const properties: PropertyForm[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        arrayItemTitle: 'Item',
        arrayItemProperties: [
          {
            id: 'arr-1',
            name: 'text',
            type: 'string',
            title: 'Text',
          },
        ],
        arrayDefaultValue: '[{"text": "Item 1"}, {"text": "Item 2"}]',
        required: false,
        addConditionalFields: false,
      },
    ];

    const schema = generateVtexSchema(properties, 'Test Component');

    expect(schema.properties.items.default).toEqual([
      { text: 'Item 1' },
      { text: 'Item 2' },
    ]);
  });
});
