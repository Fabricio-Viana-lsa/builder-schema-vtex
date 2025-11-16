'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PropertyForm, ArrayItemProperty, ConditionalFieldForm } from '@/types';

interface PropertyContextType {
  properties: PropertyForm[];
  selectedPath: string[] | null;
  componentTitle: string;
  
  // Operações
  setComponentTitle: (title: string) => void;
  setSelectedPath: (path: string[] | null) => void;
  getPropertyByPath: (path: string[]) => PropertyForm | ArrayItemProperty | ConditionalFieldForm | null;
  updatePropertyByPath: (path: string[], updatedProperty: PropertyForm | ArrayItemProperty | ConditionalFieldForm) => void;
  addProperty: (parentPath: string[] | null) => void;
  removeProperty: (path: string[]) => void;
  setProperties: (properties: PropertyForm[]) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<PropertyForm[]>([]);
  const [selectedPath, setSelectedPath] = useState<string[] | null>(null);
  const [componentTitle, setComponentTitle] = useState('Custom Component');

  // Função para obter propriedade pelo caminho
  const getPropertyByPath = useCallback((path: string[]): PropertyForm | ArrayItemProperty | ConditionalFieldForm | null => {
    if (path.length === 0) return null;
    
    let current: PropertyForm | ArrayItemProperty | ConditionalFieldForm = properties[parseInt(path[0])];
    
    for (let i = 1; i < path.length; i++) {
      const index = parseInt(path[i]);
      
      if (current.type === 'array' && 'arrayItemProperties' in current && current.arrayItemProperties) {
        current = current.arrayItemProperties[index];
      } else if (current.type === 'object' && 'objectProperties' in current && current.objectProperties) {
        current = current.objectProperties[index];
      } else if (current.type === 'conditional' && 'conditionalFields' in current && current.conditionalFields) {
        current = current.conditionalFields[index];
      } else {
        return null;
      }
    }
    
    return current;
  }, [properties]);

  // Função para atualizar propriedade pelo caminho
  const updatePropertyByPath = useCallback((
    path: string[], 
    updatedProperty: PropertyForm | ArrayItemProperty | ConditionalFieldForm
  ) => {
    const newProperties = [...properties];
    
    if (path.length === 1) {
      newProperties[parseInt(path[0])] = updatedProperty as PropertyForm;
    } else {
      const updateNested = (
        items: (PropertyForm | ArrayItemProperty | ConditionalFieldForm)[],
        pathIndex: number
      ): (PropertyForm | ArrayItemProperty | ConditionalFieldForm)[] => {
        return items.map((item, index) => {
          if (index !== parseInt(path[pathIndex])) return item;
          
          if (pathIndex === path.length - 1) {
            return updatedProperty;
          }
          
          const newItem = { ...item };
          
          if (item.type === 'array' && 'arrayItemProperties' in item && item.arrayItemProperties) {
            return {
              ...newItem,
              arrayItemProperties: updateNested(item.arrayItemProperties, pathIndex + 1) as ArrayItemProperty[]
            };
          } else if (item.type === 'object' && 'objectProperties' in item && item.objectProperties) {
            return {
              ...newItem,
              objectProperties: updateNested(item.objectProperties, pathIndex + 1) as ArrayItemProperty[]
            };
          } else if (item.type === 'conditional' && 'conditionalFields' in item && item.conditionalFields) {
            return {
              ...newItem,
              conditionalFields: updateNested(item.conditionalFields, pathIndex + 1) as ConditionalFieldForm[]
            };
          }
          
          return newItem;
        });
      };
      
      const updated = updateNested(newProperties, 0);
      setProperties(updated as PropertyForm[]);
      return;
    }
    
    setProperties(newProperties);
  }, [properties]);

