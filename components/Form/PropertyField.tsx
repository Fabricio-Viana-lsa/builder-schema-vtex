'use client'

import { PropertyForm, PropertyType, WidgetType } from '@/types';
import ArrayItemConfig from './ArrayItemConfig';
import ConditionalFieldsConfig from './ConditionalFieldsConfig';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Trash2, Info } from 'lucide-react';

interface PropertyFieldProps {
  property: PropertyForm;
  onChange: (updatedProperty: PropertyForm) => void;
  onRemove: () => void;
}

export default function PropertyField({ property, onChange, onRemove }: PropertyFieldProps) {
  const propertyTypes: PropertyType[] = ['string', 'boolean', 'object', 'array', 'number', 'enum', 'conditional'];
  const widgetTypes: WidgetType[] = ['image-uploader', 'datetime', 'textarea', 'color-picker', 'range'];

  const handleChange = <K extends keyof PropertyForm>(field: K, value: PropertyForm[K]) => {
    onChange({ ...property, [field]: value });
  };

  const handleConditionalToggle = (checked: boolean) => {
    onChange({
      ...property,
      addConditionalFields: checked,
      conditionalFields: checked ? property.conditionalFields || [] : [],
    });
  };

  const isEnumType = property.type === 'enum';
  const isArrayType = property.type === 'array';
  const isStringType = property.type === 'string';
  const isConditionalType = property.type === 'conditional';

  return (
    <div className="border border-border rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 bg-card">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-sm sm:text-base text-foreground">Propriedade</h3>
        <Button variant="destructive" size="sm" onClick={onRemove}>
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Remover</span>
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label>Nome da Propriedade *</Label>
          <Input
            type="text"
            value={property.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: title, images, active"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Tipo *</Label>
            <Select
              value={property.type}
              onChange={(e) => handleChange('type', e.target.value as PropertyType)}
            >
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Título *</Label>
            <Input
              type="text"
              value={property.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Título, Imagens"
            />
          </div>
        </div>

        <div>
          <Label>Descrição</Label>
          <Input
            type="text"
            value={property.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Descrição opcional"
          />
        </div>

        {/* Campos específicos para String */}
        {isStringType && (
          <>
            <div>
              <Label>Widget (opcional)</Label>
              <Select
                value={property.widget || ''}
                onChange={(e) =>
                  handleChange('widget', (e.target.value || undefined) as PropertyForm['widget'])
                }
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
              <Label>Formato (opcional)</Label>
              <Input
                type="text"
                value={property.format || ''}
                onChange={(e) => handleChange('format', e.target.value)}
                placeholder="Ex: date-time"
              />
            </div>
          </>
        )}

        {/* Valor Padrão - Não mostrar para Array */}
        {!isArrayType && (
          <div>
            <Label>Valor Padrão</Label>
            <Input
              type="text"
              value={property.defaultValue || ''}
              onChange={(e) => handleChange('defaultValue', e.target.value)}
              placeholder={property.type === 'boolean' ? 'true ou false' : 'Valor padrão'}
            />
          </div>
        )}

        {/* Campos Enum - Apenas quando tipo Enum selecionado */}
        {isEnumType && (
          <>
            <div>
              <Label>
                Enum (valores permitidos, separados por vírgula)
              </Label>
              <Input
                type="text"
                value={property.enumValues || ''}
                onChange={(e) => handleChange('enumValues', e.target.value)}
                placeholder="Ex: red, blue, green"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                Use para criar dropdown com valores específicos
              </p>
            </div>

            <div>
              <Label>
                Enum Names (nomes amigáveis, separados por vírgula)
              </Label>
              <Input
                type="text"
                value={property.enumNames || ''}
                onChange={(e) => handleChange('enumNames', e.target.value)}
                placeholder="Ex: Vermelho, Azul, Verde"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                Opcional: Nomes que aparecem no Site Editor (mesma ordem do enum)
              </p>
            </div>
          </>
        )}

        {/* Campos específicos para Array */}
        {isArrayType && (
          <>
            <div className="border-t border-border pt-3">
              <Label>Título do Item do Array</Label>
              <Input
                type="text"
                value={property.arrayItemTitle || ''}
                onChange={(e) => handleChange('arrayItemTitle', e.target.value)}
                placeholder="Ex: Image"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={property.enableEditorItemTitle === 'true'}
                  onChange={(e) => handleChange('enableEditorItemTitle', e.target.checked ? 'true' : '')}
                  className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                />
                Permitir editar nome do item no Site Editor
              </label>
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                Adiciona o campo __editorItemTitle para personalizar o nome de cada item
              </p>
            </div>

            {property.enableEditorItemTitle && (
              <div className="ml-6 p-3 bg-muted border border-border rounded">
                <div>
                  <Label className="text-xs">Título Padrão do __editorItemTitle</Label>
                  <Input
                    type="text"
                    value={property.editorItemTitleDefault || ''}
                    onChange={(e) => handleChange('editorItemTitleDefault', e.target.value)}
                    placeholder="Ex: Image Item"
                    className="h-8"
                  />
                </div>
                <div className="mt-2">
                  <Label className="text-xs">Label do Campo</Label>
                  <Input
                    type="text"
                    value={property.editorItemTitleLabel || ''}
                    onChange={(e) => handleChange('editorItemTitleLabel', e.target.value)}
                    placeholder="Ex: Change item name"
                    className="h-8"
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Valor Padrão do Array (JSON)</Label>
              <Textarea
                value={property.arrayDefaultValue || ''}
                onChange={(e) => handleChange('arrayDefaultValue', e.target.value)}
                placeholder='Ex: [{"src": "", "alt": "Text alternative"}]'
                rows={3}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                Opcional: Array JSON com valores padrão
              </p>
            </div>

            <ArrayItemConfig
              properties={property.arrayItemProperties || []}
              onChange={(props) => handleChange('arrayItemProperties', props)}
            />
          </>
        )}

        {/* Campos específicos para Conditional */}
        {isConditionalType && (
          <>
            <div className="border-t border-border pt-3 bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
              <p className="text-sm text-purple-900 dark:text-purple-300 mb-2">
                <strong>Tipo Condicional:</strong> Cria um campo radio Não/Sim que mostra campos adicionais quando &quot;Sim&quot; é selecionado.
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-400">
                O schema será gerado automaticamente com enum [&apos;none&apos;, &apos;provide&apos;] e widget radio.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-purple-900 dark:text-purple-300">
                <input
                  type="checkbox"
                  checked={property.addConditionalFields}
                  onChange={(e) => handleConditionalToggle(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-input rounded focus:ring-ring"
                />
                Exibir campos condicionais quando &quot;Sim&quot; for selecionado
              </label>
              <p className="text-xs text-purple-700 dark:text-purple-400 ml-6">
                Opcional: deixe desmarcado caso o campo condicional não precise revelar campos extras.
              </p>
            </div>

            {property.addConditionalFields ? (
              <ConditionalFieldsConfig
                fields={property.conditionalFields || []}
                onChange={(fields) => handleChange('conditionalFields', fields)}
              />
            ) : (
              <div className="mt-3 text-xs text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-dashed border-purple-200 dark:border-purple-700 rounded p-3">
                Nenhum campo condicional será exibido; o campo radio apenas registra se o usuário deseja fornecer detalhes.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
