 

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