  // Função para adicionar propriedade
  const addProperty = useCallback((parentPath: string[] | null) => {
    const newProperty: ArrayItemProperty = {
      id: Date.now().toString(),
      name: '',
      type: 'string',
      title: '',
      description: '',
      defaultValue: '',
    };

    if (parentPath === null) {
      // Adicionar no nível raiz
      const newRootProperty: PropertyForm = {
        ...newProperty,
        required: false,
        addConditionalFields: false,
      };
      setProperties([...properties, newRootProperty]);
      setSelectedPath([properties.length.toString()]);
    } else {
      // Adicionar como filho
      const parentItem = getPropertyByPath(parentPath);
      
      if (!parentItem) return;
      
      const newProperties = [...properties];
      
      const addToParent = (
        items: (PropertyForm | ArrayItemProperty | ConditionalFieldForm)[],
        pathIndex: number
      ): (PropertyForm | ArrayItemProperty | ConditionalFieldForm)[] => {
        return items.map((item, index) => {
          if (index !== parseInt(parentPath[pathIndex])) return item;
          
          if (pathIndex === parentPath.length - 1) {
            if (item.type === 'array') {
              const arrayItem = item as typeof item & { arrayItemProperties?: ArrayItemProperty[] };
              return {
                ...arrayItem,
                arrayItemProperties: [
                  ...(arrayItem.arrayItemProperties || []),
                  newProperty
                ]
              };
            } else if (item.type === 'object') {
              const objectItem = item as typeof item & { objectProperties?: ArrayItemProperty[] };
              return {
                ...objectItem,
                objectProperties: [
                  ...(objectItem.objectProperties || []),
                  newProperty
                ]
              };
            } else if (item.type === 'conditional' && 'conditionalFields' in item) {
              const conditionalItem = item as PropertyForm;
              return {
                ...conditionalItem,
                conditionalFields: [
                  ...(conditionalItem.conditionalFields || []),
                  newProperty as ConditionalFieldForm
                ]
              };
            }
            
            return item;
          }
          
          const newItem = { ...item };
          
          if (item.type === 'array' && 'arrayItemProperties' in item && item.arrayItemProperties) {
            return {
              ...newItem,
              arrayItemProperties: addToParent(item.arrayItemProperties, pathIndex + 1) as ArrayItemProperty[]
            };
          } else if (item.type === 'object' && 'objectProperties' in item && item.objectProperties) {
            return {
              ...newItem,
              objectProperties: addToParent(item.objectProperties, pathIndex + 1) as ArrayItemProperty[]
            };
          } else if (item.type === 'conditional' && 'conditionalFields' in item && item.conditionalFields) {
            return {
              ...newItem,
              conditionalFields: addToParent(item.conditionalFields, pathIndex + 1) as ConditionalFieldForm[]
            };
          }
          
          return newItem;
        });
      };
      
      const updated = addToParent(newProperties, 0);
      setProperties(updated as PropertyForm[]);
      
      // Selecionar o novo item - calcular o índice correto
      const updatedParent = getPropertyByPath(parentPath);
      if (updatedParent) {
        let newIndex = 0;
        if (updatedParent.type === 'array' && 'arrayItemProperties' in updatedParent && updatedParent.arrayItemProperties) {
          newIndex = updatedParent.arrayItemProperties.length;
        } else if (updatedParent.type === 'object' && 'objectProperties' in updatedParent && updatedParent.objectProperties) {
          newIndex = updatedParent.objectProperties.length;
        } else if (updatedParent.type === 'conditional' && 'conditionalFields' in updatedParent && updatedParent.conditionalFields) {
          newIndex = updatedParent.conditionalFields.length;
        }
        setSelectedPath([...parentPath, newIndex.toString()]);
      }
    }
  }, [properties, getPropertyByPath]);

  // Função para remover propriedade
  const removeProperty = useCallback((path: string[]) => {
    if (path.length === 1) {
      const newProperties = properties.filter((_, index) => index !== parseInt(path[0]));
      setProperties(newProperties);
      setSelectedPath(null);
    } else {
      const newProperties = [...properties];
      
      const removeNested = (
        items: (PropertyForm | ArrayItemProperty | ConditionalFieldForm)[],
        pathIndex: number
      ): (PropertyForm | ArrayItemProperty | ConditionalFieldForm)[] => {
        return items.map((item, index) => {
          if (index !== parseInt(path[pathIndex])) return item;
          
          if (pathIndex === path.length - 2) {
            const newItem = { ...item };
            const removeIndex = parseInt(path[path.length - 1]);
            
            if (item.type === 'array' && 'arrayItemProperties' in item && item.arrayItemProperties) {
              return {
                ...newItem,
                arrayItemProperties: item.arrayItemProperties.filter((_, i) => i !== removeIndex)
              };
            } else if (item.type === 'object' && 'objectProperties' in item && item.objectProperties) {
              return {
                ...newItem,
                objectProperties: item.objectProperties.filter((_, i) => i !== removeIndex)
              };
            } else if (item.type === 'conditional' && 'conditionalFields' in item && item.conditionalFields) {
              return {
                ...newItem,
                conditionalFields: item.conditionalFields.filter((_, i) => i !== removeIndex)
              };
            }
            
            return newItem;
          }
          
          const newItem = { ...item };
          
          if (item.type === 'array' && 'arrayItemProperties' in item && item.arrayItemProperties) {
            return {
              ...newItem,
              arrayItemProperties: removeNested(item.arrayItemProperties, pathIndex + 1) as ArrayItemProperty[]
            };
          } else if (item.type === 'object' && 'objectProperties' in item && item.objectProperties) {
            return {
              ...newItem,
              objectProperties: removeNested(item.objectProperties, pathIndex + 1) as ArrayItemProperty[]
            };
          } else if (item.type === 'conditional' && 'conditionalFields' in item && item.conditionalFields) {
            return {
              ...newItem,
              conditionalFields: removeNested(item.conditionalFields, pathIndex + 1) as ConditionalFieldForm[]
            };
          }
          
          return newItem;
        });
      };
      
      const updated = removeNested(newProperties, 0);
      setProperties(updated as PropertyForm[]);
      setSelectedPath(null);
    }
  }, [properties]);

  const value: PropertyContextType = {
    properties,
    selectedPath,
    componentTitle,
    setComponentTitle,
    setSelectedPath,
    getPropertyByPath,
    updatePropertyByPath,
    addProperty,
    removeProperty,
    setProperties,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function usePropertyContext() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('usePropertyContext deve ser usado dentro de um PropertyProvider');
  }
  return context;
}
