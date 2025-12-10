# CodeReview.ai - Detailed Implementation Plan

This document provides a comprehensive, phase-by-phase implementation plan for completing the CodeReview.ai application. Each phase includes specific tasks, file changes, unit tests, and testing instructions.

---

## Overview

**Current State**: Scaffold is complete with types, state management, API route, and basic component shells.

**Goal**: Implement all core features to enable AI-powered inline code review with multiple threads.

**Estimated Total Time**: 6-8 hours (core) + 2-3 hours (bonus features)

---

## Phase 1: Selection Handling & Thread Creation Flow

**Goal**: Enable users to select code and create threads from selections.

**Estimated Time**: 1.5-2 hours

### Task 1.1: Implement Selection Tracking in CodeEditor

**Files to Update**:
- `components/CodeEditor.tsx`

**Implementation Steps**:
1. Add `useRef` to store Monaco editor instance reference
2. Add `onMount` handler to capture editor instance
3. Add `onDidChangeCursorSelection` listener to track selection changes
4. Extract selection range (startLine, endLine, startColumn, endColumn) from Monaco selection
5. Extract selected text using Monaco's `getModel().getValueInRange()`
6. Dispatch `SET_SELECTION` action when selection changes
7. Only dispatch if selection is non-empty (startLine !== endLine || startColumn !== endColumn)
8. Clear selection when user clicks outside editor

**Key Code Patterns**:
```typescript
const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
  editorRef.current = editor;
  
  editor.onDidChangeCursorSelection((e) => {
    const selection = e.selection;
    if (!selection.isEmpty()) {
      const selectedText = editor.getModel()?.getValueInRange(selection) || '';
      dispatch({
        type: 'SET_SELECTION',
        payload: {
          startLine: selection.startLineNumber,
          endLine: selection.endLineNumber,
          startColumn: selection.startColumn,
          endColumn: selection.endColumn,
        },
      });
    } else {
      dispatch({ type: 'SET_SELECTION', payload: null });
    }
  });
};
```

**Unit Tests to Add** (create `components/__tests__/CodeEditor.test.tsx`):
- Test that selection change dispatches SET_SELECTION action
- Test that empty selection clears selection state
- Test that selection range is correctly extracted (1-indexed)
- Test that selected text is correctly extracted

**Edge Cases to Handle**:
- Empty selection (cursor only, no text)
- Selection spanning multiple lines
- Selection at end of file
- Very long selections (1000+ lines)

---

### Task 1.2: Create SelectionActionMenu Component

**Files to Create**:
- `components/SelectionActionMenu.tsx`

**Implementation Steps**:
1. Create component that accepts `position` (top, left), `onAskAI` callback, `onCancel` callback
2. Position menu near selection using absolute positioning
3. Add "Ask AI" button that triggers `onAskAI`
4. Add "Cancel" button that triggers `onCancel`
5. Position menu intelligently (avoid going off-screen)
6. Add keyboard handler (Escape to cancel)
7. Style with Tailwind (floating menu with shadow)

**Props Interface**:
```typescript
interface SelectionActionMenuProps {
  position: { top: number; left: number };
  onAskAI: () => void;
  onCancel: () => void;
}
```

**Files to Update**:
- `components/CodeEditor.tsx` - Import and conditionally render SelectionActionMenu when selection exists

**Unit Tests to Add** (create `components/__tests__/SelectionActionMenu.test.tsx`):
- Test that menu renders at correct position
- Test that "Ask AI" button calls onAskAI
- Test that "Cancel" button calls onCancel
- Test that Escape key cancels menu

---

### Task 1.3: Create ThreadCreationDialog Component

**Files to Create**:
- `components/ThreadCreationDialog.tsx`

**Implementation Steps**:
1. Create modal/dialog component using a simple overlay + centered card
2. Display selected code snippet in a `<pre>` tag with syntax highlighting
3. Show line range (e.g., "Lines 12-15")
4. Add textarea for user's initial question
5. Add suggested prompt buttons:
   - "Review this code"
   - "Can this be optimized?"
   - "Explain this code"
   - "Check for bugs"
6. Add "Create Thread" button (disabled if input is empty)
7. Add "Cancel" button
8. Handle form submission to create thread
9. Use `getNextThreadColor()` utility to assign color
10. Generate thread ID using `generateId()`
11. Extract selected code from current session using `extractSelection()` utility

