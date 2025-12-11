'use client';

import { CodeThread, CodeSuggestion } from '@/lib/types';
import { useCodeReview } from '../providers/CodeReviewProvider';
import { useState, useEffect, useRef } from 'react';
import { useAIStreaming } from '@/hooks/useAIStreaming';
import { useCodeSuggestions } from '@/hooks/useCodeSuggestions';
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

  // Reset auto-respond ref when thread changes
  useEffect(() => {
    resetAutoResponded(thread.id);
  }, [thread.id, resetAutoResponded]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread.messages]);

  // Automatically trigger AI response when thread is created with initial message
  useEffect(() => {
    if (shouldAutoRespond(thread)) {
      markAutoResponded(thread.id);
      const userMessage = thread.messages[0];
      if (!userMessage || !state.currentSession) return;

      sendMessage(thread, userMessage.content, [], false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id, thread.messages.length]);

  const handleApplySuggestion = (messageId: string, suggestion: CodeSuggestion): void => {
    if (!state.currentSession) return;

    // Use thread line numbers to replace code accurately
    const lines = state.currentSession.code.split('\n');
    const suggestedLines = suggestion.suggestedCode.split('\n');

    // Replace lines from startLine to endLine (1-indexed, so subtract 1)
    const newLines = [...lines];
    const lineCount = thread.endLine - thread.startLine + 1;

    newLines.splice(thread.startLine - 1, lineCount, ...suggestedLines);

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

