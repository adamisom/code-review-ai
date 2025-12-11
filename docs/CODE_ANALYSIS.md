# Code Analysis Report

Complete function inventory with purpose and call sites.

## app/

### app/layout.tsx
- **RootLayout({ children })**: Root layout component. Called by Next.js framework.
- **inter**: Inter font configuration. Used in RootLayout.

### app/page.tsx
- **ErrorDisplay()**: Displays error banner from state. Called in Home component.
- **Home()**: Main page component with resizable panel. Entry point, called by Next.js.
  - Uses: useState, useEffect for panel resizing and localStorage persistence
  - Calls: CodeReviewProvider, Header, ErrorDisplay, CodeEditor, ThreadPanel

### app/api/review/route.ts
- **POST(req)**: Edge runtime API handler for AI review requests. Called by fetch in `streamAIResponse`.
  - Validates API key, constructs system prompt, streams Claude response
  - Returns: ReadableStream with text chunks

## components/

### components/CodeEditor.tsx
- **getLanguageExtension(language)**: Maps language string to CodeMirror extension. Called in `languageExtension` useMemo.
- **CodeEditor()**: Main editor component with selection tracking. Called in app/page.tsx.
  - **handleEditorChange(value)**: Updates code in state, auto-detects language. Called by CodeMirror onChange.
  - **handleSelectionChange(update)**: Tracks selection, auto-scrolls, dispatches SET_SELECTION. Called by CodeMirror onUpdate.
  - **handleCreateThread(message)**: Creates thread from selection. Called by ThreadCreationDialog onSubmit.
  - **handleCloseThreadDialog()**: Closes dialog, clears selection. Called by ThreadCreationDialog onClose.
  - Uses: useCodeReview, generateId, getNextThreadColor, extractSelection, detectLanguage, createThreadDecorationsExtension, setThreadDecorations

### components/Header.tsx
- **Header()**: Top navigation bar. Called in app/page.tsx.
  - **handleNewSession()**: Creates new session with confirmation. Called by "New Session" button.
  - **handleLoadSession(session)**: Loads saved session. Called by SessionManager onLoadSession.
  - **handleThemeToggle()**: Toggles dark/light theme. Called by theme button.
  - **handleExport()**: Exports session as markdown. Called by "Export" button.
  - **handleNameClick()**: Enters edit mode for session name. Called by name span onClick.
  - **handleNameBlur()**: Exits edit mode. Called by name input onBlur.
  - **handleNameChange(e)**: Updates session name. Called by name input onChange.
  - **handleNameKeyDown(e)**: Handles Enter/Escape in name input. Called by name input onKeyDown.
  - Uses: useCodeReview, SessionManager, THEME constants

### components/ThreadPanel.tsx
- **ThreadPanel()**: Sidebar showing threads or active conversation. Called in app/page.tsx.
  - **handleThreadClick(threadId)**: Sets active thread. Called by thread item onClick.
  - **handleResolveThread(threadId)**: Marks thread as resolved. Called by "Resolve" button.
  - **handleDeleteThread(threadId)**: Deletes thread with confirmation. Called by "Delete" button.
  - Uses: useCodeReview, CommentThread, formatTimestamp, truncateText

### components/threads/CommentThread.tsx
- **CommentThread({ thread, onClose })**: Main thread conversation component. Called by ThreadPanel.
  - **handleApplySuggestion(messageId, suggestion)**: Applies code suggestion to editor. Called by DiffView onApply.
  - **handleDismissSuggestion(messageId, suggestion)**: Dismisses suggestion. Called by DiffView onDismiss.
  - **handleSendMessage()**: Sends user message to AI. Called by MessageInput onSend.
  - Uses: useCodeReview, useAIStreaming, useCodeSuggestions, CommentThreadHeader, MessageList, MessageInput, StreamingIndicator

### components/threads/CommentThreadHeader.tsx
- **CommentThreadHeader({ thread, onClose })**: Thread header with line range. Called by CommentThread.

### components/threads/MessageList.tsx
- **MessageList({ thread, messageSuggestions, dismissedSuggestions, onApplySuggestion, onDismissSuggestion })**: Renders message list with markdown and suggestions. Called by CommentThread.
  - Uses: ReactMarkdown, DiffView

