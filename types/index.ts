import { z } from 'zod';

// ===== Tipos do PropertyForm (estado do formulário) =====
export const propertyTypeSchema = z.enum(['string', 'number', 'boolean', 'object', 'array', 'enum', 'conditional']);
export const widgetTypeSchema = z.enum(['image-uploader', 'datetime', 'textarea', 'color-picker', 'range', 'radio']);

export const conditionalFieldFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  type: propertyTypeSchema,
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  defaultValue: z.string().optional(),
  enumValues: z.string().optional(),
  enumNames: z.string().optional(),
  widget: widgetTypeSchema.optional(),
  format: z.string().optional(),
});

export const arrayItemFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  type: propertyTypeSchema,
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  defaultValue: z.string().optional(),
  widget: widgetTypeSchema.optional(),
  format: z.string().optional(),
});

export const propertyFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  type: propertyTypeSchema,
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  defaultValue: z.string().optional(),
  required: z.boolean().default(false),
  widget: widgetTypeSchema.optional(),
  format: z.string().optional(),
  
  // Para enum
  enumValues: z.string().optional(),
  enumNames: z.string().optional(),
  
  // Para array
  arrayItemType: propertyTypeSchema.optional(),
  arrayItemTitle: z.string().optional(),
  arrayItemProperties: z.array(arrayItemFormSchema).optional(),
  arrayDefaultValue: z.string().optional(),
  enableEditorItemTitle: z.string().optional(), // 'true' | ''
  editorItemTitleDefault: z.string().optional(),
  editorItemTitleLabel: z.string().optional(),
  
  // Para object
  objectProperties: z.array(arrayItemFormSchema).optional(),
  
  // Para conditional
  conditionalFields: z.array(conditionalFieldFormSchema).optional(),
  addConditionalFields: z.boolean().default(false),
});

// TypeScript types para o formulário
export type PropertyType = z.infer<typeof propertyTypeSchema>;
export type WidgetType = z.infer<typeof widgetTypeSchema>;
export type ConditionalFieldForm = z.infer<typeof conditionalFieldFormSchema>;
export type ArrayItemForm = z.infer<typeof arrayItemFormSchema>;
export type PropertyForm = z.infer<typeof propertyFormSchema>;

// Aliases para compatibilidade
export type ConditionalField = ConditionalFieldForm;

// Exportar tipos discriminados de schema.ts
export type {
  ArrayItemProperty,
  ArrayArrayItemProperty,
  ObjectArrayItemProperty,
  StringArrayItemProperty,
  EnumArrayItemProperty,
  BooleanArrayItemProperty,
  NumberArrayItemProperty,
  ConditionalArrayItemProperty,
} from './schema';

// ===== Tipos do Schema VTEX (JSON gerado) =====
export type VtexProperty = {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  title: string;
  description?: string;
  default?: string | number | boolean;
  enum?: string[];
  enumNames?: string[];
  format?: string;
  widget?: {
    'ui:widget': WidgetType;
  };
  items?: VtexProperty | {
    type: 'object';
    properties: Record<string, VtexProperty>;
    '__editorItemTitle'?: string;
  };
  properties?: Record<string, VtexProperty>;
};

export type VtexSchemaDefinition = {
  title: string;
  type: 'object';
  properties: Record<string, VtexProperty>;
  dependencies?: Record<string, {
    oneOf: Array<{
      properties: Record<string, Partial<VtexProperty>>;
    }>;
  }>;
};

// Legacy compatibility types
export type TbaseSchema = {
  title: string;
  description: string;
  type: 'object';
  properties: Record<string, TpropertySchema>;
  required?: string[];
};

export type TpropertySchema = {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  title: string;
  description?: string;
  enum?: string[];
  items?: TpropertySchema;
  properties?: Record<string, TpropertySchema>;
  required?: string[];
};
