'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { CodeReviewState, CodeReviewAction, CodeReviewSession } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { saveSession } from '@/lib/storage';
import { useDebouncedCallback } from 'use-debounce';

// Initial state
const initialState: CodeReviewState = {
  currentSession: null,
  activeThreadId: null,
  selectedRange: null,
  editorLanguage: 'typescript',
  editorTheme: 'vs-dark',
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
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          threads: state.currentSession.threads.map(thread =>
            thread.id === action.payload.threadId
              ? {
                  ...thread,
                  messages: [...thread.messages, action.payload.message],
                  updatedAt: new Date().toISOString(),
                }
              : thread
          ),
          updatedAt: new Date().toISOString(),
        },
      };

    case 'UPDATE_MESSAGE':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          threads: state.currentSession.threads.map(thread =>
            thread.id === action.payload.threadId
              ? {
                  ...thread,
                  messages: thread.messages.map(msg =>
                    msg.id === action.payload.messageId
                      ? { ...msg, content: action.payload.content }
                      : msg
                  ),
                }
              : thread
          ),
        },
      };

    case 'DELETE_MESSAGE':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          threads: state.currentSession.threads.map(thread =>
            thread.id === action.payload.threadId
              ? {
                  ...thread,
                  messages: thread.messages.filter(msg => msg.id !== action.payload.messageId),
                  updatedAt: new Date().toISOString(),
                }
              : thread
          ),
          updatedAt: new Date().toISOString(),
        },
      };

    case 'SET_ACTIVE_THREAD':
      return {
        ...state,
        activeThreadId: action.payload,
      };

    case 'UPDATE_THREAD_STATUS':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          threads: state.currentSession.threads.map(thread =>
            thread.id === action.payload.threadId
              ? { ...thread, status: action.payload.status }
              : thread
          ),
          updatedAt: new Date().toISOString(),
        },
      };

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
      };

    case 'SET_THEME':
      return {
        ...state,
        editorTheme: action.payload,
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
