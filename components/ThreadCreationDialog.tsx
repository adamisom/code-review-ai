'use client';

import { useState } from 'react';

interface ThreadCreationDialogProps {
  selectedCode: string;
  lineRange: { start: number; end: number };
  onClose: () => void;
  onSubmit: (message: string) => void;
}

const suggestedPrompts = [
  'Can you review this code for potential issues?',
  'Is there a clearer way to write this?',
  'What are the security implications here?',
  'How can I optimize this code?',
  'Explain what this code does',
];

export function ThreadCreationDialog({
  selectedCode,
  lineRange,
  onClose,
  onSubmit,
}: ThreadCreationDialogProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setMessage(prompt);
    // Auto-submit when clicking a suggested prompt
    onSubmit(prompt.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--modal-bg)] border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Create Thread - Lines {lineRange.start}-{lineRange.end}
          </h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-foreground transition"
          >
            ✕
          </button>
        </div>

        <div className="p-4 border-b border-border overflow-y-auto">
          <div className="mb-3">
            <label className="text-sm font-medium text-secondary mb-1 block">
              Selected Code:
            </label>
            <pre className="bg-border/30 p-3 rounded text-xs overflow-x-auto">
              <code>{selectedCode}</code>
            </pre>
          </div>

          <div className="mb-3">
            <label className="text-sm font-medium text-secondary mb-1 block">
              Suggested Prompts:
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSuggestedPrompt(prompt);
                  }}
                  className="text-xs px-2 py-1 bg-border/50 rounded hover:bg-border transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-secondary mb-1 block">
              Your Question:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask a question about this code..."
              className="w-full px-3 py-2 bg-border border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
              autoFocus
            />
          </div>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded hover:bg-border/50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Thread
          </button>
        </div>
      </div>
    </div>
  );
}