**Props Interface**:
```typescript
interface ThreadCreationDialogProps {
  selectedCode: string;
  lineRange: { start: number; end: number };
  startColumn: number;
  endColumn: number;
  onClose: () => void;
  onSubmit: (message: string) => void;
}
```

**Files to Update**:
- `components/CodeEditor.tsx` - Import and conditionally render ThreadCreationDialog
- `components/CodeEditor.tsx` - Handle dialog submission to dispatch CREATE_THREAD action

**Thread Creation Logic**:
```typescript
const handleCreateThread = (message: string) => {
  if (!state.currentSession || !state.selectedRange) return;
  
  const thread: CodeThread = {
    id: generateId(),
    startLine: state.selectedRange.startLine,
    endLine: state.selectedRange.endLine,
    startColumn: state.selectedRange.startColumn,
    endColumn: state.selectedRange.endColumn,
    selectedCode: extractSelection(
      state.currentSession.code,
      state.selectedRange.startLine,
      state.selectedRange.startColumn,
      state.selectedRange.endLine,
      state.selectedRange.endColumn
    ),
    messages: [{
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    color: getNextThreadColor(state.currentSession.threads),
  };
  
  dispatch({ type: 'CREATE_THREAD', payload: thread });
  onClose();
};
```

**Unit Tests to Add** (create `components/__tests__/ThreadCreationDialog.test.tsx`):
- Test that dialog renders with selected code
- Test that suggested prompts populate textarea
- Test that submit button is disabled when input is empty
- Test that onSubmit is called with correct message
- Test that onClose is called on cancel

---

### Phase 1 Testing Instructions

**Manual Testing Steps**:
1. Start dev server: `npm run dev`
2. Paste code into editor (e.g., a simple TypeScript function)
3. Select a few lines of code
4. Verify selection action menu appears near selection
5. Click "Ask AI" button
6. Verify thread creation dialog opens
7. Verify selected code is displayed in dialog
8. Enter a question or click a suggested prompt
9. Click "Create Thread"
10. Verify thread appears in ThreadPanel
11. Verify selection is cleared after thread creation
12. Verify activeThreadId is set to new thread

**Expected Behavior**:
- Selection menu appears immediately on selection
- Dialog shows correct code snippet
- Thread is created with correct line ranges
- Thread appears in ThreadPanel with correct color

**Common Issues to Check**:
- Menu positioning (should not go off-screen)
- Selection extraction (should handle multi-line correctly)
- Thread color assignment (should cycle through colors)

---

## Phase 2: Monaco Decorations & Visual Indicators

**Goal**: Visually highlight thread ranges in the editor with colors and gutter indicators.

**Estimated Time**: 1-1.5 hours

### Task 2.1: Implement Monaco Decorations for Thread Ranges

**Files to Update**:
- `components/CodeEditor.tsx`

**Implementation Steps**:
1. Add `useEffect` hook that runs when `threads` or `activeThreadId` changes
2. Get Monaco editor instance from ref
3. Create decoration array from threads:
   - For each thread, create a `monaco.editor.IModelDeltaDecoration`
   - Use `new monaco.Range()` to define range (1-indexed)
   - Set decoration options:
     - `className`: `thread-highlight-${thread.color}`
     - `isWholeLine`: false (highlight only selected range)
     - `inlineClassName`: `thread-inline-${thread.color}`
     - `glyphMarginClassName`: `thread-glyph-${thread.color}` (for gutter icon)
     - `hoverMessage`: Show thread preview on hover
4. Use `editor.deltaDecorations()` to apply decorations
5. Store decoration IDs in state/ref for cleanup
6. Clean up decorations when component unmounts or threads change

**Key Code Pattern**:
```typescript
useEffect(() => {
  if (!editorRef.current || !state.currentSession) return;
  
  const editor = editorRef.current;
  const model = editor.getModel();
  if (!model) return;
  
  const decorations = state.currentSession.threads.map(thread => ({
    range: new monaco.Range(
      thread.startLine,
      thread.startColumn,
      thread.endLine,
      thread.endColumn
    ),
    options: {
      className: `thread-highlight-${thread.color}`,
      isWholeLine: false,
      inlineClassName: `thread-inline-${thread.color}`,
      glyphMarginClassName: `thread-glyph-${thread.color}`,
      hoverMessage: {
        value: `Thread: ${truncateText(thread.messages[0]?.content || '', 50)}`,
      },
    },
  }));
  
  const decorationIds = editor.deltaDecorations([], decorations);
  
  return () => {
    editor.deltaDecorations(decorationIds, []);
  };
}, [state.currentSession?.threads, state.activeThreadId]);
```

