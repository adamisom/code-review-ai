import {
  updateThread,
  updateMessage,
  addMessageToThread,
  removeMessageFromThread,
} from '../../reducers/threadReducers';
import { CodeReviewState, CodeThread, Message } from '../../types';

const mockState: CodeReviewState = {
  currentSession: {
    id: 'session-1',
    code: 'const x = 1;',
    language: 'typescript',
    fileName: 'test.ts',
    threads: [
      {
        id: 'thread-1',
        startLine: 1,
        endLine: 1,
        startColumn: 1,
        endColumn: 10,
        selectedCode: 'const x = 1;',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Test',
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        color: 'blue',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  activeThreadId: null,
  selectedRange: null,
  editorLanguage: 'typescript',
  editorTheme: 'vs-dark',
  isLoadingAI: false,
  error: null,
};

describe('threadReducers', () => {
  describe('updateThread', () => {
    it('should update thread in session', () => {
      const result = updateThread(mockState, 'thread-1', (thread) => ({
        ...thread,
        status: 'resolved',
      }));

      expect(result.currentSession?.threads[0].status).toBe('resolved');
      expect(result.currentSession?.updatedAt).toBeTruthy();
    });

    it('should return state unchanged if no session', () => {
      const stateWithoutSession = { ...mockState, currentSession: null };
      const result = updateThread(stateWithoutSession, 'thread-1', (thread) => thread);
      expect(result).toBe(stateWithoutSession);
    });
  });

  describe('updateMessage', () => {
    it('should update message in thread', () => {
      const result = updateMessage(mockState, 'thread-1', 'msg-1', (msg) => ({
        ...msg,
        content: 'Updated',
      }));

      expect(result.currentSession?.threads[0].messages[0].content).toBe('Updated');
    });
  });

  describe('addMessageToThread', () => {
    it('should add message to thread', () => {
      const newMessage: Message = {
        id: 'msg-2',
        role: 'assistant',
        content: 'Response',
        timestamp: new Date().toISOString(),
      };

      const result = addMessageToThread(mockState, 'thread-1', newMessage);

      expect(result.currentSession?.threads[0].messages).toHaveLength(2);
      expect(result.currentSession?.threads[0].messages[1]).toEqual(newMessage);
    });
  });

  describe('removeMessageFromThread', () => {
    it('should remove message from thread', () => {
      const result = removeMessageFromThread(mockState, 'thread-1', 'msg-1');

      expect(result.currentSession?.threads[0].messages).toHaveLength(0);
    });
  });
});

