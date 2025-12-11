'use client';

import { CodeThread, Message, CodeSuggestion } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import { DiffView } from '../DiffView';

interface MessageListProps {
  thread: CodeThread;
  messageSuggestions: Map<string, CodeSuggestion[]>;
  dismissedSuggestions: Set<string>;
  onApplySuggestion: (messageId: string, suggestion: CodeSuggestion) => void;
  onDismissSuggestion: (messageId: string, suggestion: CodeSuggestion) => void;
}

export function MessageList({
  thread,
  messageSuggestions,
  dismissedSuggestions,
  onApplySuggestion,
  onDismissSuggestion,
}: MessageListProps) {
  return (
    <div className="p-4 space-y-4 pb-6">
      {thread.messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-border/50 text-foreground'
            }`}
          >
            {message.role === 'assistant' ? (
              <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                {message.content ? (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                  <div className="text-secondary italic">Waiting for response...</div>
                )}
                {/* Show code suggestions if available */}
                {messageSuggestions.has(message.id) && (
                  <div className="mt-3 space-y-3">
                    {messageSuggestions.get(message.id)!.map((suggestion, idx) => {
                      const suggestionKey = `${message.id}-${suggestion.suggestedCode.slice(0, 20)}`;
                      if (dismissedSuggestions.has(suggestionKey)) return null;

                      return (
                        <DiffView
                          key={idx}
                          suggestion={suggestion}
                          onApply={() => onApplySuggestion(message.id, suggestion)}
                          onDismiss={() => onDismissSuggestion(message.id, suggestion)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}
            <p className="text-xs opacity-60 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

