import { useState, useCallback } from 'react';
import { 
  ArrayItemProperty, 
  PropertyType,
  ArrayArrayItemProperty,
  ObjectArrayItemProperty,
  EnumArrayItemProperty,
  StringArrayItemProperty
} from '@/types';
import { BreadcrumbItem } from './types';
import { findPropertyByPath, updatePropertiesInPath } from './utils';

export function useArrayItemNavigation(
  properties: ArrayItemProperty[],
  onChange: (properties: ArrayItemProperty[]) => void
) {
  const [navigationPath, setNavigationPath] = useState<BreadcrumbItem[]>([]);

  const getCurrentProperties = useCallback((): ArrayItemProperty[] => {
    return findPropertyByPath(properties, navigationPath);
  }, [properties, navigationPath]);

  const navigateInto = useCallback((property: ArrayItemProperty) => {
    if (property.type === 'array' || property.type === 'object') {
      setNavigationPath(prev => [...prev, { 
        id: property.id, 
        name: property.name || 'sem-nome', 
        type: property.type 
      }]);
    }
  }, []);

  const navigateToLevel = useCallback((index: number) => {
    if (index === -1) {
      setNavigationPath([]);
    } else {
      setNavigationPath(prev => prev.slice(0, index + 1));
    }
  }, []);

  const updateCurrentProperties = useCallback((newProps: ArrayItemProperty[]) => {
    if (navigationPath.length === 0) {
      onChange(newProps);
    } else {
      const newRoot = updatePropertiesInPath(properties, navigationPath, newProps);
      onChange(newRoot);
    }
  }, [properties, navigationPath, onChange]);

  return {
    navigationPath,
    getCurrentProperties,
    navigateInto,
    navigateToLevel,
    updateCurrentProperties
  };
}

export function usePropertyActions(
  getCurrentProperties: () => ArrayItemProperty[],
  updateCurrentProperties: (props: ArrayItemProperty[]) => void
) {
  const addProperty = useCallback(() => {
    const newProperty: ArrayItemProperty = {
      id: Date.now().toString(),
      name: '',
      type: 'string',
      title: '',
      description: '',
      defaultValue: '',
    };
    
    const currentProps = getCurrentProperties();
    const updatedProps = [...currentProps, newProperty];
    updateCurrentProperties(updatedProps);
  }, [getCurrentProperties, updateCurrentProperties]);

  const updateProperty = useCallback((
    id: string, 
    field: string, 
    value: string | PropertyType | undefined
  ) => {
    const currentProps = getCurrentProperties();
    const updatedProps = currentProps.map((prop) => {
      if (prop.id !== id) return prop;

      const updated: Partial<ArrayItemProperty> = { ...prop, [field]: value };
      
      // Limpar propriedades não relacionadas ao tipo ao mudar tipo
      if (field === 'type') {
        const newType = value as PropertyType;
        
        // Limpar propriedades específicas de array
        if (newType !== 'array') {
          delete (updated as ArrayArrayItemProperty).arrayItemProperties;
        } else {
          // Inicializar array vazio se não existir
          const arrayProp = updated as Partial<ArrayArrayItemProperty>;
          if (!arrayProp.arrayItemProperties) {
            arrayProp.arrayItemProperties = [];
          }
        }
        
        // Limpar propriedades específicas de object
        if (newType !== 'object') {
          delete (updated as ObjectArrayItemProperty).objectProperties;
        } else {
          // Inicializar array vazio se não existir
          const objProp = updated as Partial<ObjectArrayItemProperty>;
          if (!objProp.objectProperties) {
            objProp.objectProperties = [];
          }
        }
        
        // Limpar propriedades específicas de enum
        if (newType !== 'enum') {
          delete (updated as EnumArrayItemProperty).enumValues;
          delete (updated as EnumArrayItemProperty).enumNames;
        }
        
        // Limpar propriedades específicas de string
        if (newType !== 'string') {
          delete (updated as StringArrayItemProperty).widget;
          delete (updated as StringArrayItemProperty).format;
        }
      }
      
      return updated as ArrayItemProperty;
    });

    updateCurrentProperties(updatedProps);
  }, [getCurrentProperties, updateCurrentProperties]);

  const removeProperty = useCallback((id: string) => {
    const currentProps = getCurrentProperties();
    const updatedProps = currentProps.filter((prop) => prop.id !== id);
    updateCurrentProperties(updatedProps);
  }, [getCurrentProperties, updateCurrentProperties]);

  return {
    addProperty,
    updateProperty,
    removeProperty
  };
}
