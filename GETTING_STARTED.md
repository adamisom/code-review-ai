# Getting Started with Cursor Development

This guide will help you build out the CodeReview.ai application using Cursor AI.

## ✅ What's Already Done

The scaffold includes:
- ✅ Complete project structure
- ✅ All TypeScript types defined
- ✅ State management (Context + Reducer)
- ✅ API route with Claude streaming
- ✅ localStorage utilities
- ✅ Basic component shells
- ✅ Tailwind config with custom colors
- ✅ Monaco Editor setup

## 🎯 Implementation Roadmap

### Step 1: Selection Handling in CodeEditor (30-45 min)

**Goal**: Capture when user selects text in Monaco

**File**: `components/CodeEditor.tsx`

**What to implement**:
1. Add Monaco editor ref
2. Listen to selection changes with `onDidChangeCursorSelection`
3. Store selection in state using `SET_SELECTION` action
4. Show a floating "Ask AI" button when text is selected

**Cursor prompt suggestions**:
```
"Add selection change handler to Monaco Editor that:
- Captures start/end line and column
- Dispatches SET_SELECTION action
- Only tracks non-empty selections"
```

**Testing**: Select code → check state updates in React DevTools

---

### Step 2: Thread Creation Dialog (30-45 min)

**Goal**: Let users create a thread from selection

**New File**: `components/ThreadCreationDialog.tsx`

**What to implement**:
1. Modal/dialog that appears when user wants to comment
2. Show the selected code snippet
3. Input field for initial question
4. Suggested prompts (can you review, optimize, etc.)
5. Create thread on submit

**Cursor prompt suggestions**:
```
"Create a ThreadCreationDialog component that:
- Takes selectedCode and lineRange as props
- Shows code preview in a <pre> tag
- Has textarea for user question
- Has quick action buttons like 'Review', 'Optimize', 'Explain'
- Calls onSubmit with the question"
```

**Testing**: Select code → dialog opens → enter question → thread created

---

### Step 3: Monaco Decorations (45-60 min)

**Goal**: Highlight thread ranges with colors in the editor

**File**: `components/CodeEditor.tsx`

**What to implement**:
1. Create decorations array from threads
2. Use `deltaDecorations` to add/remove highlights
3. Add colored line highlights (left border)
4. Add gutter icons showing thread count

**Cursor prompt suggestions**:
```
"Add Monaco decorations that:
- Create a decoration for each thread
- Use thread.color to determine highlight color
- Add className like 'thread-highlight-blue'
- Update decorations when threads change
- Clean up old decorations"
```

**Testing**: Create thread → see colored highlight → create another → see different color

---

### Step 4: Integrate CommentThread with API (60-90 min)

**Goal**: Make AI responses actually work

**File**: `components/CommentThread.tsx`

**What to implement**:
1. Real API call to `/api/review`
2. Stream response text
3. Update assistant message content progressively
4. Handle errors gracefully

**Key code snippet**:
```typescript
const response = await fetch('/api/review', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: state.currentSession.code,
    language: state.currentSession.language,
    selectedCode: thread.selectedCode,
    lineRange: { start: thread.startLine, end: thread.endLine },
    userMessage: input,
    conversationHistory: thread.messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  })
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader!.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  // Update assistant message content
  dispatch({
    type: 'UPDATE_MESSAGE',
    payload: { 
      threadId: thread.id, 
      messageId: assistantMessage.id,
      content: assistantMessage.content + chunk 
    }
  });
}
```

**Cursor prompt suggestions**:
```
"Implement streaming AI response in CommentThread:
- Call /api/review POST endpoint
- Stream response using ReadableStream
- Update assistant message content progressively
- Show loading indicator while streaming"
```

**Testing**: Ask question → see AI response stream in real-time

---

### Step 5: Thread Panel Integration (30-45 min)

**Goal**: Show active thread conversation

**File**: `components/ThreadPanel.tsx`

**What to implement**:
1. Import and render CommentThread component
2. Show it when activeThreadId is set
3. Position it at the bottom of thread panel
4. Make it scrollable

**Cursor prompt suggestions**:
```
"Update ThreadPanel to show CommentThread:
- Import CommentThread component
- Render it when activeThreadId exists
- Pass the active thread data
- Handle close button to clear activeThreadId
- Make it take 40% of panel height"
```

**Testing**: Click thread → see conversation → close → back to list

---

### Step 6: Keyboard Shortcuts (15-30 min)

**Goal**: Press Cmd+K to create thread from selection

**File**: `components/CodeEditor.tsx`

**What to implement**:
1. Add keyboard event listener
2. Listen for Cmd+K (or Ctrl+K on Windows)
3. If there's a selection, trigger thread creation

**Cursor prompt suggestions**:
```
"Add keyboard shortcut handler:
- Listen for Cmd+K (Mac) or Ctrl+K (Windows)
- Check if there's a selection
- If yes, trigger thread creation dialog
- Prevent default browser behavior"
```

**Testing**: Select code → press Cmd+K → dialog opens

---

### Step 7: Session Management (30-45 min)

**Goal**: Load and manage previous sessions

**New File**: `components/SessionManager.tsx`

