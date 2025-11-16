import { ArrayItemProperty, PropertyType, WidgetType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Trash2, ChevronRight, Box, List } from 'lucide-react';
import { isArrayProperty, isObjectProperty } from './types';
import { PropertyFields } from './PropertyFields';

interface PropertyItemProps {
  property: ArrayItemProperty;
  propertyTypes: PropertyType[];
  widgetTypes: WidgetType[];
  onUpdate: (field: string, value: string | undefined) => void;
  onRemove: () => void;
  onNavigateInto: () => void;
}

export function PropertyItem({ 
  property, 
  propertyTypes,
  widgetTypes,
  onUpdate, 
  onRemove,
  onNavigateInto 
}: PropertyItemProps) {
  const getPropertyCount = () => {
    if (property.type === 'array' && isArrayProperty(property)) {
      return property.arrayItemProperties?.length || 0;
    }
    if (property.type === 'object' && isObjectProperty(property)) {
      return property.objectProperties?.length || 0;
    }
    return 0;
  };

  return (
    <div className="bg-card p-3 rounded border border-blue-200 dark:border-blue-700">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-foreground">Propriedade do Item</span>
          {(property.type === 'array' || property.type === 'object') && (
            <Button
              onClick={onNavigateInto}
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs"
            >
              {property.type === 'array' ? <List className="w-3 h-3" /> : <Box className="w-3 h-3" />}
              <ChevronRight className="w-3 h-3" />
              {getPropertyCount()} props
            </Button>
          )}
        </div>
        <Button
          variant="destructive"
          size="icon"
          onClick={onRemove}
          className="h-6 w-6"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <PropertyFields 
        property={property}
        propertyTypes={propertyTypes}
        widgetTypes={widgetTypes}
        onUpdate={onUpdate}
      />
    </div>
  );
}
