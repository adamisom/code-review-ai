import { ReviewRequest } from '@/lib/types';

export interface StreamingCallbacks {
  onChunk: (content: string) => void;
  onError: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * Stream AI response from the review API
 * @param request The review request payload
 * @param callbacks Callbacks for handling chunks, errors, and completion
 * @returns Promise that resolves when streaming is complete
 */
export async function streamAIResponse(
  request: ReviewRequest,
  callbacks: StreamingCallbacks
): Promise<void> {
  try {
    const response = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let accumulatedContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedContent += chunk;
      callbacks.onChunk(accumulatedContent);
    }

    callbacks.onComplete?.();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get response';
    callbacks.onError(new Error(errorMessage));
    throw error;
  }
}