**Files to Update**:
- `app/globals.css` - Add CSS classes for thread highlights:
  ```css
  .thread-highlight-blue {
    background-color: rgba(74, 158, 255, 0.1);
    border-left: 3px solid #4a9eff;
  }
  .thread-inline-blue {
    background-color: rgba(74, 158, 255, 0.15);
  }
  /* Repeat for other colors: purple, green, orange, pink, cyan, yellow, red */
  ```

**Unit Tests to Add** (extend `components/__tests__/CodeEditor.test.tsx`):
- Test that decorations are created for each thread
- Test that decoration ranges match thread line ranges
- Test that decorations are cleaned up on unmount
- Test that active thread decoration is visually distinct

---

### Task 2.2: Add Gutter Icons for Thread Indicators

**Files to Update**:
- `components/CodeEditor.tsx`
- `app/globals.css`

**Implementation Steps**:
1. Extend decoration options to include `glyphMarginClassName`
2. Add CSS for gutter icons (small colored circles or dots)
3. Group threads by line number to show count if multiple threads on same line
4. Add click handler on gutter to open thread (optional enhancement)

**CSS for Gutter Icons**:
```css
.thread-glyph-blue::before {
  content: '●';
  color: #4a9eff;
  font-size: 12px;
}
/* Repeat for other colors */
```

**Unit Tests to Add**:
- Test that gutter icons appear for threads
- Test that multiple threads on same line show correctly

---

### Task 2.3: Highlight Active Thread Differently

**Files to Update**:
- `components/CodeEditor.tsx`

**Implementation Steps**:
1. Modify decoration options for active thread:
   - Use stronger border color
   - Increase opacity
   - Add pulsing animation (optional)
2. Update decoration when `activeThreadId` changes

**CSS Enhancement**:
```css
.thread-highlight-active {
  border-left-width: 4px;
  animation: pulse-border 2s infinite;
}
```

---

### Phase 2 Testing Instructions

**Manual Testing Steps**:
1. Create multiple threads on different code sections
2. Verify each thread has a different colored highlight
3. Verify gutter icons appear for each thread
4. Click on a thread in ThreadPanel
5. Verify active thread highlight is more prominent
6. Verify hover tooltips show thread preview
7. Create overlapping thread selections (if allowed)
8. Delete a thread and verify decoration is removed

**Expected Behavior**:
- Each thread has distinct color
- Highlights are visible but not intrusive
- Active thread is clearly distinguished
- Decorations update when threads change

**Common Issues to Check**:
- Decorations not showing (check Monaco instance is ready)
- Colors not applying (check CSS classes exist)
- Performance with many threads (should handle 10+ threads smoothly)

---

## Phase 3: AI Integration & Streaming Responses

**Goal**: Connect CommentThread component to API route and handle streaming responses.

**Estimated Time**: 1.5-2 hours

### Task 3.1: Implement API Call with Streaming in CommentThread

**Files to Update**:
- `components/CommentThread.tsx`

**Implementation Steps**:
1. Replace TODO placeholder with actual API call
2. Create assistant message immediately (with empty content)
3. Dispatch `ADD_MESSAGE` with empty assistant message
4. Make POST request to `/api/review` with:
   - `code`: Full file code from `state.currentSession.code`
   - `language`: From `state.currentSession.language`
   - `selectedCode`: From `thread.selectedCode`
   - `lineRange`: `{ start: thread.startLine, end: thread.endLine }`
   - `userMessage`: User's input message
   - `conversationHistory`: Previous messages in thread (mapped to API format)
5. Handle response as ReadableStream
6. Use `response.body.getReader()` to read stream
7. Decode chunks using `TextDecoder`
8. Update assistant message content progressively using `UPDATE_MESSAGE` action
9. Handle errors (network, API, streaming)
10. Set loading state during streaming
11. Auto-scroll to bottom when new content arrives

