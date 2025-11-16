'use client'

import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  id: string;
  name: string;
  type: string;
}

interface BreadcrumbNavProps {
  path: BreadcrumbItem[];
  onNavigate: (index: number) => void;
}

export default function BreadcrumbNav({ path, onNavigate }: BreadcrumbNavProps) {
  if (path.length === 0) return null;

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-muted/50 border-b border-border overflow-x-auto">
      <button
        onClick={() => onNavigate(-1)}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Root</span>
      </button>

      {path.map((item, index) => (
        <div key={item.id} className="flex items-center gap-1 shrink-0">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          <button
            onClick={() => onNavigate(index)}
            className={cn(
              "px-2 py-1 text-xs font-medium rounded transition-colors",
              index === path.length - 1
                ? "text-foreground bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <span className="max-w-[100px] truncate inline-block">
              {item.name || 'sem-nome'}
            </span>
            <span className="ml-1 text-[10px] opacity-60">({item.type})</span>
          </button>
        </div>
      ))}
    </div>
  );
}