**What to implement**:
1. Dialog that lists saved sessions
2. Load button for each session
3. Delete button for each session
4. Show session metadata (date, file name, thread count)

**Cursor prompt suggestions**:
```
"Create SessionManager component:
- Fetch sessions using loadSessions()
- Display as a list with metadata
- Load button dispatches LOAD_SESSION action
- Delete button calls deleteSession()
- Show 'no sessions' state"
```

**Testing**: Create session → save → load sessions → see it in list → load it

---

### Step 8: Export Functionality (20-30 min)

**Goal**: Generate markdown report of all threads

**File**: `components/Header.tsx`

**What to implement**:
1. Generate markdown from current session
2. Create downloadable file
3. Include all threads and messages

**Code snippet**:
```typescript
const exportSession = () => {
  if (!state.currentSession) return;
  
  const markdown = `# Code Review Report

## ${state.currentSession.fileName || 'Untitled'}

${state.currentSession.threads.map(thread => `
### Lines ${thread.startLine}-${thread.endLine}

\`\`\`${state.currentSession.language}
${thread.selectedCode}
\`\`\`

${thread.messages.map(m => `**${m.role}**: ${m.content}`).join('\n\n')}
`).join('\n---\n')}
  `;
  
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `review-${Date.now()}.md`;
  a.click();
};
```

**Testing**: Create threads → export → download markdown file

---

## 🎨 Bonus Features (Optional)

### Language Auto-Detection
**File**: `components/CodeEditor.tsx`
- Use `detectLanguage()` utility when code changes
- Update editor language automatically

### Diff View for Suggestions
**New File**: `components/DiffView.tsx`
- Use Monaco's DiffEditor
- Show before/after when AI suggests changes

### Theme Toggle
**File**: `components/Header.tsx`
- Add button to toggle between vs-dark and vs-light
- Save preference to localStorage

---

## 💡 Cursor Pro Tips

### 1. Use Chat for Planning
Before implementing, ask Cursor to review the plan:
```
"Review my implementation plan for step X. 
Are there any edge cases I'm missing?"
```

### 2. Iterate on Generated Code
Don't accept first generation. Refine:
```
"The selection handler works but doesn't account for 
multi-line selections. Fix this."
```

### 3. Reference Existing Patterns
```
"Use the same pattern as ThreadPanel for showing 
loading states in CommentThread"
```

### 4. Ask for Tests
```
"Add validation to ensure selection is not empty 
before creating thread"
```

### 5. Debug with Cursor
```
"The Monaco decoration isn't showing. Here's the code: [paste].
What's wrong?"
```

---

## 🐛 Common Issues & Solutions

### Monaco Not Loading
- Ensure `'use client'` directive is at top of component
- Check dynamic import has `ssr: false`
- Verify no SSR issues

### State Not Updating
- Check dispatch is being called
- Verify reducer case matches action type
- Use React DevTools to inspect state

### API Errors
- Verify `.env.local` has ANTHROPIC_API_KEY
- Check API key is valid
- Look at Network tab for detailed errors

### Decorations Not Showing
- Ensure Monaco editor ref is set
- Check decoration options syntax
- Verify CSS classes exist in globals.css

### Streaming Not Working
- Check API route returns proper streaming response
- Verify fetch is not awaiting entire response
- Ensure reader.read() loop is correct

---

## ✅ Testing Checklist

After each step, test:

- [ ] Feature works in happy path
- [ ] Edge cases handled (empty input, long text, etc.)
- [ ] UI feedback is clear (loading states, errors)
- [ ] No console errors
- [ ] State updates correctly
- [ ] localStorage persists properly

---

## 🚀 Development Workflow

1. **Pick a step** from the roadmap
2. **Read the spec** and understand requirements
3. **Use Cursor Chat** to generate initial code
4. **Review and refine** the generated code
5. **Test thoroughly** before moving on
6. **Commit your changes** with clear message
7. **Move to next step**

---

## 📊 Time Estimates

| Step | Estimated Time | Priority |
|------|----------------|----------|
| 1. Selection Handling | 30-45 min | ⚡ Critical |
| 2. Thread Creation | 30-45 min | ⚡ Critical |
| 3. Monaco Decorations | 45-60 min | ⚡ Critical |
| 4. API Integration | 60-90 min | ⚡ Critical |
| 5. Thread Panel | 30-45 min | ⚡ Critical |
| 6. Keyboard Shortcuts | 15-30 min | 🎯 Important |
| 7. Session Management | 30-45 min | 🎯 Important |
| 8. Export | 20-30 min | 🎯 Important |
| **Core Total** | **4-6 hours** | |
| Bonus Features | 2-3 hours | 💡 Nice-to-have |

---

## 🎯 Success Criteria

You're done when:

✅ Can paste code into editor
✅ Can select code and create thread
✅ AI responds with contextual feedback
✅ Multiple threads work independently
✅ Threads are visually highlighted
✅ Can save and load sessions
✅ Can export to markdown
✅ No major bugs or console errors

---

Happy coding! 🚀

For questions, refer to the main PRD (`code-review-assistant-prd.md`) for detailed specs.