**Key Code Pattern**:
```typescript
const handleSendMessage = async () => {
  if (!input.trim() || !state.currentSession) return;

  const userMessage: Message = {
    id: generateId(),
    role: 'user',
    content: input.trim(),
    timestamp: new Date().toISOString(),
  };

  dispatch({
    type: 'ADD_MESSAGE',
    payload: { threadId: thread.id, message: userMessage },
  });

  const assistantMessage: Message = {
    id: generateId(),
    role: 'assistant',
    content: '',
    timestamp: new Date().toISOString(),
  };

  dispatch({
    type: 'ADD_MESSAGE',
    payload: { threadId: thread.id, message: assistantMessage },
  });

  setInput('');
  setIsStreaming(true);
  dispatch({ type: 'SET_LOADING', payload: true });

  try {
    const response = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: state.currentSession.code,
        language: state.currentSession.language,
        selectedCode: thread.selectedCode,
        lineRange: { start: thread.startLine, end: thread.endLine },
        userMessage: userMessage.content,
        conversationHistory: thread.messages
          .slice(0, -1) // Exclude the just-added user message
          .map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let accumulatedContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedContent += chunk;

      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          threadId: thread.id,
          messageId: assistantMessage.id,
          content: accumulatedContent,
        },
      });
    }
  } catch (error) {
    console.error('Failed to get AI response:', error);
    dispatch({
      type: 'SET_ERROR',
      payload: error instanceof Error ? error.message : 'Failed to get response',
    });
    // Remove empty assistant message on error
    dispatch({
      type: 'DELETE_MESSAGE',
      payload: { threadId: thread.id, messageId: assistantMessage.id },
    });
  } finally {
    setIsStreaming(false);
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};
```

**Files to Update**:
- `lib/types.ts` - Add `DELETE_MESSAGE` action type (if not exists)
- `components/providers/CodeReviewProvider.tsx` - Add `DELETE_MESSAGE` reducer case

**Unit Tests to Add** (create `components/__tests__/CommentThread.test.tsx`):
- Test that API is called with correct payload
- Test that user message is added immediately
- Test that assistant message is created with empty content
- Test that content updates as stream arrives
- Test that error handling works (network error, API error)
- Test that loading state is set correctly
- Mock fetch API for testing

---

### Task 3.2: Add Auto-Scroll to Latest Message

**Files to Update**:
- `components/CommentThread.tsx`

**Implementation Steps**:
1. Add `useRef` for messages container
2. Add `useEffect` that scrolls to bottom when messages change
3. Use `scrollIntoView()` or `scrollTop = scrollHeight`

**Code Pattern**:
```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [thread.messages]);
```

---

### Task 3.3: Add Markdown Rendering for AI Responses

**Files to Update**:
- `components/CommentThread.tsx`

**Implementation Steps**:
1. Install `react-markdown` package: `npm install react-markdown`
2. Import and use `ReactMarkdown` component for assistant messages
3. Add syntax highlighting for code blocks (optional: `react-syntax-highlighter`)

**Code Pattern**:
```typescript
import ReactMarkdown from 'react-markdown';

// In message rendering:
{message.role === 'assistant' ? (
  <ReactMarkdown className="prose prose-sm dark:prose-invert">
    {message.content}
  </ReactMarkdown>
) : (
  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
)}
```

**Files to Update**:
- `package.json` - Add `react-markdown` dependency

---

### Phase 3 Testing Instructions

**Manual Testing Steps**:
1. Create a thread with initial question
2. Verify user message appears immediately
3. Verify loading indicator shows
4. Verify AI response streams in character by character
5. Verify response is formatted correctly (markdown)
6. Send a follow-up message in the same thread
7. Verify conversation history is maintained
8. Test error case: Disconnect network, verify error message
9. Test with very long code file (1000+ lines)
10. Test with multiple threads sending messages simultaneously

**Expected Behavior**:
- Responses stream smoothly
- Markdown renders correctly (code blocks, lists, etc.)
- Error messages are user-friendly
- Multiple threads can stream independently

**Common Issues to Check**:
- Streaming stops mid-response (check error handling)
- Markdown not rendering (check package installation)
- Performance with long responses (should handle 2000+ tokens)

---

## Phase 4: Thread Panel Integration & Active Thread Display

**Goal**: Show active thread conversation in ThreadPanel and enable thread switching.

**Estimated Time**: 1 hour

### Task 4.1: Integrate CommentThread into ThreadPanel

**Files to Update**:
- `components/ThreadPanel.tsx`

