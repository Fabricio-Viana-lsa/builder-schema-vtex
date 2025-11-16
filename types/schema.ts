export type PropertyType = 'string' | 'boolean' | 'object' | 'array' | 'number' | 'enum' | 'conditional';

export type WidgetType = 
  | 'image-uploader' 
  | 'datetime' 
  | 'textarea'
  | 'color-picker'
  | 'range'
  | 'radio';

export interface PropertyWidget {
  'ui:widget'?: WidgetType;
}

export interface ConditionalField {
  id: string;
  name: string;
  type: PropertyType;
  title: string;
  description?: string;
  defaultValue?: string;
  widget?: WidgetType;
  format?: string;
}

export interface Property {
  type: PropertyType;
  title: string;
  description?: string;
  default?: unknown;
  enum?: string[];
  enumNames?: string[];
  format?: string;
  widget?: PropertyWidget;
  properties?: { [key: string]: Property };
  items?: Property;
}

export interface SchemaDefinition {
  title: string;
  type: 'object';
  properties: { [key: string]: Property };
}

// Base comum para todas as propriedades
interface BaseArrayItemProperty {
  id: string;
  name: string;
  title: string;
  description?: string;
  defaultValue?: string;
}

// Propriedade do tipo string
export interface StringArrayItemProperty extends BaseArrayItemProperty {
  type: 'string';
  widget?: WidgetType;
  format?: string;
}

// Propriedade do tipo boolean
export interface BooleanArrayItemProperty extends BaseArrayItemProperty {
  type: 'boolean';
}

// Propriedade do tipo number
export interface NumberArrayItemProperty extends BaseArrayItemProperty {
  type: 'number';
}

// Propriedade do tipo enum
export interface EnumArrayItemProperty extends BaseArrayItemProperty {
  type: 'enum';
  enumValues?: string;
  enumNames?: string;
}

// Propriedade do tipo array (pode conter outras propriedades aninhadas)
export interface ArrayArrayItemProperty extends BaseArrayItemProperty {
  type: 'array';
  arrayItemProperties?: ArrayItemProperty[];
}

// Propriedade do tipo object (pode conter outras propriedades aninhadas)
export interface ObjectArrayItemProperty extends BaseArrayItemProperty {
  type: 'object';
  objectProperties?: ArrayItemProperty[];
}

// Propriedade do tipo conditional
export interface ConditionalArrayItemProperty extends BaseArrayItemProperty {
  type: 'conditional';
}

// Union type discriminado
export type ArrayItemProperty =
  | StringArrayItemProperty
  | BooleanArrayItemProperty
  | NumberArrayItemProperty
  | EnumArrayItemProperty
  | ArrayArrayItemProperty
  | ObjectArrayItemProperty
  | ConditionalArrayItemProperty;

export interface PropertyForm {
  id: string;
  name: string;
  type: PropertyType;
  title: string;
  description?: string;
  defaultValue?: string;
  widget?: WidgetType;
  format?: string;
  // Para enum
  enumValues?: string;
  enumNames?: string;
  // Para array
  arrayItemType?: PropertyType;
  arrayItemTitle?: string;
  arrayItemProperties?: ArrayItemProperty[];
  arrayDefaultValue?: string;
  enableEditorItemTitle?: string;
  editorItemTitleDefault?: string;
  editorItemTitleLabel?: string;
  // Para object
  objectProperties?: PropertyForm[];
  // Para conditional
  conditionalFields?: ConditionalField[];
  conditionalTriggerValue?: string;
}
