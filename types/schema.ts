export type PropertyType = 'string' | 'boolean' | 'object' | 'array' | 'number' | 'conditional';

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

export interface ArrayItemProperty {
  id: string;
  name: string;
  type: PropertyType;
  title: string;
  description?: string;
  defaultValue?: string;
  widget?: WidgetType;
  format?: string;
}

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