**Implementation Steps**:
1. Import `CommentThread` component
2. Replace TODO placeholder with actual `CommentThread` rendering
3. Find active thread from threads array using `activeThreadId`
4. Pass thread, `onClose` handler, and `onSendMessage` handler
5. Position CommentThread at bottom of panel (use flex layout)
6. Make ThreadPanel scrollable (thread list scrolls, CommentThread stays at bottom)
7. Handle `onClose` to clear `activeThreadId`

**Code Pattern**:
```typescript
{state.activeThreadId && (() => {
  const activeThread = threads.find(t => t.id === state.activeThreadId);
  if (!activeThread) return null;
  
  return (
    <CommentThread
      thread={activeThread}
      onClose={() => dispatch({ type: 'SET_ACTIVE_THREAD', payload: null })}
    />
  );
})()}
```

**Layout Structure**:
- ThreadPanel should use `flex flex-col h-full`
- Thread list should be `flex-1 overflow-y-auto`
- CommentThread should be fixed height (e.g., `h-[60%]` or `flex-1`)

**Unit Tests to Add** (extend `components/__tests__/ThreadPanel.test.tsx`):
- Test that CommentThread renders when activeThreadId is set
- Test that onClose clears activeThreadId
- Test that correct thread is displayed

---

### Task 4.2: Improve Thread Panel Layout

**Files to Update**:
- `components/ThreadPanel.tsx`

**Implementation Steps**:
1. Adjust layout to show thread list and active thread side-by-side or stacked
2. Add visual separator between list and conversation
3. Ensure responsive behavior (stack on small screens)
4. Add "Back to list" button in CommentThread header (optional)

---

### Phase 4 Testing Instructions

**Manual Testing Steps**:
1. Create multiple threads
2. Click on a thread in the list
3. Verify CommentThread appears at bottom of panel
4. Verify correct thread conversation is shown
5. Send a message in active thread
6. Click on different thread
7. Verify conversation switches correctly
8. Click close button
9. Verify thread list is shown again
10. Test with many threads (scroll list while conversation is open)

**Expected Behavior**:
- Thread conversation appears immediately on click
- Switching threads is instant
- Layout is responsive and usable
- No layout shifts or jumps

**Common Issues to Check**:
- Thread not found (check activeThreadId matches thread.id)
- Layout overflow (check flex/height constraints)
- Scroll behavior (both list and conversation should scroll independently)

---

## Phase 5: Keyboard Shortcuts & UX Enhancements

**Goal**: Add keyboard shortcuts and improve user experience.

**Estimated Time**: 45 minutes - 1 hour

### Task 5.1: Implement Cmd+K Shortcut for Thread Creation

**Files to Update**:
- `components/CodeEditor.tsx`

**Implementation Steps**:
1. Add `useEffect` hook to listen for keyboard events
2. Listen for `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
3. Check if there's a valid selection (`state.selectedRange`)
4. If selection exists, trigger thread creation dialog
5. Prevent default browser behavior
6. Add visual indicator (toast or hint) when shortcut is available

**Code Pattern**:
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (state.selectedRange && state.currentSession) {
        // Trigger thread creation
        setShowThreadDialog(true);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [state.selectedRange, state.currentSession]);
```

**Unit Tests to Add**:
- Test that Cmd+K triggers dialog when selection exists
- Test that shortcut doesn't trigger when no selection
- Test that default behavior is prevented

---

### Task 5.2: Add Loading States & Error Messages

**Files to Update**:
- `components/CommentThread.tsx`
- `components/CodeEditor.tsx`
- `app/page.tsx` (for global error display)

**Implementation Steps**:
1. Display error messages from `state.error` in UI
2. Add loading spinner during API calls
3. Add retry button on errors
4. Show connection status indicator
5. Add toast notifications for success/error (optional)

**Error Display**:
```typescript
{state.error && (
  <div className="p-4 bg-danger/20 border border-danger rounded mb-4">
    <p className="text-danger text-sm">{state.error}</p>
    <button onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}>
      Dismiss
    </button>
  </div>
)}
```

---

### Task 5.3: Add Code Snippet Copy Button

**Files to Update**:
- `components/CommentThread.tsx`

**Implementation Steps**:
1. Add "Copy" button next to code snippet
2. Use `navigator.clipboard.writeText()` to copy
3. Show feedback (toast or button state change)

---

### Phase 5 Testing Instructions

