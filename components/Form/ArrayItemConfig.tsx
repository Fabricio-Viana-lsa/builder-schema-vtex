'use client'

import { 
  ArrayItemProperty, 
  ArrayArrayItemProperty,
  ObjectArrayItemProperty,
  StringArrayItemProperty,
  EnumArrayItemProperty,
  PropertyType, 
  WidgetType 
} from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Plus, Trash2, ChevronRight, Box, List } from 'lucide-react';
import { useState } from 'react';
import BreadcrumbNav, { BreadcrumbItem } from './BreadcrumbNav';

interface ArrayItemConfigProps {
  properties: ArrayItemProperty[];
  onChange: (properties: ArrayItemProperty[]) => void;
}

export default function ArrayItemConfig({ properties, onChange }: ArrayItemConfigProps) {
  const propertyTypes: PropertyType[] = ['string', 'boolean', 'number', 'object', 'array', 'enum'];
  const widgetTypes: WidgetType[] = ['image-uploader', 'datetime', 'textarea', 'color-picker', 'range'];
  
  const [navigationPath, setNavigationPath] = useState<BreadcrumbItem[]>([]);

  // Type guards para verificar tipos específicos
  const isArrayProperty = (prop: ArrayItemProperty): prop is ArrayArrayItemProperty => {
    return prop.type === 'array';
  };

  const isObjectProperty = (prop: ArrayItemProperty): prop is ObjectArrayItemProperty => {
    return prop.type === 'object';
  };

  // Função para encontrar propriedade por caminho
  const findPropertyByPath = (props: ArrayItemProperty[], path: BreadcrumbItem[]): ArrayItemProperty[] => {
    if (path.length === 0) return props;
    
    let current = props;
    for (const pathItem of path) {
      const found = current.find(p => p.id === pathItem.id);
      if (!found) return props;
      
      if (isArrayProperty(found) && found.arrayItemProperties) {
        current = found.arrayItemProperties;
      } else if (isObjectProperty(found) && found.objectProperties) {
        current = found.objectProperties;
      } else {
        return props;
      }
    }
    return current;
  };

  // Função para atualizar propriedades no caminho correto
  const updatePropertiesInPath = (
    rootProps: ArrayItemProperty[], 
    path: BreadcrumbItem[], 
    newProps: ArrayItemProperty[]
  ): ArrayItemProperty[] => {
    if (path.length === 0) return newProps;

    const updateRecursive = (props: ArrayItemProperty[], pathIndex: number): ArrayItemProperty[] => {
      if (pathIndex >= path.length) return newProps;

      return props.map(prop => {
        if (prop.id === path[pathIndex].id) {
          if (pathIndex === path.length - 1) {
            // Último nível - atualizar as propriedades
            if (prop.type === 'array') {
              return { ...prop, arrayItemProperties: newProps };
            } else if (prop.type === 'object') {
              return { ...prop, objectProperties: newProps };
            }
          } else {
            // Nível intermediário - continuar recursão
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (prop.type === 'array' && (prop as any).arrayItemProperties) {
              return { 
                ...prop, 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                arrayItemProperties: updateRecursive((prop as any).arrayItemProperties, pathIndex + 1) 
              };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } else if (prop.type === 'object' && (prop as any).objectProperties) {
              return { 
                ...prop, 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                objectProperties: updateRecursive((prop as any).objectProperties, pathIndex + 1) 
              };
            }
          }
        }
        return prop;
      });
    };

    return updateRecursive(rootProps, 0);
  };

  // Navegar para dentro de um objeto ou array
  const navigateInto = (property: ArrayItemProperty) => {
    if (property.type === 'array' || property.type === 'object') {
      setNavigationPath([...navigationPath, { 
        id: property.id, 
        name: property.name || 'sem-nome', 
        type: property.type 
      }]);
    }
  };

  // Navegar para um nível específico no breadcrumb
  const navigateToLevel = (index: number) => {
    if (index === -1) {
      setNavigationPath([]);
    } else {
      setNavigationPath(navigationPath.slice(0, index + 1));
    }
  };

  // Obter propriedades atuais baseado no caminho
  const getCurrentProperties = (): ArrayItemProperty[] => {
    return findPropertyByPath(properties, navigationPath);
  };

  const addProperty = () => {
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
    
    if (navigationPath.length === 0) {
      onChange(updatedProps);
    } else {
      const newRoot = updatePropertiesInPath(properties, navigationPath, updatedProps);
      onChange(newRoot);
    }
  };

  const updateProperty = (
    id: string, 
    field: string, 
    value: string | PropertyType | WidgetType | ArrayItemProperty[] | undefined
  ) => {
    const currentProps = getCurrentProperties();
    const updatedProps = currentProps.map((prop) => {
      if (prop.id === id) {
        const updated: Partial<ArrayItemProperty> = { ...prop, [field]: value };
        
        // Limpar propriedades não relacionadas ao tipo
        if (field === 'type') {
          const newType = value as PropertyType;
          if (newType !== 'array') {
            delete (updated as ArrayArrayItemProperty).arrayItemProperties;
          }
          if (newType !== 'object') {
            delete (updated as ObjectArrayItemProperty).objectProperties;
          }
          if (newType !== 'enum') {
            delete (updated as EnumArrayItemProperty).enumValues;
            delete (updated as EnumArrayItemProperty).enumNames;
          }
          if (newType !== 'string') {
            delete (updated as StringArrayItemProperty).widget;
            delete (updated as StringArrayItemProperty).format;
          }
        }
        
        return updated as ArrayItemProperty;
      }
      return prop;
    });

    if (navigationPath.length === 0) {
      onChange(updatedProps);
    } else {
      const newRoot = updatePropertiesInPath(properties, navigationPath, updatedProps);
      onChange(newRoot);
    }
  };

  const removeProperty = (id: string) => {
    const currentProps = getCurrentProperties();
    const updatedProps = currentProps.filter((prop) => prop.id !== id);
    
    if (navigationPath.length === 0) {
      onChange(updatedProps);
    } else {
      const newRoot = updatePropertiesInPath(properties, navigationPath, updatedProps);
      onChange(newRoot);
    }
  };

  // Inicializar propriedades aninhadas quando o tipo muda
  const initializeNestedProperties = (id: string, type: PropertyType) => {
    const currentProps = getCurrentProperties();
    const updatedProps = currentProps.map((prop) => {
      if (prop.id === id) {
        const updated: Partial<ArrayItemProperty> = { ...prop };
        
        if (type === 'array') {
          const arrayProp = updated as Partial<ArrayArrayItemProperty>;
          if (!arrayProp.arrayItemProperties) {
            arrayProp.arrayItemProperties = [];
          }
        } else if (type === 'object') {
          const objProp = updated as Partial<ObjectArrayItemProperty>;
          if (!objProp.objectProperties) {
            objProp.objectProperties = [];
          }
        }
        
        return updated as ArrayItemProperty;
      }
      return prop;
    });

    if (navigationPath.length === 0) {
      onChange(updatedProps);
    } else {
      const newRoot = updatePropertiesInPath(properties, navigationPath, updatedProps);
      onChange(newRoot);
    }
  };

  const currentPropertiesList = getCurrentProperties();

  return (
    <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
          Propriedades do Item do Array
        </h4>
        <Button
          onClick={addProperty}
          size="sm"
          className="h-7 text-xs"
          variant="success"
        >
          <Plus className="w-3 h-3" />
          Propriedade
        </Button>
      </div>

      {/* Breadcrumb Navigation */}
      {navigationPath.length > 0 && (
        <BreadcrumbNav path={navigationPath} onNavigate={navigateToLevel} />
      )}

      {currentPropertiesList.length === 0 ? (
        <p className="text-sm text-blue-700 dark:text-blue-400 text-center py-2">
          Nenhuma propriedade. Clique para adicionar.
        </p>
      ) : (
        <div className="space-y-3 mt-3">
          {currentPropertiesList.map((prop) => (
            <div key={prop.id} className="bg-card p-3 rounded border border-blue-200 dark:border-blue-700">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-foreground">Propriedade do Item</span>
                  {(prop.type === 'array' || prop.type === 'object') && (
                    <Button
                      onClick={() => navigateInto(prop)}
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                    >
                      {prop.type === 'array' ? <List className="w-3 h-3" /> : <Box className="w-3 h-3" />}
                      <ChevronRight className="w-3 h-3" />
                      {prop.type === 'array' && isArrayProperty(prop)
                        ? `${(prop.arrayItemProperties?.length || 0)} props`
                        : prop.type === 'object' && isObjectProperty(prop)
                        ? `${(prop.objectProperties?.length || 0)} props`
                        : '0 props'
                      }
                    </Button>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeProperty(prop.id)}
                  className="h-6 w-6"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Nome *</Label>
                    <Input
                      type="text"
                      value={prop.name}
                      onChange={(e) => updateProperty(prop.id, 'name', e.target.value)}
                      placeholder="Ex: src, alt"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Tipo *</Label>
                    <Select
                      value={prop.type}
                      onChange={(e) => {
                        const newType = e.target.value as PropertyType;
                        updateProperty(prop.id, 'type', newType);
                        initializeNestedProperties(prop.id, newType);
                      }}
                      className="h-8 text-sm"
                    >
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Título *</Label>
                  <Input
                    type="text"
                    value={prop.title}
                    onChange={(e) => updateProperty(prop.id, 'title', e.target.value)}
                    placeholder="Ex: Image SRC"
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Descrição</Label>
                  <Input
                    type="text"
                    value={prop.description || ''}
                    onChange={(e) => updateProperty(prop.id, 'description', e.target.value)}
                    placeholder="Descrição opcional"
                    className="h-8 text-sm"
                  />
                </div>

                {/* Campos específicos para Enum */}
                {prop.type === 'enum' && (
                  <>
                    <div>
                      <Label className="text-xs">Valores (separados por vírgula)</Label>
                      <Input
                        type="text"
                        value={prop.enumValues || ''}
                        onChange={(e) => updateProperty(prop.id, 'enumValues', e.target.value)}
                        placeholder="Ex: red, blue, green"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Nomes (opcional)</Label>
                      <Input
                        type="text"
                        value={prop.enumNames || ''}
                        onChange={(e) => updateProperty(prop.id, 'enumNames', e.target.value)}
                        placeholder="Ex: Vermelho, Azul, Verde"
                        className="h-8 text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Campos específicos para String */}
                {prop.type === 'string' && (
                  <>
                    <div>
                      <Label className="text-xs">Widget</Label>
                      <Select
                        value={prop.widget || ''}
                        onChange={(e) =>
                          updateProperty(
                            prop.id,
                            'widget',
                            (e.target.value || undefined) as WidgetType | undefined
                          )
                        }
                        className="h-8 text-sm"
                      >
                        <option value="">Nenhum</option>
                        {widgetTypes.map((widget) => (
                          <option key={widget} value={widget}>
                            {widget}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Formato</Label>
                      <Input
                        type="text"
                        value={prop.format || ''}
                        onChange={(e) => updateProperty(prop.id, 'format', e.target.value)}
                        placeholder="Ex: date-time"
                        className="h-8 text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Valor Padrão - não mostrar para array e object */}
                {prop.type !== 'array' && prop.type !== 'object' && (
                  <div>
                    <Label className="text-xs">Valor Padrão</Label>
                    <Input
                      type="text"
                      value={prop.defaultValue || ''}
                      onChange={(e) => updateProperty(prop.id, 'defaultValue', e.target.value)}
                      placeholder="Valor padrão"
                      className="h-8 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
