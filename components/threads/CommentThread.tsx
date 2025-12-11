'use client';

import { CodeThread, CodeSuggestion } from '@/lib/types';
import { useCodeReview } from '../providers/CodeReviewProvider';
import { useState, useEffect, useRef } from 'react';
import { useAIStreaming } from '@/hooks/useAIStreaming';
import { useCodeSuggestions } from '@/hooks/useCodeSuggestions';
import { extractSelection } from '@/lib/utils';
import { CommentThreadHeader } from './CommentThreadHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { StreamingIndicator } from './StreamingIndicator';

interface CommentThreadProps {
  thread: CodeThread;
  onClose: () => void;
}

export function CommentThread({ thread, onClose }: CommentThreadProps) {
  const { state, dispatch } = useCodeReview();
  const [input, setInput] = useState('');
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isStreaming, sendMessage, shouldAutoRespond, markAutoResponded, resetAutoResponded } =
    useAIStreaming();
  const messageSuggestions = useCodeSuggestions(thread);
  const hasAutoRespondedRef = useRef<string | null>(null);

  // Reset auto-respond ref when thread changes
  useEffect(() => {
    if (hasAutoRespondedRef.current !== thread.id) {
      resetAutoResponded(thread.id);
      hasAutoRespondedRef.current = null;
    }
  }, [thread.id, resetAutoResponded]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread.messages]);

  // Automatically trigger AI response when thread is created with initial message
  useEffect(() => {
    // Only auto-respond if:
    // 1. Thread has exactly 1 message (the initial user message)
    // 2. That message is from the user
    // 3. We haven't already auto-responded for this thread
    // 4. We're not currently streaming
    // 5. There's no assistant message yet (double-check)
    const hasAssistantMessage = thread.messages.some((m) => m.role === 'assistant');
    if (
      thread.messages.length === 1 &&
      thread.messages[0]?.role === 'user' &&
      hasAutoRespondedRef.current !== thread.id &&
      !isStreaming &&
      !hasAssistantMessage &&
      state.currentSession
    ) {
      hasAutoRespondedRef.current = thread.id;
      markAutoResponded(thread.id);
      const userMessage = thread.messages[0];

      sendMessage(thread, userMessage.content, [], false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id, thread.messages.length, isStreaming]);

  const handleApplySuggestion = (messageId: string, suggestion: CodeSuggestion): void => {
    if (!state.currentSession) return;

    const lines = state.currentSession.code.split('\n');
    const suggestedLines = suggestion.suggestedCode.split('\n');

    // Validate: Check that current code at thread's line range matches the original code
    // This prevents applying changes to code that has been modified since the thread was created
    const currentCodeAtRange = extractSelection(
      state.currentSession.code,
      thread.startLine,
      thread.startColumn,
      thread.endLine,
      thread.endColumn
    );

    // Normalize whitespace for comparison (trim trailing newlines, normalize line endings)
    const normalizeCode = (code: string) => code.trimEnd().replace(/\r\n/g, '\n');
    const normalizedCurrent = normalizeCode(currentCodeAtRange);
    const normalizedOriginal = normalizeCode(suggestion.originalCode);

    // If the current code doesn't match the original, warn the user
    if (normalizedCurrent !== normalizedOriginal) {
      const shouldProceed = confirm(
        `Warning: The code at lines ${thread.startLine}-${thread.endLine} has changed since this suggestion was made.\n\n` +
        `Original code:\n${suggestion.originalCode.slice(0, 100)}${suggestion.originalCode.length > 100 ? '...' : ''}\n\n` +
        `Current code:\n${currentCodeAtRange.slice(0, 100)}${currentCodeAtRange.length > 100 ? '...' : ''}\n\n` +
        `Apply changes anyway? This will replace the current code at these lines.`
      );
      
      if (!shouldProceed) {
        return;
      }
    }

    // Replace lines from startLine to endLine (1-indexed, so subtract 1)
    const newLines = [...lines];
    const lineCount = thread.endLine - thread.startLine + 1;

    // Ensure we don't go out of bounds
    const startIdx = Math.max(0, thread.startLine - 1);
    const endIdx = Math.min(lines.length, thread.startLine - 1 + lineCount);
    const actualLineCount = endIdx - startIdx;

    // Replace only the exact line range
    newLines.splice(startIdx, actualLineCount, ...suggestedLines);

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
    setDismissedSuggestions(
      (prev) => new Set(prev).add(`${messageId}-${suggestion.suggestedCode.slice(0, 20)}`)
    );
  };

  const handleDismissSuggestion = (messageId: string, suggestion: CodeSuggestion): void => {
    setDismissedSuggestions(
      (prev) => new Set(prev).add(`${messageId}-${suggestion.suggestedCode.slice(0, 20)}`)
    );
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!input.trim() || !state.currentSession) return;

    const messageInput = input.trim();
    setInput('');

    const conversationHistory = thread.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await sendMessage(thread, messageInput, conversationHistory, true);
  };

  return (
    <div className="flex flex-col h-full bg-background border-t border-border">
      <CommentThreadHeader thread={thread} onClose={onClose} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <StreamingIndicator isVisible={isStreaming} />
        <MessageList
          thread={thread}
          messageSuggestions={messageSuggestions}
          dismissedSuggestions={dismissedSuggestions}
          onApplySuggestion={handleApplySuggestion}
          onDismissSuggestion={handleDismissSuggestion}
        />
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <MessageInput
        input={input}
        onInputChange={setInput}
        onSend={handleSendMessage}
        disabled={isStreaming}
      />
    </div>
  );
}

