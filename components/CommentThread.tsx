'use client';

import { CodeThread, Message, CodeSuggestion } from '@/lib/types';
import { useCodeReview } from './providers/CodeReviewProvider';
import { generateId, parseCodeSuggestions } from '@/lib/utils';
import { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { DiffView } from './DiffView';

interface CommentThreadProps {
  thread: CodeThread;
  onClose: () => void;
}

export function CommentThread({ thread, onClose }: CommentThreadProps) {
  const { state, dispatch } = useCodeReview();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoRespondedRef = useRef<string | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  // Parse code suggestions from assistant messages
  const messageSuggestions = useMemo(() => {
    const suggestions: Map<string, CodeSuggestion[]> = new Map();
    
    thread.messages.forEach((message) => {
      if (message.role === 'assistant' && message.content) {
        const parsed = parseCodeSuggestions(
          message.content,
          thread.selectedCode,
          state.currentSession?.language
        );
        if (parsed.length > 0) {
          suggestions.set(message.id, parsed);
        }
      }
    });
    
    return suggestions;
  }, [thread.messages, thread.selectedCode, state.currentSession?.language]);

  const handleApplySuggestion = (messageId: string, suggestion: CodeSuggestion) => {
    if (!state.currentSession) return;

    // Use thread line numbers to replace code accurately
    const lines = state.currentSession.code.split('\n');
    const suggestedLines = suggestion.suggestedCode.split('\n');
    
    // Replace lines from startLine to endLine (1-indexed, so subtract 1)
    const newLines = [...lines];
    const lineCount = thread.endLine - thread.startLine + 1;
    
    newLines.splice(
      thread.startLine - 1,
      lineCount,
      ...suggestedLines
    );
    
    const newCode = newLines.join('\n');
    
    dispatch({
      type: 'SET_CODE',
      payload: {
        code: newCode,
        language: state.currentSession.language,
        fileName: state.currentSession.fileName,
      },
    });
    
    // Dismiss this suggestion
    setDismissedSuggestions((prev) => new Set(prev).add(`${messageId}-${suggestion.suggestedCode.slice(0, 20)}`));
  };

  const handleDismissSuggestion = (messageId: string, suggestion: CodeSuggestion) => {
    setDismissedSuggestions((prev) => new Set(prev).add(`${messageId}-${suggestion.suggestedCode.slice(0, 20)}`));
  };

  // Reset auto-respond ref when thread changes
  useEffect(() => {
    if (hasAutoRespondedRef.current !== thread.id) {
      hasAutoRespondedRef.current = null;
    }
  }, [thread.id]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread.messages]);

  // Automatically trigger AI response when thread is created with initial message
  useEffect(() => {
    // Only auto-respond if:
    // 1. Thread has exactly one message (the initial user message)
    // 2. We haven't already auto-responded for this thread
    // 3. The message is from the user
    // 4. We're not already streaming
    // 5. We have a current session
    if (
      thread.messages.length === 1 &&
      thread.messages[0]?.role === 'user' &&
      hasAutoRespondedRef.current !== thread.id &&
      !isStreaming &&
      state.currentSession
    ) {
      hasAutoRespondedRef.current = thread.id;
      // Trigger AI response automatically
      const triggerAIResponse = async () => {
        const userMessage = thread.messages[0];
        if (!userMessage || !state.currentSession) return;

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
              userMessage: userMessage.content,
              conversationHistory: [],
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

      triggerAIResponse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id, thread.messages.length]);

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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-4 pb-6">
          {isStreaming && (
            <div className="flex items-center gap-2 text-secondary py-3 mb-2 px-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}
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
                              onApply={() => handleApplySuggestion(message.id, suggestion)}
                              onDismiss={() => handleDismissSuggestion(message.id, suggestion)}
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
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border flex-shrink-0">
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
