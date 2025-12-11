import { CodeReviewState, CodeReviewAction, CodeThread, Message } from '@/lib/types';

/**
 * Helper to update a thread in the session
 */
export function updateThread(
  state: CodeReviewState,
  threadId: string,
  updater: (thread: CodeThread) => CodeThread
): CodeReviewState {
  if (!state.currentSession) return state;

  return {
    ...state,
    currentSession: {
      ...state.currentSession,
      threads: state.currentSession.threads.map((thread) =>
        thread.id === threadId ? updater(thread) : thread
      ),
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Helper to update a message within a thread
 */
export function updateMessage(
  state: CodeReviewState,
  threadId: string,
  messageId: string,
  updater: (message: Message) => Message
): CodeReviewState {
  return updateThread(state, threadId, (thread) => ({
    ...thread,
    messages: thread.messages.map((msg) => (msg.id === messageId ? updater(msg) : msg)),
  }));
}

/**
 * Helper to add a message to a thread
 */
export function addMessageToThread(
  state: CodeReviewState,
  threadId: string,
  message: Message
): CodeReviewState {
  return updateThread(state, threadId, (thread) => ({
    ...thread,
    messages: [...thread.messages, message],
    updatedAt: new Date().toISOString(),
  }));
}

/**
 * Helper to remove a message from a thread
 */
export function removeMessageFromThread(
  state: CodeReviewState,
  threadId: string,
  messageId: string
): CodeReviewState {
  return updateThread(state, threadId, (thread) => ({
    ...thread,
    messages: thread.messages.filter((msg) => msg.id !== messageId),
    updatedAt: new Date().toISOString(),
  }));
}

