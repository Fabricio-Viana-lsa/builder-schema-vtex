'use client'

import { PropertyForm } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Trash2, ChevronRight, ChevronDown, FileJson, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useState } from 'react';

interface PropertyListProps {
  properties: PropertyForm[];
  selectedPropertyId: string | null;
  onSelectProperty: (id: string) => void;
  onAddProperty: () => void;
  onRemoveProperty: (id: string) => void;
}

export default function PropertyList({
  properties,
  selectedPropertyId,
  onSelectProperty,
  onAddProperty,
  onRemoveProperty,
}: PropertyListProps) {
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedProperties(newExpanded);
  };

  const hasChildren = (property: PropertyForm) => {
    return (
      (property.type === 'array' && property.arrayItemProperties && property.arrayItemProperties.length > 0) ||
      (property.type === 'conditional' && property.conditionalFields && property.conditionalFields.length > 0)
    );
  };

  const isExpanded = (id: string) => expandedProperties.has(id);

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))]">
      <div className="p-3 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Properties
          </span>
        </div>
        <Button onClick={onAddProperty} className="w-full text-sm" size="sm" variant="success">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nova Propriedade</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {properties.length === 0 ? (
          <div className="p-6 text-center">
            <Folder className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-2">Nenhuma propriedade</p>
            <p className="text-xs text-muted-foreground/70">
              Clique no botão acima para adicionar
            </p>
          </div>
        ) : (
          <div className="py-1">
            {properties.map((property) => {
              const expanded = isExpanded(property.id);
              const children = hasChildren(property);
              
              return (
                <div key={property.id}>
                  {/* Item Principal */}
                  <div
                    className={cn(
                      "group flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-[hsl(var(--sidebar-hover))] transition-colors",
                      selectedPropertyId === property.id && "bg-[hsl(var(--sidebar-active))]"
                    )}
                    onClick={() => onSelectProperty(property.id)}
                  >
                    {/* Expand/Collapse Icon */}
                    {children ? (
                      <button
                        onClick={(e) => toggleExpand(property.id, e)}
                        className="shrink-0 w-4 h-4 flex items-center justify-center hover:bg-[hsl(var(--sidebar-hover))] rounded"
                      >
                        {expanded ? (
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    ) : (
                      <div className="w-4" />
                    )}

                    {/* File/Folder Icon */}
                    {children ? (
                      expanded ? (
                        <FolderOpen className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <Folder className="w-4 h-4 text-primary shrink-0" />
                      )
                    ) : (
                      <FileJson className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}

                    {/* Property Name */}
                    <span className={cn(
                      "text-sm flex-1 truncate",
                      property.name ? "text-foreground" : "text-muted-foreground italic"
                    )}>
                      {property.name || 'sem-nome'}
                    </span>

                    {/* Type Badge */}
                    <Badge 
                      variant={property.type as never}
                      className="scale-75 shrink-0"
                    >
                      {property.type}
                    </Badge>

                    {/* Delete Button */}
                    <button
                      className="opacity-0 group-hover:opacity-100 shrink-0 w-5 h-5 flex items-center justify-center bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveProperty(property.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>

                  {/* Children (Array Items ou Conditional Fields) */}
                  {expanded && children && (
                    <div className="ml-4 border-l border-border">
                      {/* Array Items */}
                      {property.type === 'array' && property.arrayItemProperties?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-1 px-2 py-1 hover:bg-[hsl(var(--sidebar-hover))]"
                        >
                          <div className="w-4" />
                          <FileJson className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 shrink-0" />
                          <span className={cn(
                            "text-xs flex-1 truncate",
                            item.name ? "text-foreground" : "text-muted-foreground italic"
                          )}>
                            {item.name || 'sem-nome'}
                          </span>
                          <Badge 
                            variant={item.type as never}
                            className="scale-[0.65] shrink-0"
                          >
                            {item.type}
                          </Badge>
                        </div>
                      ))}

                      {/* Conditional Fields */}
                      {property.type === 'conditional' && property.conditionalFields?.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-1 px-2 py-1 hover:bg-[hsl(var(--sidebar-hover))]"
                        >
                          <div className="w-4" />
                          <FileJson className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400 shrink-0" />
                          <span className={cn(
                            "text-xs flex-1 truncate",
                            field.name ? "text-foreground" : "text-muted-foreground italic"
                          )}>
                            {field.name || 'sem-nome'}
                          </span>
                          <Badge 
                            variant={field.type as never}
                            className="scale-[0.65] shrink-0"
                          >
                            {field.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-[hsl(var(--sidebar-border))] bg-muted/50">
        <div className="text-xs text-muted-foreground text-center">
          {properties.length} {properties.length === 1 ? 'propriedade' : 'propriedades'}
        </div>
      </div>
    </div>
  );
}
