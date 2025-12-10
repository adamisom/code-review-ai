'use client';

import { CodeThread, Message } from '@/lib/types';
import { useCodeReview } from './providers/CodeReviewProvider';
import { generateId } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface CommentThreadProps {
  thread: CodeThread;
  onClose: () => void;
}

export function CommentThread({ thread, onClose }: CommentThreadProps) {
  const { state, dispatch } = useCodeReview();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread.messages]);

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

    const messageInput = input.trim();
    setInput('');
    setIsStreaming(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    // Create assistant message with empty content
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { threadId: thread.id, message: assistantMessage },
    });

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: state.currentSession.code,
          language: state.currentSession.language,
          selectedCode: thread.selectedCode,
          lineRange: { start: thread.startLine, end: thread.endLine },
          userMessage: messageInput,
          conversationHistory: thread.messages
            .slice(0, -1) // Exclude the just-added user message
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            threadId: thread.id,
            messageId: assistantMessage.id,
            content: accumulatedContent,
          },
        });
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to get response',
      });
      // Remove empty assistant message on error
      dispatch({
        type: 'DELETE_MESSAGE',
        payload: { threadId: thread.id, messageId: assistantMessage.id },
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
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-secondary">Selected Code:</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(thread.selectedCode);
            }}
            className="text-xs px-2 py-1 bg-border rounded hover:bg-border/80 transition"
            title="Copy code"
          >
            Copy
          </button>
        </div>
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
              {message.role === 'assistant' ? (
                <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
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
        {isStreaming && (
          <div className="flex items-center gap-2 text-secondary">
            <div className="animate-pulse">AI is thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
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
