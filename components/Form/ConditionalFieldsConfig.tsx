'use client'

import { ConditionalField, PropertyType, WidgetType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Plus, Trash2 } from 'lucide-react';

interface ConditionalFieldsConfigProps {
  fields: ConditionalField[];
  onChange: (fields: ConditionalField[]) => void;
}

export default function ConditionalFieldsConfig({ fields, onChange }: ConditionalFieldsConfigProps) {
  const propertyTypes: PropertyType[] = ['string', 'boolean', 'number', 'object', 'array', 'enum'];
  const widgetTypes: WidgetType[] = ['image-uploader', 'datetime', 'textarea', 'color-picker', 'range'];

  const addField = () => {
    const newField: ConditionalField = {
      id: Date.now().toString(),
      name: '',
      type: 'string',
      title: '',
      description: '',
      defaultValue: '',
    };
    onChange([...fields, newField]);
  };

  const updateField = (id: string, field: keyof ConditionalField, value: string | PropertyType | WidgetType | undefined) => {
    onChange(
      fields.map((f) =>
        f.id === id ? { ...f, [field]: value } : f
      )
    );
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  return (
    <div className="mt-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300">
          Campos Condicionais (aparecem quando &quot;Sim&quot; é selecionado)
        </h4>
        <Button
          onClick={addField}
          size="sm"
          className="h-7 text-xs"
          variant="success"
        >
          <Plus className="w-3 h-3" />
          Campo
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-purple-700 dark:text-purple-400 text-center py-2">
          Nenhum campo condicional. Adicione campos que aparecerão ao selecionar &quot;Sim&quot;.
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.id} className="bg-card p-3 rounded border border-purple-200 dark:border-purple-700">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-foreground">Campo Condicional</span>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeField(field.id)}
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
                      value={field.name}
                      onChange={(e) => updateField(field.id, 'name', e.target.value)}
                      placeholder="Ex: idPromotion"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Tipo *</Label>
                    <Select
                      value={field.type}
                      onChange={(e) => updateField(field.id, 'type', e.target.value as PropertyType)}
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
                    value={field.title}
                    onChange={(e) => updateField(field.id, 'title', e.target.value)}
                    placeholder="Ex: ID da promoção"
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Descrição</Label>
                  <Input
                    type="text"
                    value={field.description || ''}
                    onChange={(e) => updateField(field.id, 'description', e.target.value)}
                    placeholder="Descrição opcional"
                    className="h-8 text-sm"
                  />
                </div>

                {field.type === 'enum' && (
                  <>
                    <div>
                      <Label className="text-xs">Enum Values</Label>
                      <Input
                        type="text"
                        value={field.enumValues || ''}
                        onChange={(e) => updateField(field.id, 'enumValues', e.target.value)}
                        placeholder="Ex: basic, premium, vip"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Enum Names</Label>
                      <Input
                        type="text"
                        value={field.enumNames || ''}
                        onChange={(e) => updateField(field.id, 'enumNames', e.target.value)}
                        placeholder="Ex: Básico, Premium, VIP"
                        className="h-8 text-sm"
                      />
                    </div>
                  </>
                )}

                {field.type === 'string' && (
                  <>
                    <div>
                      <Label className="text-xs">Widget</Label>
                      <Select
                        value={field.widget || ''}
                        onChange={(e) =>
                          updateField(
                            field.id,
                            'widget',
                            (e.target.value || undefined) as ConditionalField['widget']
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
                        value={field.format || ''}
                        onChange={(e) => updateField(field.id, 'format', e.target.value)}
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
                    value={field.defaultValue || ''}
                    onChange={(e) => updateField(field.id, 'defaultValue', e.target.value)}
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