**Manual Testing Steps**:
1. Select code in editor
2. Press Cmd+K (or Ctrl+K)
3. Verify thread creation dialog opens
4. Test keyboard shortcut with no selection (should not trigger)
5. Test error display: Temporarily break API key, verify error shows
6. Test loading states: Slow network, verify spinner shows
7. Test copy button: Click copy, verify code is in clipboard

**Expected Behavior**:
- Shortcuts work reliably
- Errors are clear and actionable
- Loading states provide feedback
- Copy functionality works

---

## Phase 6: Session Management & Persistence

**Goal**: Enable users to save, load, and manage multiple review sessions.

**Estimated Time**: 1-1.5 hours

### Task 6.1: Create SessionManager Component

**Files to Create**:
- `components/SessionManager.tsx`

**Implementation Steps**:
1. Create dialog/modal component
2. Load sessions using `loadSessions()` from `lib/storage.ts`
3. Display sessions in a list with:
   - Session name (fileName or "Untitled")
   - Date created/updated
   - Thread count
   - Code preview (first 100 chars)
4. Add "Load" button for each session
5. Add "Delete" button for each session
6. Add "New Session" button
7. Handle empty state (no saved sessions)
8. Sort sessions by `updatedAt` (most recent first)

**Props Interface**:
```typescript
interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSession: (session: CodeReviewSession) => void;
  onNewSession: () => void;
}
```

**Files to Update**:
- `components/Header.tsx` - Add button to open SessionManager
- `components/Header.tsx` - Import and render SessionManager

**Unit Tests to Add** (create `components/__tests__/SessionManager.test.tsx`):
- Test that sessions are loaded and displayed
- Test that load button dispatches LOAD_SESSION
- Test that delete button removes session
- Test that new session button works
- Test empty state rendering

---

### Task 6.2: Add Session Name Input

**Files to Update**:
- `components/Header.tsx` or create `components/SessionNameInput.tsx`

**Implementation Steps**:
1. Add input field for session/file name
2. Update session `fileName` when user types
3. Display current session name in header
4. Auto-save name changes

**Files to Update**:
- `lib/types.ts` - Ensure `fileName` is in CodeReviewSession
- `components/providers/CodeReviewProvider.tsx` - Add action to update fileName

---

### Task 6.3: Improve Auto-Save Behavior

**Files to Update**:
- `components/providers/CodeReviewProvider.tsx`

**Implementation Steps**:
1. Debounce auto-save (save 1 second after last change)
2. Show "Saving..." indicator (optional)
3. Handle localStorage quota errors gracefully
4. Add manual save button (optional)

