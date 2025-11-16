'use client';

import { useState } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PropertyTree from '@/components/Form/PropertyTree';
import PropertyEditor from '@/components/Form/PropertyEditor';
import JsonPreview from '@/components/Form/JsonPreview';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Folder } from 'lucide-react';
import { generateVtexSchema } from '@/utils/schemaGenerator';
import { generateFullTypeScript } from '@/utils/typeGenerator';
import { componentFormSchema, type ComponentFormData } from '@/utils/validation';
import { PropertyProvider, usePropertyContext } from '@/contexts/PropertyContext';

function CreateSchemaContent() {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  
  const {
    properties,
    selectedPath,
    componentTitle,
    setComponentTitle,
    getPropertyByPath,
  } = usePropertyContext();

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
          <PropertyTree />
        </div>

        {/* Editor Section - Centro */}
        <div className="flex-1 overflow-y-auto bg-[hsl(var(--editor-bg))]">
          {selectedProperty ? (
            <PropertyEditor />
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

export default function CreateSchema() {
  return (
    <PropertyProvider>
      <CreateSchemaContent />
    </PropertyProvider>
  );
}
