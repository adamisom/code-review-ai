'use client';

import { CodeThread, Message } from '@/lib/types';
import { useCodeReview } from './providers/CodeReviewProvider';
import { generateId } from '@/lib/utils';
import { useState } from 'react';

interface CommentThreadProps {
  thread: CodeThread;
  onClose: () => void;
}

export function CommentThread({ thread, onClose }: CommentThreadProps) {
  const { state, dispatch } = useCodeReview();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || !state.currentSession) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { threadId: thread.id, message: userMessage },
    });

    setInput('');
    setIsStreaming(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // TODO: Implement API call with streaming
      // const response = await fetch('/api/review', { ... });
      // const reader = response.body?.getReader();
      // Stream the response and update message content

      // For now, just a placeholder
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'AI response will appear here...',
        timestamp: new Date().toISOString(),
      };

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { threadId: thread.id, message: assistantMessage },
      });
    } catch (error) {
      console.error('Failed to get AI response:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to get response',
      });
    } finally {
      setIsStreaming(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className={`font-semibold text-thread-${thread.color}`}>
            Lines {thread.startLine}-{thread.endLine}
          </h3>
          <p className="text-xs text-secondary mt-1">
            {thread.messages.length} messages
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-secondary hover:text-foreground transition"
        >
          ✕
        </button>
      </div>

      {/* Code Snippet */}
      <div className="p-4 border-b border-border bg-border/20">
        <pre className="text-xs overflow-x-auto">
          <code>{thread.selectedCode}</code>
        </pre>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {thread.messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-border/50 text-foreground'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="flex items-center gap-2 text-secondary">
            <div className="animate-pulse">AI is thinking...</div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask a question or provide context..."
            className="flex-1 px-3 py-2 bg-border border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isStreaming}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