### components/threads/MessageInput.tsx
- **MessageInput({ input, onInputChange, onSend, disabled })**: Input form for sending messages. Called by CommentThread.
  - Handles Enter key to send

### components/threads/StreamingIndicator.tsx
- **StreamingIndicator({ isVisible })**: Shows "AI is thinking..." animation. Called by CommentThread.

### components/ThreadCreationDialog.tsx
- **ThreadCreationDialog({ selectedCode, lineRange, onClose, onSubmit })**: Modal for creating threads. Called by CodeEditor.
  - **handleSubmit()**: Submits message. Called by "Create Thread" button and Cmd+Enter.
  - **handleSuggestedPrompt(prompt)**: Auto-submits suggested prompt. Called by suggested prompt buttons.
  - Uses: useState

### components/SessionManager.tsx
- **SessionManager({ isOpen, onClose, onLoadSession, onNewSession })**: Modal for managing saved sessions. Called by Header.
  - **handleLoad(session)**: Loads session and closes modal. Called by "Load" button.
  - **handleDelete(sessionId)**: Deletes session with confirmation. Called by "Delete" button.
  - **handleDeleteAll()**: Deletes all sessions with confirmation. Called by "Delete All" button.
  - Uses: loadSessions, deleteSession, clearAllSessions, formatTimestamp, truncateText

### components/DiffView.tsx
- **DiffView({ suggestion, onApply, onDismiss })**: Side-by-side diff view. Called by MessageList.
  - Uses: computeDiff

### components/SelectionActionMenu.tsx
- **SelectionActionMenu({ position, onAskAI, onCancel })**: Floating menu (currently unused). Not called anywhere.

### components/providers/CodeReviewProvider.tsx
- **codeReviewReducer(state, action)**: Reducer handling 15 action types. Called by useReducer.
  - Cases: SET_CODE, SET_SELECTION, CREATE_THREAD, ADD_MESSAGE, UPDATE_MESSAGE, DELETE_MESSAGE, SET_ACTIVE_THREAD, UPDATE_THREAD_STATUS, DELETE_THREAD, LOAD_SESSION, NEW_SESSION, SET_LOADING, SET_ERROR, SET_LANGUAGE, SET_THEME, SET_FILE_NAME
  - Uses: generateId, updateThread, updateMessage, addMessageToThread, removeMessageFromThread
- **CodeReviewProvider({ children })**: Context provider with auto-save. Called in app/page.tsx.
  - Uses: useReducer, useDebouncedCallback, saveSession
- **useCodeReview()**: Hook to access context. Called by all components needing state.
  - Returns: { state, dispatch }

## hooks/

### hooks/useAIStreaming.ts
- **useAIStreaming()**: Hook managing AI streaming state. Called by CommentThread.
  - **sendMessage(thread, userMessage, conversationHistory, addUserMessage)**: Sends message and streams response. Called by CommentThread.handleSendMessage.
  - **shouldAutoRespond(thread)**: Checks if thread should auto-respond. Called by CommentThread useEffect.
  - **markAutoResponded(threadId)**: Marks thread as auto-responded. Called by CommentThread useEffect.
  - **resetAutoResponded(threadId)**: Resets auto-respond flag. Called by CommentThread useEffect.
  - Uses: useCodeReview, generateId, streamAIResponse
  - Returns: { isStreaming, sendMessage, shouldAutoRespond, markAutoResponded, resetAutoResponded }

### hooks/useCodeSuggestions.ts
- **useCodeSuggestions(thread)**: Hook parsing code suggestions from messages. Called by CommentThread.
  - Uses: useCodeReview, parseCodeSuggestions
  - Returns: Map<string, CodeSuggestion[]>

## lib/

