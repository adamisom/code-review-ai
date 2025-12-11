'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { CodeReviewState, CodeReviewAction, CodeReviewSession } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { saveSession } from '@/lib/storage';
import { useDebouncedCallback } from 'use-debounce';
import { DEFAULT_EDITOR_LANGUAGE, DEFAULT_EDITOR_THEME } from '@/lib/constants';
import {
  updateThread,
  updateMessage,
  addMessageToThread,
  removeMessageFromThread,
} from '@/lib/reducers/threadReducers';

// Initial state
const initialState: CodeReviewState = {
  currentSession: null,
  activeThreadId: null,
  selectedRange: null,
  editorLanguage: DEFAULT_EDITOR_LANGUAGE,
  editorTheme: DEFAULT_EDITOR_THEME,
  isLoadingAI: false,
  error: null,
};

// Reducer function
function codeReviewReducer(state: CodeReviewState, action: CodeReviewAction): CodeReviewState {
  switch (action.type) {
    case 'SET_CODE':
      const newSession: CodeReviewSession = {
        id: state.currentSession?.id || generateId(),
        code: action.payload.code,
        language: action.payload.language,
        fileName: action.payload.fileName,
        threads: state.currentSession?.threads || [],
        createdAt: state.currentSession?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        currentSession: newSession,
        editorLanguage: action.payload.language,
      };

    case 'SET_SELECTION':
      return {
        ...state,
        selectedRange: action.payload,
      };

    case 'CREATE_THREAD':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          threads: [...state.currentSession.threads, action.payload],
          updatedAt: new Date().toISOString(),
        },
        activeThreadId: action.payload.id,
        selectedRange: null,
      };

    case 'ADD_MESSAGE':
      return addMessageToThread(state, action.payload.threadId, action.payload.message);

    case 'UPDATE_MESSAGE':
      return updateMessage(state, action.payload.threadId, action.payload.messageId, (msg) => ({
        ...msg,
        content: action.payload.content,
      }));

    case 'DELETE_MESSAGE':
      return removeMessageFromThread(state, action.payload.threadId, action.payload.messageId);

    case 'SET_ACTIVE_THREAD':
      return {
        ...state,
        activeThreadId: action.payload,
      };

    case 'UPDATE_THREAD_STATUS':
      return updateThread(state, action.payload.threadId, (thread) => ({
        ...thread,
        status: action.payload.status,
      }));

    case 'DELETE_THREAD':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          threads: state.currentSession.threads.filter(t => t.id !== action.payload),
          updatedAt: new Date().toISOString(),
        },
        activeThreadId: state.activeThreadId === action.payload ? null : state.activeThreadId,
      };

    case 'LOAD_SESSION':
      return {
        ...state,
        currentSession: action.payload,
        editorLanguage: action.payload.language,
        activeThreadId: null,
        selectedRange: null,
      };

    case 'NEW_SESSION':
      return {
        ...initialState,
        editorTheme: state.editorTheme,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoadingAI: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoadingAI: false,
      };

    case 'SET_LANGUAGE':
      return {
        ...state,
        editorLanguage: action.payload,
        currentSession: state.currentSession ? {
          ...state.currentSession,
          language: action.payload,
          updatedAt: new Date().toISOString(),
        } : null,
      };

    case 'SET_THEME':
      return {
        ...state,
        editorTheme: action.payload,
      };

    case 'SET_FILE_NAME':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          fileName: action.payload,
          updatedAt: new Date().toISOString(),
        },
      };

    default:
      return state;
  }
}

// Context
const CodeReviewContext = createContext<{
  state: CodeReviewState;
  dispatch: React.Dispatch<CodeReviewAction>;
} | null>(null);

// Provider component
export function CodeReviewProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(codeReviewReducer, initialState);

  // Debounced auto-save to localStorage when session changes
  const debouncedSave = useDebouncedCallback((session: CodeReviewSession) => {
    if (session && session.code) {
      saveSession(session);
    }
  }, 1000);

  useEffect(() => {
    if (state.currentSession) {
      debouncedSave(state.currentSession);
    }
  }, [state.currentSession, debouncedSave]);

  return (
    <CodeReviewContext.Provider value={{ state, dispatch }}>
      {children}
    </CodeReviewContext.Provider>
  );
}

// Custom hook to use the context
export function useCodeReview() {
  const context = useContext(CodeReviewContext);
  if (!context) {
    throw new Error('useCodeReview must be used within CodeReviewProvider');
  }
  return context;
}
