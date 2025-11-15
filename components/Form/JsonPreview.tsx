'use client'

import { Button } from '@/components/ui/Button';
import { Copy, Check, FileJson, FileCode } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

interface JsonPreviewProps {
  json: object;
  typescript: string;
  onCopy: () => void;
  onCopyTypescript: () => void;
}

type ViewMode = 'json' | 'typescript';

export default function JsonPreview({ json, typescript, onCopy, onCopyTypescript }: JsonPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('json');
  
  const jsonString = JSON.stringify(json, null, 2);

  const handleCopy = () => {
    if (viewMode === 'json') {
      onCopy();
    } else {
      onCopyTypescript();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--editor-bg))]">
      <div className="flex flex-col gap-2 p-2 sm:p-3 border-b border-[hsl(var(--editor-border))] bg-card">
        <div className="flex justify-between items-center">
          <h2 className="text-xs sm:text-sm font-semibold text-foreground">Preview</h2>
          <Button onClick={handleCopy} size="sm" variant={copied ? "success" : "default"}>
            {copied ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Copiado!</span>
                <span className="sm:hidden text-xs">OK</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Copiar</span>
                <span className="sm:hidden text-xs">Copy</span>
              </>
            )}
          </Button>
        </div>
        
        {/* Tabs para alternar entre JSON e TypeScript */}
        <div className="flex gap-1 bg-muted p-1 rounded-md">
          <button
            onClick={() => setViewMode('json')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded text-xs font-medium transition-colors",
              viewMode === 'json'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileJson className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Schema JSON</span>
            <span className="sm:inline md:hidden">JSON</span>
          </button>
          <button
            onClick={() => setViewMode('typescript')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded text-xs font-medium transition-colors",
              viewMode === 'typescript'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileCode className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">TypeScript</span>
            <span className="sm:inline md:hidden">TS</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-2 sm:p-4">
        <pre className="bg-background text-foreground p-2 sm:p-4 rounded-lg overflow-x-auto text-[10px] sm:text-xs font-mono leading-relaxed border border-border">
          {viewMode === 'json' ? jsonString : typescript}
        </pre>
      </div>
    </div>
  );
}
