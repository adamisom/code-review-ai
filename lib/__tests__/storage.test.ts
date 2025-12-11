import {
  saveSession,
  loadSessions,
  deleteSession,
  clearAllSessions,
} from '../storage';
import { CodeReviewSession } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveSession', () => {
    it('should save a session', () => {
      const session: CodeReviewSession = {
        id: 'test-id',
        code: 'test code',
        language: 'typescript',
        threads: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveSession(session);
      const sessions = loadSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('test-id');
    });

    it('should update existing session', () => {
      const session: CodeReviewSession = {
        id: 'test-id',
        code: 'test code',
        language: 'typescript',
        threads: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveSession(session);
      const updatedSession = { ...session, code: 'updated code' };
      saveSession(updatedSession);

      const sessions = loadSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].code).toBe('updated code');
    });
  });

  describe('loadSessions', () => {
    it('should return empty array when no sessions', () => {
      const sessions = loadSessions();
      expect(sessions).toEqual([]);
    });

    it('should load saved sessions', () => {
      const session: CodeReviewSession = {
        id: 'test-id',
        code: 'test code',
        language: 'typescript',
        threads: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveSession(session);
      const sessions = loadSessions();
      expect(sessions).toHaveLength(1);
    });
  });

  describe('deleteSession', () => {
    it('should delete a session', () => {
      const session: CodeReviewSession = {
        id: 'test-id',
        code: 'test code',
        language: 'typescript',
        threads: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveSession(session);
      deleteSession('test-id');
      const sessions = loadSessions();
      expect(sessions).toHaveLength(0);
    });
  });

  describe('clearAllSessions', () => {
    it('should clear all sessions', () => {
      const session: CodeReviewSession = {
        id: 'test-id',
        code: 'test code',
        language: 'typescript',
        threads: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveSession(session);
      clearAllSessions();
      const sessions = loadSessions();
      expect(sessions).toHaveLength(0);
    });
  });
});

