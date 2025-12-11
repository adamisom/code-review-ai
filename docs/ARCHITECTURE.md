# Linewise Architecture

## Overview
Linewise is a Next.js 14 application that provides AI-powered code review through inline comment threads. Users paste code, select sections, and receive contextual AI feedback via streaming responses.

## Architecture Layers

### 1. Presentation Layer (`app/`, `components/`)
- **app/page.tsx**: Main layout with resizable panel, error display
- **app/layout.tsx**: Root layout with metadata
- **components/Header.tsx**: Top navigation (session management, theme toggle, export)
- **components/CodeEditor.tsx**: CodeMirror editor with selection tracking and thread decorations
- **components/ThreadPanel.tsx**: Sidebar showing thread list or active conversation
- **components/threads/**: Thread conversation UI (CommentThread, MessageList, MessageInput, etc.)

### 2. State Management (`components/providers/`, `lib/reducers/`)
- **CodeReviewProvider**: React Context + useReducer for global state
- **codeReviewReducer**: Handles 15 action types (SET_CODE, CREATE_THREAD, ADD_MESSAGE, etc.)
- **threadReducers.ts**: Helper functions for thread/message updates (DRY pattern)

### 3. Business Logic (`lib/`, `hooks/`)
- **lib/utils.ts**: Core utilities (language detection, code extraction, diff computation)
- **lib/storage.ts**: localStorage persistence for sessions
- **lib/api/streaming.ts**: Streaming API client with callbacks
- **hooks/useAIStreaming.ts**: Manages AI streaming state and auto-respond logic
- **hooks/useCodeSuggestions.ts**: Parses code suggestions from AI responses

### 4. Editor Integration (`lib/codemirror/`)
- **threadDecorations.ts**: CodeMirror extensions for thread highlights and gutter icons
- Uses StateField, StateEffect, ViewPlugin for reactive decorations

### 5. API Layer (`app/api/`)
- **review/route.ts**: Edge runtime endpoint that streams Claude responses
- Constructs context-aware prompts with full file + selected code

## Data Flow

1. **User Input**: Code pasted → `handleEditorChange` → `SET_CODE` action
2. **Selection**: User selects code → `handleSelectionChange` → `SET_SELECTION` action
3. **Thread Creation**: Cmd+K or "Analyze Code" → `ThreadCreationDialog` → `CREATE_THREAD` action
4. **AI Request**: `useAIStreaming.sendMessage` → `streamAIResponse` → `/api/review` → Claude API
5. **Streaming**: Chunks arrive → `onChunk` callback → `UPDATE_MESSAGE` action → UI updates
6. **Persistence**: State changes → debounced save → `saveSession` → localStorage

## Key Patterns

- **Context + Reducer**: Centralized state with type-safe actions
- **Custom Hooks**: Encapsulate complex logic (streaming, suggestions)
- **CodeMirror Extensions**: Reactive decorations via StateField/StateEffect
- **Streaming**: ReadableStream with TextDecoder for incremental updates
- **Auto-save**: Debounced localStorage writes (1s delay)

## Dependencies

- **Next.js 14**: App Router, Edge Runtime
- **CodeMirror 6**: Editor with extensions
- **Anthropic SDK**: Claude 3.5 Sonnet streaming
- **React Context**: State management
- **localStorage**: Session persistence

