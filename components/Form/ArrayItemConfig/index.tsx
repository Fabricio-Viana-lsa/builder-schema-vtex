'use client'

import { PropertyType, WidgetType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import BreadcrumbNav from '../BreadcrumbNav';
import { ArrayItemConfigProps } from './types';
import { useArrayItemNavigation, usePropertyActions } from './hooks';
import { PropertyItem } from './PropertyItem';

const PROPERTY_TYPES: PropertyType[] = ['string', 'boolean', 'number', 'object', 'array', 'enum'];
const WIDGET_TYPES: WidgetType[] = ['image-uploader', 'datetime', 'textarea', 'color-picker', 'range'];

export default function ArrayItemConfig({ properties, onChange }: ArrayItemConfigProps) {
  const {
    navigationPath,
    getCurrentProperties,
    navigateInto,
    navigateToLevel,
    updateCurrentProperties
  } = useArrayItemNavigation(properties, onChange);

  const {
    addProperty,
    updateProperty,
    removeProperty
  } = usePropertyActions(getCurrentProperties, updateCurrentProperties);

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
            <PropertyItem
              key={prop.id}
              property={prop}
              propertyTypes={PROPERTY_TYPES}
              widgetTypes={WIDGET_TYPES}
              onUpdate={(field, value) => updateProperty(prop.id, field, value)}
              onRemove={() => removeProperty(prop.id)}
              onNavigateInto={() => navigateInto(prop)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
