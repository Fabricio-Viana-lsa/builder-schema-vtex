'use client';

import { useState } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PropertyTree from '@/components/Form/PropertyTree';
import PropertyEditor from '@/components/Form/PropertyEditor';
import JsonPreview from '@/components/Form/JsonPreview';
import { PropertyForm, ArrayItemProperty, ConditionalFieldForm } from '@/types';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Folder } from 'lucide-react';
import { generateVtexSchema } from '@/utils/schemaGenerator';
import { generateFullTypeScript } from '@/utils/typeGenerator';
import { componentFormSchema, type ComponentFormData } from '@/utils/validation';

const CreateSchema = () => {
  const [properties, setProperties] = useState<PropertyForm[]>([]);
  const [selectedPath, setSelectedPath] = useState<string[] | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [componentTitle, setComponentTitle] = useState('Custom Component');

  // Usar react-hook-form com Zod para validação
  const { 
    register, 
    formState: { errors },
    setValue
  } = useForm<ComponentFormData>({
    resolver: zodResolver(componentFormSchema),
    defaultValues: {
      componentTitle: 'Custom Component',
    },
  });

  // Função para obter propriedade pelo caminho
  const getPropertyByPath = (path: string[]): PropertyForm | ArrayItemProperty | ConditionalFieldForm | null => {
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
  };

  // Função para atualizar propriedade pelo caminho
  const updatePropertyByPath = (path: string[], updatedProperty: PropertyForm | ArrayItemProperty | ConditionalFieldForm) => {
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
  };

  // Função para adicionar propriedade
  const addProperty = (parentPath: string[] | null) => {
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
      
      // Selecionar o novo item
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
  };

  // Função para remover propriedade
  const removeProperty = (path: string[]) => {
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
  };

  const handleCopyJson = () => {
    const schema = generateVtexSchema(properties, componentTitle);
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  const handleCopyTypescript = () => {
    const typescript = generateFullTypeScript(properties, `${componentTitle.replace(/\s+/g, '')}Props`);
    navigator.clipboard.writeText(typescript);
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  const selectedProperty = selectedPath ? getPropertyByPath(selectedPath) : null;

  return (
    <div className="min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] flex flex-col">
      {/* Header com Título do Componente */}
      <div className="p-4 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
            Construtor de Schema VTEX
          </h1>
          <div className="max-w-md">
            <Label>Título do Componente *</Label>
            <Input
              type="text"
              {...register('componentTitle')}
              value={componentTitle}
              onChange={(e) => {
                setComponentTitle(e.target.value);
                setValue('componentTitle', e.target.value);
              }}
              placeholder="Ex: Custom Component"
            />
            {errors.componentTitle && (
              <p className="text-destructive text-sm mt-1">{errors.componentTitle.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Layout Principal: Tree + Editor + Preview */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Property Tree - Sidebar Esquerda */}
        <div className="w-full lg:w-80 shrink-0 h-64 lg:h-auto overflow-hidden">
          <PropertyTree
            properties={properties}
            selectedPath={selectedPath}
            onSelectPath={setSelectedPath}
            onAddProperty={addProperty}
            onRemoveProperty={removeProperty}
          />
        </div>

        {/* Editor Section - Centro */}
        <div className="flex-1 overflow-y-auto bg-[hsl(var(--editor-bg))]">
          {selectedProperty ? (
            <PropertyEditor
              property={selectedProperty}
              path={selectedPath!}
              onChange={updatePropertyByPath}
              isRootLevel={selectedPath!.length === 1}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center py-12 max-w-md">
                <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma propriedade selecionada
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione uma propriedade na árvore à esquerda ou crie uma nova para começar a editar
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preview Section - Sidebar Direita */}
        <div className="w-full lg:w-96 shrink-0 relative h-96 lg:h-auto">
          <JsonPreview 
            json={generateVtexSchema(properties, componentTitle)} 
            typescript={generateFullTypeScript(properties, `${componentTitle.replace(/\s+/g, '')}Props`)}
            onCopy={handleCopyJson}
            onCopyTypescript={handleCopyTypescript}
          />
          
          {showCopiedMessage && (
            <div className="absolute top-4 sm:top-20 right-2 sm:right-6 bg-green-600 dark:bg-green-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-lg animate-fade-in text-xs sm:text-sm z-50">
              ✓ Copiado!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateSchema
