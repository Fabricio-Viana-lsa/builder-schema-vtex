'use client';

import { useState } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PropertyField from '@/components/Form/PropertyField';
import PropertyList from '@/components/Form/PropertyList';
import JsonPreview from '@/components/Form/JsonPreview';
import { PropertyForm } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { X, Folder, Plus } from 'lucide-react';
import { generateVtexSchema } from '@/utils/schemaGenerator';
import { generateFullTypeScript } from '@/utils/typeGenerator';
import { componentFormSchema, type ComponentFormData } from '@/utils/validation';

const CreateSchema = () => {
  const [properties, setProperties] = useState<PropertyForm[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  // Usar react-hook-form com Zod para validação
  const { 
    register, 
    watch, 
    formState: { errors } 
  } = useForm<ComponentFormData>({
    resolver: zodResolver(componentFormSchema),
    defaultValues: {
      componentTitle: 'Custom Component',
    },
  });

  const componentTitle = watch('componentTitle');

  const addProperty = () => {
    const newProperty: PropertyForm = {
      id: Date.now().toString(),
      name: '',
      type: 'string',
      title: '',
      description: '',
      defaultValue: '',
      required: false,
      addConditionalFields: false,
    };
    setProperties([...properties, newProperty]);
    setSelectedPropertyId(newProperty.id);
  };

  const updateProperty = (id: string, updatedProperty: PropertyForm) => {
    setProperties(properties.map((prop) => (prop.id === id ? updatedProperty : prop)));
  };

  const removeProperty = (id: string) => {
    setProperties(properties.filter((prop) => prop.id !== id));
    if (selectedPropertyId === id) {
      setSelectedPropertyId(null);
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

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  return (
    <div className="min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {/* Property List - Sidebar */}
      <div className="w-full lg:w-72 shrink-0 max-h-48 lg:max-h-none overflow-y-auto lg:overflow-visible border-b lg:border-b-0 lg:border-r border-[hsl(var(--sidebar-border))]">
        <PropertyList
          properties={properties}
          selectedPropertyId={selectedPropertyId}
          onSelectProperty={setSelectedPropertyId}
          onAddProperty={addProperty}
          onRemoveProperty={removeProperty}
        />
      </div>

      {/* Editor Section */}
      <div className="flex-1 overflow-y-auto bg-[hsl(var(--editor-bg))]">
        <div className="p-3 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Construtor de Schema VTEX
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Crie schemas JSON para componentes customizados da VTEX
            </p>
          </div>

          <div className="mb-4 sm:mb-6 bg-card p-3 sm:p-4 rounded-lg border border-border shadow-sm">
            <Label>Título do Componente *</Label>
            <Input
              type="text"
              {...register('componentTitle')}
              placeholder="Ex: Custom Component"
            />
            {errors.componentTitle && (
              <p className="text-destructive text-sm mt-1">{errors.componentTitle.message}</p>
            )}
          </div>

          {selectedProperty ? (
            <div>
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Editando Propriedade</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPropertyId(null)}
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Fechar</span>
                </Button>
              </div>
              <PropertyField
                key={selectedProperty.id}
                property={selectedProperty}
                onChange={(updated) => updateProperty(selectedProperty.id, updated)}
                onRemove={() => removeProperty(selectedProperty.id)}
              />
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 bg-card rounded-lg border-2 border-dashed border-border">
              <Folder className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
                Selecione uma propriedade
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Escolha uma propriedade da lista para editar
              </p>
              {properties.length === 0 && (
                <Button onClick={addProperty} size="lg" variant="success">
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Criar primeira propriedade</span>
                  <span className="sm:hidden">Criar propriedade</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="w-full lg:w-96 shrink-0 relative h-96 lg:h-auto">
        <JsonPreview 
          json={generateVtexSchema(properties, componentTitle)} 
          typescript={generateFullTypeScript(properties, `${componentTitle.replace(/\s+/g, '')}Props`)}
          onCopy={handleCopyJson}
          onCopyTypescript={handleCopyTypescript}
        />
        
        {showCopiedMessage && (
          <div className="absolute top-4 sm:top-20 right-2 sm:right-6 bg-green-600 dark:bg-green-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-lg animate-fade-in text-xs sm:text-sm">
            ✓ Copiado!
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateSchema
