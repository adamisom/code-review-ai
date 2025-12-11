'use client';

import { CodeSuggestion } from '@/lib/types';
import { computeDiff } from '@/lib/utils';

interface DiffViewProps {
  suggestion: CodeSuggestion;
  onApply: () => void;
  onDismiss: () => void;
}

export function DiffView({ suggestion, onApply, onDismiss }: DiffViewProps) {
  const diff = computeDiff(suggestion.originalCode, suggestion.suggestedCode);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {suggestion.description && (
        <div className="px-3 py-2 bg-border/30 border-b border-border text-sm text-secondary">
          {suggestion.description}
        </div>
      )}
      <div className="flex">
        {/* Original Code */}
        <div className="flex-1 border-r border-border">
          <div className="px-2 py-1 bg-danger/10 text-xs font-semibold text-danger border-b border-border">
            Original
          </div>
          <div className="p-2 font-mono text-xs overflow-x-auto max-h-64 overflow-y-auto">
            {diff.map((line, idx) => (
              <div
                key={idx}
                className={`${
                  line.type === 'delete'
                    ? 'bg-danger/20 text-danger'
                    : line.type === 'equal'
                    ? 'text-foreground/60'
                    : ''
                }`}
              >
                {line.type === 'delete' && <span className="text-danger">- </span>}
                {line.type === 'equal' && <span className="text-foreground/40">  </span>}
                <span className={line.type === 'delete' ? 'line-through' : ''}>
                  {line.text || ' '}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Code */}
        <div className="flex-1">
          <div className="px-2 py-1 bg-success/10 text-xs font-semibold text-success border-b border-border">
            Suggested
          </div>
          <div className="p-2 font-mono text-xs overflow-x-auto max-h-64 overflow-y-auto">
            {diff.map((line, idx) => (
              <div
                key={idx}
                className={`${
                  line.type === 'insert'
                    ? 'bg-success/20 text-success'
                    : line.type === 'equal'
                    ? 'text-foreground/60'
                    : ''
                }`}
              >
                {line.type === 'insert' && <span className="text-success">+ </span>}
                {line.type === 'equal' && <span className="text-foreground/40">  </span>}
                {(line.type === 'insert' || line.type === 'equal') && (
                  <span>{line.text || ' '}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3 py-2 bg-border/20 border-t border-border flex items-center justify-end gap-2">
        <button
          onClick={onDismiss}
          className="px-3 py-1 text-xs border border-border rounded hover:bg-border/50 transition"
        >
          Dismiss
        </button>
        <button
          onClick={onApply}
          className="px-3 py-1 text-xs bg-success text-white rounded hover:bg-success/90 transition"
        >
          Apply Changes (beta)
        </button>
      </div>
    </div>
  );
}

