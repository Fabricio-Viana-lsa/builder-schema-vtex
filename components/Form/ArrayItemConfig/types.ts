import { 
  ArrayItemProperty, 
  ArrayArrayItemProperty,
  ObjectArrayItemProperty
} from '@/types';

export interface BreadcrumbItem {
  id: string;
  name: string;
  type: 'array' | 'object';
}

export interface ArrayItemConfigProps {
  properties: ArrayItemProperty[];
  onChange: (properties: ArrayItemProperty[]) => void;
}

// Type guards
export function isArrayProperty(prop: ArrayItemProperty): prop is ArrayArrayItemProperty {
  return prop.type === 'array';
}

export function isObjectProperty(prop: ArrayItemProperty): prop is ObjectArrayItemProperty {
  return prop.type === 'object';
}
