'use client'

import { ArrayItemProperty, PropertyType, WidgetType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Plus, Trash2 } from 'lucide-react';

interface ArrayItemConfigProps {
  properties: ArrayItemProperty[];
  onChange: (properties: ArrayItemProperty[]) => void;
}

export default function ArrayItemConfig({ properties, onChange }: ArrayItemConfigProps) {
  const propertyTypes: PropertyType[] = ['string', 'boolean', 'number', 'object', 'array'];
  const widgetTypes: WidgetType[] = ['image-uploader', 'datetime', 'textarea', 'color-picker', 'range'];

  const addProperty = () => {
    const newProperty: ArrayItemProperty = {
      id: Date.now().toString(),
      name: '',
      type: 'string',
      title: '',
      description: '',
      defaultValue: '',
    };
    onChange([...properties, newProperty]);
  };

  const updateProperty = (id: string, field: keyof ArrayItemProperty, value: string | PropertyType | WidgetType | undefined) => {
    onChange(
      properties.map((prop) =>
        prop.id === id ? { ...prop, [field]: value } : prop
      )
    );
  };

  const removeProperty = (id: string) => {
    onChange(properties.filter((prop) => prop.id !== id));
  };

  return (
    <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Propriedades do Item do Array</h4>
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

      {properties.length === 0 ? (
        <p className="text-sm text-blue-700 dark:text-blue-400 text-center py-2">
          Nenhuma propriedade. Clique para adicionar.
        </p>
      ) : (
        <div className="space-y-3">
          {properties.map((prop) => (
            <div key={prop.id} className="bg-card p-3 rounded border border-blue-200 dark:border-blue-700">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-foreground">Propriedade do Item</span>
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
                      onChange={(e) => updateProperty(prop.id, 'type', e.target.value as PropertyType)}
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
                            (e.target.value || undefined) as ArrayItemProperty['widget']
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
