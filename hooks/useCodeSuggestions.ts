import { useMemo } from 'react';
import { CodeThread, CodeSuggestion } from '@/lib/types';
import { parseCodeSuggestions } from '@/lib/utils';
import { useCodeReview } from '@/components/providers/CodeReviewProvider';

export function useCodeSuggestions(thread: CodeThread): Map<string, CodeSuggestion[]> {
  const { state } = useCodeReview();

  return useMemo(() => {
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
}

