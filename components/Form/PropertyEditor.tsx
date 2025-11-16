'use client'

import { PropertyType, WidgetType } from '@/types';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Info, FileJson } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { usePropertyContext } from '@/contexts/PropertyContext';

export default function PropertyEditor() {
  const { selectedPath, getPropertyByPath, updatePropertyByPath } = usePropertyContext();
  
  if (!selectedPath) {
    return null;
  }
  
  const property = getPropertyByPath(selectedPath);
  
  if (!property) {
    return null;
  }
  
  const isRootLevel = selectedPath.length === 1;
  const propertyTypes: PropertyType[] = ['string', 'boolean', 'object', 'array', 'number', 'enum', 'conditional'];
  const widgetTypes: WidgetType[] = ['image-uploader', 'datetime', 'textarea', 'color-picker', 'range', 'radio'];

  const handleChange = (field: string, value: unknown) => {
    updatePropertyByPath(selectedPath, { ...property, [field]: value });
  };

  const isEnumType = property.type === 'enum';
  const isArrayType = property.type === 'array';
  const isObjectType = property.type === 'object';
  const isStringType = property.type === 'string';
  const isConditionalType = property.type === 'conditional';

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3 mb-2">
          <FileJson className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              {property.name || 'Nova Propriedade'}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {selectedPath.join(' > ')}
            </p>
          </div>
          <Badge variant={property.type as never}>{property.type}</Badge>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Nome da Propriedade */}
          <div>
            <Label>Nome da Propriedade *</Label>
            <Input
              type="text"
              value={property.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: title, images, active"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Nome usado no código (camelCase recomendado)
            </p>
          </div>

          {/* Tipo e Título */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Descrição */}
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={property.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição opcional que aparece no Site Editor"
              rows={2}
            />
          </div>

          {/* Campos específicos para String */}
          {isStringType && (
            <>
              <div>
                <Label>Widget (opcional)</Label>
                <Select
                  value={'widget' in property ? property.widget || '' : ''}
                  onChange={(e) =>
                    handleChange('widget', (e.target.value || undefined) as WidgetType)
                  }
                >
                  <option value="">Nenhum (input padrão)</option>
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
                  value={'format' in property ? property.format || '' : ''}
                  onChange={(e) => handleChange('format', e.target.value)}
                  placeholder="Ex: date-time, uri"
                />
              </div>
            </>
          )}

          {/* Valor Padrão - Não mostrar para Array e Object */}
          {!isArrayType && !isObjectType && (
            <div>
              <Label>Valor Padrão</Label>
              <Input
                type="text"
                value={property.defaultValue || ''}
                onChange={(e) => handleChange('defaultValue', e.target.value)}
                placeholder={
                  property.type === 'boolean'
                    ? 'true ou false'
                    : property.type === 'number'
                    ? '0'
                    : 'Valor padrão'
                }
              />
            </div>
          )}

          {/* Campos Enum */}
          {isEnumType && (
            <>
              <div>
                <Label>Enum (valores permitidos, separados por vírgula)</Label>
                <Input
                  type="text"
                  value={'enumValues' in property ? property.enumValues || '' : ''}
                  onChange={(e) => handleChange('enumValues', e.target.value)}
                  placeholder="Ex: red, blue, green"
                />
                <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  Use para criar dropdown com valores específicos
                </p>
              </div>

              <div>
                <Label>Enum Names (nomes amigáveis, separados por vírgula)</Label>
                <Input
                  type="text"
                  value={'enumNames' in property ? property.enumNames || '' : ''}
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
          {isArrayType && 'arrayItemTitle' in property && (
            <>
              <div className="border-t border-border pt-4">
                <Label>Título do Item do Array</Label>
                <Input
                  type="text"
                  value={property.arrayItemTitle || ''}
                  onChange={(e) => handleChange('arrayItemTitle', e.target.value)}
                  placeholder="Ex: Image"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nome que aparece para cada item no Site Editor
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={property.enableEditorItemTitle === 'true'}
                    onChange={(e) =>
                      handleChange('enableEditorItemTitle', e.target.checked ? 'true' : '')
                    }
                    className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                  />
                  Permitir editar nome do item no Site Editor
                </label>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  Adiciona o campo __editorItemTitle para personalizar o nome de cada item
                </p>
              </div>

              {property.enableEditorItemTitle && (
                <div className="ml-6 p-3 bg-muted border border-border rounded space-y-3">
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
                  <div>
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
            </>
          )}

          {/* Info para Array e Object */}
          {(isArrayType || isObjectType) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                    {isArrayType ? 'Array Aninhado' : 'Objeto Aninhado'}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Use o botão <strong>+ (Plus)</strong> na árvore de propriedades à esquerda
                    para adicionar itens dentro deste {isArrayType ? 'array' : 'objeto'}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Campos específicos para Conditional */}
          {isConditionalType && 'addConditionalFields' in property && (
            <>
              <div className="border-t border-border pt-4 bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                <p className="text-sm text-purple-900 dark:text-purple-300 mb-2">
                  <strong>Tipo Condicional:</strong> Cria um campo radio Não/Sim que mostra
                  campos adicionais quando &quot;Sim&quot; é selecionado.
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-400">
                  O schema será gerado automaticamente com enum [&apos;none&apos;,
                  &apos;provide&apos;] e widget radio.
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-purple-900 dark:text-purple-300">
                  <input
                    type="checkbox"
                    checked={property.addConditionalFields}
                    onChange={(e) => handleChange('addConditionalFields', e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-input rounded focus:ring-ring"
                  />
                  Exibir campos condicionais quando &quot;Sim&quot; for selecionado
                </label>
                <p className="text-xs text-purple-700 dark:text-purple-400 ml-6">
                  Use o botão <strong>+ (Plus)</strong> na árvore para adicionar campos
                  condicionais.
                </p>
              </div>
            </>
          )}

          {/* Campo Required apenas para propriedades raiz */}
          {isRootLevel && 'required' in property && (
            <div className="border-t border-border pt-4">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={property.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                  className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                />
                Campo obrigatório
              </label>
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                Define se este campo é obrigatório no formulário
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
