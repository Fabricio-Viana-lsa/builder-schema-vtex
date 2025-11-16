/**
 * Testes unitários para funcionalidade de arrays e objetos aninhados
 */

import { describe, it, expect } from '@jest/globals';
import { generateVtexSchema } from './schemaGenerator';
import { generateFullTypeScript } from './typeGenerator';
import { PropertyForm, ArrayItemProperty } from '@/types';

describe('Nested Arrays and Objects - Schema Generation', () => {
  it('deve gerar schema com array aninhado (2 níveis)', () => {
    const properties: Partial<PropertyForm>[] = [
      {
        id: '1',
        name: 'products',
        type: 'array',
        title: 'Products',
        arrayItemProperties: [
          {
            id: '1-1',
            name: 'name',
            type: 'string',
            title: 'Name',
          },
          {
            id: '1-2',
            name: 'images',
            type: 'array',
            title: 'Images',
            arrayItemProperties: [
              {
                id: '1-2-1',
                name: 'src',
                type: 'string',
                title: 'Source',
              },
            ],
          } as ArrayItemProperty,
        ],
      },
    ];

    const schema = generateVtexSchema(properties as PropertyForm[], 'Test Component');

    expect(schema.properties.products).toBeDefined();
    expect(schema.properties.products.type).toBe('array');
    expect(schema.properties.products.items?.properties?.name).toBeDefined();
    expect(schema.properties.products.items?.properties?.images).toBeDefined();
    expect(schema.properties.products.items?.properties?.images.type).toBe('array');
    expect(schema.properties.products.items?.properties?.images.items?.properties?.src).toBeDefined();
  });

  it('deve gerar schema com objeto dentro de array', () => {
    const properties: Partial<PropertyForm>[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        arrayItemProperties: [
          {
            id: '1-1',
            name: 'metadata',
            type: 'object',
            title: 'Metadata',
            objectProperties: [
              {
                id: '1-1-1',
                name: 'width',
                type: 'number',
                title: 'Width',
              },
            ],
          } as ArrayItemProperty,
        ],
      },
    ];

    const schema = generateVtexSchema(properties as PropertyForm[], 'Test Component');

    expect(schema.properties.items.items?.properties?.metadata).toBeDefined();
    expect(schema.properties.items.items?.properties?.metadata.type).toBe('object');
    expect(schema.properties.items.items?.properties?.metadata.properties?.width).toBeDefined();
    expect(schema.properties.items.items?.properties?.metadata.properties?.width.type).toBe('number');
  });

  it('deve gerar schema com enum dentro de array', () => {
    const properties: Partial<PropertyForm>[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        arrayItemProperties: [
          {
            id: '1-1',
            name: 'color',
            type: 'enum',
            title: 'Color',
            enumValues: 'red,blue,green',
            enumNames: 'Red,Blue,Green',
          } as ArrayItemProperty,
        ],
      },
    ];

    const schema = generateVtexSchema(properties as PropertyForm[], 'Test Component');

    expect(schema.properties.items.items?.properties?.color).toBeDefined();
    expect(schema.properties.items.items?.properties?.color.enum).toEqual(['red', 'blue', 'green']);
    expect(schema.properties.items.items?.properties?.color.enumNames).toEqual(['Red', 'Blue', 'Green']);
  });

  it('deve preservar widgets e formats em propriedades aninhadas', () => {
    const properties: Partial<PropertyForm>[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        arrayItemProperties: [
          {
            id: '1-1',
            name: 'image',
            type: 'string',
            title: 'Image',
            widget: 'image-uploader',
          },
        ],
      },
    ];

    const schema = generateVtexSchema(properties as PropertyForm[], 'Test Component');

    expect(schema.properties.items.items?.properties?.image.widget).toEqual({ 'ui:widget': 'image-uploader' });
  });

  it('deve manter valores padrão em propriedades aninhadas', () => {
    const properties: Partial<PropertyForm>[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        arrayItemProperties: [
          {
            id: '1-1',
            name: 'active',
            type: 'boolean',
            title: 'Active',
            defaultValue: 'true',
          },
          {
            id: '1-2',
            name: 'count',
            type: 'number',
            title: 'Count',
            defaultValue: '10',
          },
        ],
      },
    ];

    const schema = generateVtexSchema(properties as PropertyForm[], 'Test Component');

    expect(schema.properties.items.items?.properties?.active.default).toBe(true);
    expect(schema.properties.items.items?.properties?.count.default).toBe(10);
  });
});