### lib/utils.ts
- **generateId()**: Generates UUID. Called by: CodeEditor, useAIStreaming, ThreadCreationDialog, reducer
- **getNextThreadColor(existingThreads)**: Returns next available thread color. Called by CodeEditor.handleCreateThread
- **formatTimestamp(timestamp)**: Formats timestamp as relative time. Called by: ThreadPanel, SessionManager
- **detectLanguage(code, fileName?)**: Detects language from code/filename. Called by CodeEditor.handleEditorChange
- **truncateText(text, maxLength)**: Truncates text with ellipsis. Called by: ThreadPanel, SessionManager, threadDecorations.createThreadDecoration
- **extractSelection(code, startLine, startColumn, endLine, endColumn)**: Extracts selected text. Called by CodeEditor.handleCreateThread, CodeEditor (for selectedCode)
- **parseCodeSuggestions(markdownContent, originalCode, language?)**: Extracts code suggestions from markdown. Called by useCodeSuggestions
- **computeDiff(original, suggested)**: Computes line-by-line diff. Called by DiffView

### lib/storage.ts
- **saveSessions(sessions)**: Saves all sessions to localStorage. Called by saveSession
- **loadSessions()**: Loads all sessions from localStorage. Called by: SessionManager, saveSession, loadSession, deleteSession
- **saveSession(session)**: Saves single session. Called by CodeReviewProvider debouncedSave
- **deleteSession(sessionId)**: Deletes session. Called by SessionManager.handleDelete
- **clearAllSessions()**: Clears all sessions. Called by SessionManager.handleDeleteAll

### lib/constants.ts
- **THREAD_STATUS**: Object with ACTIVE/RESOLVED constants. Used in types and reducer
- **THEME**: Object with DARK/LIGHT constants. Used in Header, CodeReviewProvider
- **DEFAULT_EDITOR_LANGUAGE**: Default language string. Used in CodeReviewProvider initialState
- **DEFAULT_EDITOR_THEME**: Default theme. Used in CodeReviewProvider initialState
- **KEYBOARD_SHORTCUTS**: Keyboard shortcut definitions. Not currently used in code.

### lib/api/streaming.ts
- **streamAIResponse(request, callbacks)**: Streams AI response from API. Called by useAIStreaming.sendMessage
  - Uses: fetch, TextDecoder, ReadableStream
  - Calls callbacks: onChunk, onError, onComplete

### lib/reducers/threadReducers.ts
- **updateThread(state, threadId, updater)**: Updates thread in session. Called by: updateMessage, addMessageToThread, removeMessageFromThread, reducer (UPDATE_THREAD_STATUS)
- **updateMessage(state, threadId, messageId, updater)**: Updates message in thread. Called by reducer (UPDATE_MESSAGE)
- **addMessageToThread(state, threadId, message)**: Adds message to thread. Called by reducer (ADD_MESSAGE)
- **removeMessageFromThread(state, threadId, messageId)**: Removes message from thread. Called by reducer (DELETE_MESSAGE)

### lib/codemirror/threadDecorations.ts
- **ThreadWidget.toDOM()**: Creates DOM element for gutter icon. Called by CodeMirror ViewPlugin
- **getPosition(state, line, column)**: Converts 1-indexed line/column to CodeMirror position. Called by createThreadDecoration, createGutterDecoration
- **createThreadDecoration(thread, isActive, state)**: Creates highlight decoration. Called by threadDecorationsPlugin.update
- **createGutterDecoration(thread, isActive, state)**: Creates gutter icon decoration. Called by threadDecorationsPlugin.update
- **threadDecorations.create()**: Initializes empty decoration set. Called by CodeMirror
- **threadDecorations.update(decorations, tr)**: Updates decorations on transaction. Called by CodeMirror
- **threadDecorationsPlugin.constructor(view)**: Initializes plugin. Called by CodeMirror
- **threadDecorationsPlugin.update(update)**: Updates decorations when threads change. Called by CodeMirror
- **createThreadDecorationsExtension()**: Returns extension array. Called by CodeEditor threadDecorationsExtension useMemo
- **setThreadDecorations**: StateEffect for updating decorations. Used in CodeEditor useEffect

## Summary

**Total Functions**: 60+ functions across 20+ files
**Entry Points**: app/page.tsx (Home), app/api/review/route.ts (POST)
**State Flow**: User actions → dispatch → reducer → state update → component re-render
**Data Flow**: Editor → State → API → Streaming → State → UI
**Key Abstractions**: Custom hooks (useAIStreaming, useCodeSuggestions), reducer helpers (threadReducers), CodeMirror extensions (threadDecorations)

