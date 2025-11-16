'use client'

import { PropertyForm, ArrayItemProperty } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  FileJson, 
  Folder, 
  FolderOpen
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useState } from 'react';

// Tipo para representar um item na árvore
export type TreeItem = {
  id: string;
  name: string;
  type: PropertyForm['type'] | 'root';
  title: string;
  path: string[]; // Caminho completo até este item
  hasChildren: boolean;
  isExpanded: boolean;
  depth: number;
  property: PropertyForm | ArrayItemProperty;
};

interface PropertyTreeProps {
  properties: PropertyForm[];
  selectedPath: string[] | null;
  onSelectPath: (path: string[]) => void;
  onAddProperty: (parentPath: string[] | null) => void;
  onRemoveProperty: (path: string[]) => void;
}

export default function PropertyTree({
  properties,
  selectedPath,
  onSelectPath,
  onAddProperty,
  onRemoveProperty,
}: PropertyTreeProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const toggleExpand = (pathKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(pathKey)) {
      newExpanded.delete(pathKey);
    } else {
      newExpanded.add(pathKey);
    }
    setExpandedPaths(newExpanded);
  };

  const getPathKey = (path: string[]) => path.join('.');

  const isExpanded = (path: string[]) => expandedPaths.has(getPathKey(path));

  const hasChildren = (item: PropertyForm | ArrayItemProperty): boolean => {
    if (item.type === 'array' && 'arrayItemProperties' in item) {
      return !!(item.arrayItemProperties && item.arrayItemProperties.length > 0);
    }
    if (item.type === 'object' && 'objectProperties' in item) {
      return !!(item.objectProperties && item.objectProperties.length > 0);
    }
    if (item.type === 'conditional' && 'conditionalFields' in item) {
      return !!(item.conditionalFields && item.conditionalFields.length > 0);
    }
    return false;
  };

  const getChildren = (item: PropertyForm | ArrayItemProperty): ArrayItemProperty[] => {
    if (item.type === 'array' && 'arrayItemProperties' in item) {
      return item.arrayItemProperties || [];
    }
    if (item.type === 'object' && 'objectProperties' in item) {
      return item.objectProperties || [];
    }
    if (item.type === 'conditional' && 'conditionalFields' in item) {
      return item.conditionalFields || [];
    }
    return [];
  };

  const renderTreeItem = (
    item: PropertyForm | ArrayItemProperty,
    path: string[],
    depth: number
  ) => {
    const pathKey = getPathKey(path);
    const expanded = isExpanded(path);
    const children = hasChildren(item);
    const isSelected = selectedPath && getPathKey(selectedPath) === pathKey;
    const indentWidth = depth * 16;

    return (
      <div key={pathKey}>
        {/* Item Principal */}
        <div
          className={cn(
            "group flex items-center gap-1.5 py-1.5 pr-2 cursor-pointer hover:bg-[hsl(var(--sidebar-hover))] transition-colors border-l-2",
            isSelected 
              ? "bg-[hsl(var(--sidebar-active))] border-l-primary" 
              : "border-l-transparent"
          )}
          style={{ paddingLeft: `${indentWidth + 8}px` }}
          onClick={() => onSelectPath(path)}
        >
          {/* Expand/Collapse Icon */}
          {children ? (
            <button
              onClick={(e) => toggleExpand(pathKey, e)}
              className="shrink-0 w-4 h-4 flex items-center justify-center hover:bg-[hsl(var(--sidebar-hover))] rounded"
            >
              {expanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* File/Folder Icon */}
          {children ? (
            expanded ? (
              <FolderOpen className="w-4 h-4 text-yellow-500 dark:text-yellow-400 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-500 dark:text-yellow-400 shrink-0" />
            )
          ) : (
            <FileJson className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
          )}

          {/* Property Name */}
          <span
            className={cn(
              "text-sm flex-1 truncate font-mono",
              item.name ? "text-foreground" : "text-muted-foreground italic"
            )}
          >
            {item.name || 'sem-nome'}
          </span>

          {/* Type Badge */}
          <Badge variant={item.type as never} className="scale-75 shrink-0">
            {item.type}
          </Badge>

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
            {/* Add Child Button */}
            {(item.type === 'array' || item.type === 'object') && (
              <button
                className="w-6 h-6 flex items-center justify-center bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddProperty(path);
                }}
                title="Adicionar propriedade"
              >
                <Plus className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              </button>
            )}

            {/* Delete Button */}
            <button
              className="w-6 h-6 flex items-center justify-center bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveProperty(path);
              }}
              title="Remover"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        {/* Children */}
        {expanded && children && (
          <div>
            {getChildren(item).map((child, index) => {
              const childPath = [...path, index.toString()];
              return renderTreeItem(child, childPath, depth + 1);
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))]">
      {/* Header */}
      <div className="p-3 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Propriedades
          </span>
          <Badge variant="default" className="text-xs">
            {properties.length}
          </Badge>
        </div>
        <Button
          onClick={() => onAddProperty(null)}
          className="w-full text-sm"
          size="sm"
          variant="success"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Propriedade
        </Button>
      </div>

      {/* Tree View */}
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
            {properties.map((property, index) => {
              const path = [index.toString()];
              return renderTreeItem(property, path, 0);
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-[hsl(var(--sidebar-border))] bg-muted/50">
        <div className="text-xs text-muted-foreground text-center">
          {properties.length} {properties.length === 1 ? 'propriedade' : 'propriedades'}
        </div>
      </div>
    </div>
  );
}