describe('Nested Arrays and Objects - TypeScript Generation', () => {
  it('deve gerar tipo TypeScript com array aninhado', () => {
    const properties: Partial<PropertyForm>[] = [
      {
        id: '1',
        name: 'products',
        type: 'array',
        title: 'Products',
        arrayItemProperties: [
          {
            id: '1-1',
            name: 'name',
            type: 'string',
            title: 'Name',
          },
          {
            id: '1-2',
            name: 'tags',
            type: 'array',
            title: 'Tags',
            arrayItemProperties: [
              {
                id: '1-2-1',
                name: 'label',
                type: 'string',
                title: 'Label',
              },
            ],
          } as ArrayItemProperty,
        ],
      },
    ];

    const typescript = generateFullTypeScript(properties as PropertyForm[], 'TestProps');

    expect(typescript).toContain('export interface TestProps');
    expect(typescript).toContain('products');
    expect(typescript).toContain('Array<');
    expect(typescript).toContain('name: string');
    expect(typescript).toContain('tags: Array<');
    expect(typescript).toContain('label: string');
  });

  it('deve gerar tipo TypeScript com objeto dentro de array', () => {
    const properties: Partial<PropertyForm>[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        arrayItemProperties: [
          {
            id: '1-1',
            name: 'config',
            type: 'object',
            title: 'Config',
            objectProperties: [
              {
                id: '1-1-1',
                name: 'enabled',
                type: 'boolean',
                title: 'Enabled',
              },
            ],
          } as ArrayItemProperty,
        ],
      },
    ];

    const typescript = generateFullTypeScript(properties as PropertyForm[], 'TestProps');

    expect(typescript).toContain('items');
    expect(typescript).toContain('config:');
    expect(typescript).toContain('enabled: boolean');
  });

  it('deve gerar tipo TypeScript com enum dentro de array', () => {
    const properties: Partial<PropertyForm>[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        arrayItemProperties: [
          {
            id: '1-1',
            name: 'status',
            type: 'enum',
            title: 'Status',
            enumValues: 'active,inactive',
          } as ArrayItemProperty,
        ],
      },
    ];

    const typescript = generateFullTypeScript(properties as PropertyForm[], 'TestProps');

    expect(typescript).toContain('items');
    expect(typescript).toContain("'active'");
    expect(typescript).toContain("'inactive'");
  });
});

describe('Edge Cases', () => {
  it('deve lidar com propriedade raiz do tipo object com objectProperties', () => {
    const properties: Partial<PropertyForm>[] = [
      {
        id: '1',
        name: 'teste',
        type: 'object',
        title: 'Teste',
        objectProperties: [
          {
            id: '1-1',
            name: 'name',
            type: 'string',
            title: 'Name',
          },
          {
            id: '1-2',
            name: 'age',
            type: 'number',
            title: 'Age',
          },
        ],
      },
    ];

    const schema = generateVtexSchema(properties as PropertyForm[], 'Test Component');
    const typescript = generateFullTypeScript(properties as PropertyForm[], 'CustomComponentProps');

    // Verificar schema
    expect(schema.properties.teste).toBeDefined();
    expect(schema.properties.teste.type).toBe('object');
    expect(schema.properties.teste.properties).toBeDefined();
    expect(schema.properties.teste.properties?.name).toBeDefined();
    expect(schema.properties.teste.properties?.name.type).toBe('string');
    expect(schema.properties.teste.properties?.age).toBeDefined();
    expect(schema.properties.teste.properties?.age.type).toBe('number');

    // Verificar TypeScript
    expect(typescript).toContain('export interface CustomComponentProps');
    expect(typescript).toContain('teste?:');
    expect(typescript).toContain('name: string');
    expect(typescript).toContain('age: number');
    expect(typescript).not.toContain('Record<string, any>');
  });

  it('deve lidar com array vazio', () => {
    const properties: Partial<PropertyForm>[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        arrayItemProperties: [],
      },
    ];

    const schema = generateVtexSchema(properties as PropertyForm[], 'Test Component');

    expect(schema.properties.items).toBeDefined();
    expect(schema.properties.items.type).toBe('array');
  });

  it('deve ignorar propriedades sem nome', () => {
    const properties: Partial<PropertyForm>[] = [
      {
        id: '1',
        name: 'items',
        type: 'array',
        title: 'Items',
        arrayItemProperties: [
          {
            id: '1-1',
            name: '',
            type: 'string',
            title: 'Empty',
          },
          {
            id: '1-2',
            name: 'valid',
            type: 'string',
            title: 'Valid',
          },
        ],
      },
    ];

    const schema = generateVtexSchema(properties as PropertyForm[], 'Test Component');

    const itemKeys = Object.keys(schema.properties.items.items?.properties || {});
    expect(itemKeys.length).toBe(1);
    expect(itemKeys[0]).toBe('valid');
  });
});