**Code Pattern**:
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSave = useDebouncedCallback((session: CodeReviewSession) => {
  saveSession(session);
}, 1000);
```

**Files to Update**:
- `package.json` - Add `use-debounce` dependency

---

### Phase 6 Testing Instructions

**Manual Testing Steps**:
1. Create a session with code and threads
2. Verify session auto-saves (check localStorage)
3. Open SessionManager dialog
4. Verify session appears in list
5. Click "Load" on a session
6. Verify code and threads are restored
7. Create a new session
8. Verify it appears in list
9. Delete a session
10. Verify it's removed from list and localStorage
11. Test with 10+ sessions (verify only 10 most recent are kept)
12. Test localStorage quota exceeded error handling

**Expected Behavior**:
- Sessions persist across page reloads
- Loading sessions restores all state
- Session list is sorted by recency
- Deletion works correctly

**Common Issues to Check**:
- Sessions not loading (check localStorage key)
- State not restoring (check LOAD_SESSION reducer)
- Quota exceeded (check error handling)

---

## Phase 7: Export Functionality

**Goal**: Enable users to export review sessions as markdown reports.

**Estimated Time**: 30-45 minutes

### Task 7.1: Implement Export to Markdown

**Files to Update**:
- `components/Header.tsx`

**Implementation Steps**:
1. Create `exportSession()` function
2. Generate markdown string with:
   - Session title (fileName or "Untitled")
   - Date generated
   - Full code (optional, or just thread code snippets)
   - Each thread with:
     - Line range
     - Selected code snippet
     - All messages (user and assistant)
3. Create Blob with markdown content
4. Create download link and trigger download
5. Add "Export" button in Header

**Code Pattern**:
```typescript
const exportSession = () => {
  if (!state.currentSession) return;
  
  const markdown = `# Code Review Report

## ${state.currentSession.fileName || 'Untitled'}
Generated: ${new Date().toLocaleString()}

${state.currentSession.threads.map(thread => `
### Lines ${thread.startLine}-${thread.endLine}

**Code:**
\`\`\`${state.currentSession.language}
${thread.selectedCode}
\`\`\`

**Discussion:**
${thread.messages.map(m => `**${m.role === 'user' ? 'User' : 'AI'}** (${new Date(m.timestamp).toLocaleString()}):\n${m.content}`).join('\n\n---\n\n')}
`).join('\n\n---\n\n')}
  `;
  
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `review-${state.currentSession.fileName || 'untitled'}-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
};
```

**Unit Tests to Add** (create `lib/__tests__/export.test.ts`):
- Test that markdown is generated correctly
- Test that all threads are included
- Test that all messages are included
- Test file download is triggered

---

### Task 7.2: Add Export Options (Optional Enhancement)

**Files to Update**:
- `components/Header.tsx`

**Implementation Steps**:
1. Add dropdown menu for export formats:
   - Markdown (default)
   - JSON (raw data)
   - HTML (formatted report)
2. Implement each export format

---

### Phase 7 Testing Instructions

**Manual Testing Steps**:
1. Create a session with multiple threads and messages
2. Click "Export" button
3. Verify markdown file downloads
4. Open downloaded file
5. Verify all threads are included
6. Verify all messages are included
7. Verify code snippets are formatted correctly
8. Test with empty session (should still export)
9. Test with very long code (should handle gracefully)

**Expected Behavior**:
- File downloads immediately
- Markdown is well-formatted
- All data is included
- File name is descriptive

---

## Phase 8: Bonus Features (Optional)

**Goal**: Add nice-to-have features for enhanced user experience.

**Estimated Time**: 2-3 hours

### Task 8.1: Language Auto-Detection

**Files to Update**:
- `components/CodeEditor.tsx`

**Implementation Steps**:
1. Use `detectLanguage()` utility when code changes
2. Auto-update `editorLanguage` state
3. Show detected language in UI (optional badge)
4. Allow manual override via language selector

**Code Pattern**:
```typescript
const handleEditorChange = (value: string | undefined) => {
  if (value !== undefined) {
    const detectedLanguage = detectLanguage(value);
    dispatch({
      type: 'SET_CODE',
      payload: {
        code: value,
        language: detectedLanguage,
      },
    });
  }
};
```

---

### Task 8.2: Theme Toggle

**Files to Update**:
- `components/Header.tsx`
- `components/providers/CodeReviewProvider.tsx`

**Implementation Steps**:
1. Add theme toggle button in Header
2. Toggle between 'vs-dark' and 'vs-light'
3. Save preference to localStorage
4. Load preference on app start

---

### Task 8.3: Diff View for AI Suggestions (Advanced)

**Files to Create**:
- `components/DiffView.tsx`

**Implementation Steps**:
1. Use Monaco's `DiffEditor` component
2. Parse AI response for code suggestions
3. Show before/after comparison
4. Add "Apply Changes" button (optional)

**Dependencies**:
- `@monaco-editor/react` (DiffEditor)

---

### Task 8.4: Search/Filter Threads

**Files to Update**:
- `components/ThreadPanel.tsx`

**Implementation Steps**:
1. Add search input
2. Filter threads by message content
3. Highlight matching text

---

### Phase 8 Testing Instructions

**Manual Testing Steps**:
1. Paste code in different languages, verify auto-detection
2. Toggle theme, verify editor and UI update
3. Test diff view (if implemented)
4. Test thread search (if implemented)

---

## Testing Strategy Summary

### Unit Tests to Create

1. **components/__tests__/CodeEditor.test.tsx**
   - Selection handling
   - Decorations
   - Keyboard shortcuts

2. **components/__tests__/CommentThread.test.tsx**
   - API integration
   - Streaming
   - Error handling

3. **components/__tests__/ThreadPanel.test.tsx**
   - Thread display
   - Active thread switching

4. **components/__tests__/ThreadCreationDialog.test.tsx**
   - Form submission
   - Validation

5. **components/__tests__/SelectionActionMenu.test.tsx**
   - Positioning
   - Callbacks

6. **components/__tests__/SessionManager.test.tsx**
   - Session loading
   - Session deletion

7. **lib/__tests__/utils.test.ts**
   - Language detection
   - Text extraction
   - Range overlap

8. **lib/__tests__/storage.test.ts**
   - Save/load sessions
   - Quota handling

### Integration Tests

- End-to-end flow: Select code → Create thread → Send message → Receive response
- Multiple threads: Create 5+ threads, verify all work independently
- Session persistence: Create session → Reload page → Verify restoration

### Manual Testing Checklist

- [ ] All core features work
- [ ] No console errors
- [ ] Responsive design works
- [ ] Keyboard shortcuts work
- [ ] Error handling is graceful
- [ ] Performance is acceptable (10+ threads)
- [ ] localStorage persistence works
- [ ] Export generates valid markdown

---

## Common Roadblocks & Solutions

### Roadblock 1: Monaco Editor Not Loading

**Solution**:
- Ensure `'use client'` directive is at top of component
- Check dynamic import has `ssr: false`
- Verify Monaco is installed: `npm list @monaco-editor/react`

### Roadblock 2: Decorations Not Showing

**Solution**:
- Verify editor instance is ready before applying decorations
- Check CSS classes exist in `globals.css`
- Ensure decoration ranges are valid (1-indexed, within file bounds)

### Roadblock 3: Streaming Not Working

**Solution**:
- Verify API route returns proper ReadableStream
- Check fetch is not awaiting entire response
- Ensure `reader.read()` loop handles chunks correctly
- Test API route directly with curl/Postman

### Roadblock 4: State Not Updating

**Solution**:
- Check dispatch is called correctly
- Verify reducer case matches action type
- Use React DevTools to inspect state
- Check for state mutations (should be immutable)

### Roadblock 5: localStorage Quota Exceeded

**Solution**:
- Implement session limit (keep only N most recent)
- Add error handling in storage.ts
- Show user-friendly error message
- Consider compressing session data

---

## Dependencies to Install

```bash
# Core dependencies (should already be installed)
npm install @monaco-editor/react
npm install @anthropic-ai/sdk
npm install uuid

