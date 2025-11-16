import { ArrayItemProperty, PropertyType, WidgetType } from '@/types';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';

interface PropertyFieldsProps {
  property: ArrayItemProperty;
  propertyTypes: PropertyType[];
  widgetTypes: WidgetType[];
  onUpdate: (field: string, value: string | PropertyType | undefined) => void;
}

export function PropertyFields({ property, propertyTypes, widgetTypes, onUpdate }: PropertyFieldsProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Nome *</Label>
          <Input
            type="text"
            value={property.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="Ex: src, alt"
            className="h-8 text-sm"
          />
        </div>

        <div>
          <Label className="text-xs">Tipo *</Label>
          <Select
            value={property.type}
            onChange={(e) => onUpdate('type', e.target.value as PropertyType)}
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
          value={property.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder="Ex: Image SRC"
          className="h-8 text-sm"
        />
      </div>

      <div>
        <Label className="text-xs">Descrição</Label>
        <Input
          type="text"
          value={property.description || ''}
          onChange={(e) => onUpdate('description', e.target.value)}
          placeholder="Descrição opcional"
          className="h-8 text-sm"
        />
      </div>

      {/* Campos específicos para Enum */}
      {property.type === 'enum' && (
        <>
          <div>
            <Label className="text-xs">Valores (separados por vírgula)</Label>
            <Input
              type="text"
              value={property.enumValues || ''}
              onChange={(e) => onUpdate('enumValues', e.target.value)}
              placeholder="Ex: red, blue, green"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Nomes (opcional)</Label>
            <Input
              type="text"
              value={property.enumNames || ''}
              onChange={(e) => onUpdate('enumNames', e.target.value)}
              placeholder="Ex: Vermelho, Azul, Verde"
              className="h-8 text-sm"
            />
          </div>
        </>
      )}

      {/* Campos específicos para String */}
      {property.type === 'string' && (
        <>
          <div>
            <Label className="text-xs">Widget</Label>
            <Select
              value={property.widget || ''}
              onChange={(e) => onUpdate('widget', e.target.value || undefined)}
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
              value={property.format || ''}
              onChange={(e) => onUpdate('format', e.target.value)}
              placeholder="Ex: date-time"
              className="h-8 text-sm"
            />
          </div>
        </>
      )}

      {/* Valor Padrão - não mostrar para array e object */}
      {property.type !== 'array' && property.type !== 'object' && (
        <div>
          <Label className="text-xs">Valor Padrão</Label>
          <Input
            type="text"
            value={property.defaultValue || ''}
            onChange={(e) => onUpdate('defaultValue', e.target.value)}
            placeholder="Valor padrão"
            className="h-8 text-sm"
          />
        </div>
      )}
    </div>
  );
}
