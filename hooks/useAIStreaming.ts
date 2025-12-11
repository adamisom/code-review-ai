import { useState, useRef } from 'react';
import { CodeThread, Message, ReviewRequest } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { streamAIResponse, StreamingCallbacks } from '@/lib/api/streaming';
import { useCodeReview } from '@/components/providers/CodeReviewProvider';

export function useAIStreaming() {
  const { state, dispatch } = useCodeReview();
  const [isStreaming, setIsStreaming] = useState(false);
  const hasAutoRespondedRef = useRef<string | null>(null);

  const sendMessage = async (
    thread: CodeThread,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    addUserMessage: boolean = true
  ): Promise<void> => {
    if (!state.currentSession) return;

    setIsStreaming(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    // Add user message if needed (for manual sends, not auto-responds)
    if (addUserMessage) {
      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { threadId: thread.id, message: userMsg },
      });
    }

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

    const request: ReviewRequest = {
      code: state.currentSession.code,
      language: state.currentSession.language,
      selectedCode: thread.selectedCode,
      lineRange: { start: thread.startLine, end: thread.endLine },
      userMessage,
      conversationHistory,
    };

    const callbacks: StreamingCallbacks = {
      onChunk: (content: string) => {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            threadId: thread.id,
            messageId: assistantMessage.id,
            content,
          },
        });
      },
      onError: (error: Error) => {
        console.error('Failed to get AI response:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error.message,
        });
        // Remove empty assistant message on error
        dispatch({
          type: 'DELETE_MESSAGE',
          payload: { threadId: thread.id, messageId: assistantMessage.id },
        });
      },
      onComplete: () => {
        setIsStreaming(false);
        dispatch({ type: 'SET_LOADING', payload: false });
      },
    };

    try {
      await streamAIResponse(request, callbacks);
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
      setIsStreaming(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const shouldAutoRespond = (thread: CodeThread): boolean => {
    return (
      thread.messages.length === 1 &&
      thread.messages[0]?.role === 'user' &&
      hasAutoRespondedRef.current !== thread.id &&
      !isStreaming &&
      !!state.currentSession
    );
  };

  const markAutoResponded = (threadId: string): void => {
    hasAutoRespondedRef.current = threadId;
  };

  const resetAutoResponded = (threadId: string): void => {
    if (hasAutoRespondedRef.current === threadId) {
      hasAutoRespondedRef.current = null;
    }
  };

  return {
    isStreaming,
    sendMessage,
    shouldAutoRespond,
    markAutoResponded,
    resetAutoResponded,
  };
}

