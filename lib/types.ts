// Core data models for the code review application

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    tokensUsed?: number;
    responseTime?: number;
  };
}

export interface CodeThread {
  id: string;
  startLine: number;        // 1-indexed
  endLine: number;          // 1-indexed (inclusive)
  startColumn: number;      // 1-indexed
  endColumn: number;        // 1-indexed
  selectedCode: string;     // The actual selected text
  messages: Message[];      // Conversation history
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
  status: 'active' | 'resolved';
  color: string;           // Thread color indicator (e.g., 'blue', 'purple')
}

export interface CodeReviewSession {
  id: string;
  code: string;            // Full code content
  language: string;        // Programming language
  fileName?: string;       // Optional file name
  threads: CodeThread[];   // All comment threads
  createdAt: string;
  updatedAt: string;
}

export interface SelectionRange {
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
}

// State management types
export interface CodeReviewState {
  // Current session
  currentSession: CodeReviewSession | null;
  
  // UI state
  activeThreadId: string | null;
  selectedRange: SelectionRange | null;
  
  // Editor state
  editorLanguage: string;
  editorTheme: 'vs-dark' | 'vs-light'; // CodeMirror uses same theme names for compatibility
  
  // Loading states
  isLoadingAI: boolean;
  error: string | null;
}

// Action types for reducer
export type CodeReviewAction =
  | { type: 'SET_CODE'; payload: { code: string; language: string; fileName?: string } }
  | { type: 'SET_SELECTION'; payload: SelectionRange | null }
  | { type: 'CREATE_THREAD'; payload: CodeThread }
  | { type: 'ADD_MESSAGE'; payload: { threadId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { threadId: string; messageId: string; content: string } }
  | { type: 'DELETE_MESSAGE'; payload: { threadId: string; messageId: string } }
  | { type: 'SET_ACTIVE_THREAD'; payload: string | null }
  | { type: 'UPDATE_THREAD_STATUS'; payload: { threadId: string; status: 'active' | 'resolved' } }
  | { type: 'DELETE_THREAD'; payload: string }
  | { type: 'LOAD_SESSION'; payload: CodeReviewSession }
  | { type: 'NEW_SESSION' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_THEME'; payload: 'vs-dark' | 'vs-light' };

// API request/response types
export interface ReviewRequest {
  code: string;
  language: string;
  selectedCode: string;
  lineRange: {
    start: number;
    end: number;
  };
  userMessage: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

// Thread colors
export const THREAD_COLORS = [
  'blue',
  'purple',
  'green',
  'orange',
  'pink',
  'cyan',
  'yellow',
  'red',
] as const;

export type ThreadColor = typeof THREAD_COLORS[number];