# Additional dependencies needed
npm install react-markdown        # For markdown rendering
npm install use-debounce          # For debounced auto-save
```

---

## File Structure After Implementation

```
code-review-ai/
├── app/
│   ├── api/review/route.ts          ✅ Complete
│   ├── globals.css                   ⚠️ Add thread decoration styles
│   ├── layout.tsx                   ✅ Complete
│   └── page.tsx                      ✅ Complete
├── components/
│   ├── providers/
│   │   └── CodeReviewProvider.tsx    ⚠️ Add DELETE_MESSAGE action
│   ├── CodeEditor.tsx                ⚠️ Add selection, decorations, shortcuts
│   ├── CommentThread.tsx             ⚠️ Add API integration, streaming
│   ├── ThreadPanel.tsx               ⚠️ Add active thread display
│   ├── Header.tsx                    ⚠️ Add session manager, export
│   ├── SelectionActionMenu.tsx       ⬜ Create new
│   ├── ThreadCreationDialog.tsx      ⬜ Create new
│   └── SessionManager.tsx            ⬜ Create new
├── lib/
│   ├── types.ts                      ✅ Complete
│   ├── utils.ts                      ✅ Complete
│   └── storage.ts                    ✅ Complete
└── components/__tests__/              ⬜ Create test files
```

**Legend**:
- ✅ Complete (no changes needed)
- ⚠️ Needs updates
- ⬜ New file to create

---

## Success Criteria

The implementation is complete when:

1. ✅ Users can select code and create threads
2. ✅ Threads are visually highlighted in editor
3. ✅ AI responses stream in real-time
4. ✅ Multiple threads work independently
5. ✅ Sessions persist across page reloads
6. ✅ Users can export sessions to markdown
7. ✅ Keyboard shortcuts work (Cmd+K)
8. ✅ Error handling is graceful
9. ✅ No major bugs or console errors
10. ✅ Code is clean and maintainable

---

## Next Steps After Implementation

1. **Testing**: Run full test suite, fix any bugs
2. **Performance**: Optimize for large files (1000+ lines)
3. **Accessibility**: Add ARIA labels, keyboard navigation
4. **Documentation**: Update README with new features
5. **Deployment**: Deploy to Vercel, test production build

---

**Ready to implement!** Follow phases sequentially, test after each phase, and refer back to this plan if you encounter roadblocks.

