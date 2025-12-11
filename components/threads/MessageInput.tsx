'use client';

interface MessageInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export function MessageInput({ input, onInputChange, onSend, disabled }: MessageInputProps) {
  return (
    <div className="p-4 border-t border-border flex-shrink-0">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Ask a question or provide context..."
          className="flex-1 px-3 py-2 bg-border border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={disabled}
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || disabled}
          className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}

