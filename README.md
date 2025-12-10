# CodeReview.ai - AI-Powered Inline Code Review

Get instant, contextual AI feedback on your code with inline comment threads.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

Get your API key from: https://console.anthropic.com/

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✨ Features

- 🎨 **CodeMirror Editor** - Fast, lightweight editor with syntax highlighting for 50+ languages
- 💬 **Inline Comment Threads** - Tied to specific code sections with visual highlights
- 🤖 **AI-Powered Reviews** - Using Claude 3.5 Sonnet with streaming responses
- 🔄 **Real-time Streaming** - See AI responses as they're generated character by character
- 📦 **Multiple Threads** - Independent conversations on different code sections
- 💾 **Auto-Save** - Sessions automatically persist in localStorage
- 🎯 **Context-Aware** - AI sees full file context for better feedback
- ⌨️ **Keyboard Shortcuts** - Press `Cmd+K` (or `Ctrl+K`) to quickly create threads
- 🎨 **Theme Toggle** - Switch between light and dark themes
- 🔍 **Language Auto-Detection** - Automatically detects programming language from code
- 📤 **Export to Markdown** - Export all threads and conversations as markdown reports
- 💾 **Session Management** - Load, save, and manage multiple review sessions

## 📖 Usage

1. **Paste Code**: Copy your code into the CodeMirror editor
2. **Select Section**: Highlight specific lines you want reviewed
3. **Ask AI**: Press `Cmd+K` or click "Ask AI"
4. **Get Feedback**: AI analyzes your code and provides contextual suggestions
5. **Continue Conversation**: Ask follow-up questions in the thread
6. **Create More Threads**: Select different sections for independent reviews

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Editor**: CodeMirror 6 (@uiw/react-codemirror)
- **AI**: Anthropic Claude 3.5 Sonnet
- **Styling**: Tailwind CSS
- **State**: React Context + useReducer
- **Persistence**: localStorage

## 📁 Project Structure

```
code-review-ai/
├── app/
│   ├── api/
│   │   └── review/
│   │       └── route.ts          # AI API endpoint with streaming
│   ├── globals.css               # Global styles + thread decorations
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── components/
│   ├── providers/
│   │   └── CodeReviewProvider.tsx # State management with auto-save
│   ├── CodeEditor.tsx            # CodeMirror editor with selection & decorations
│   ├── CommentThread.tsx         # Thread conversation UI with streaming
│   ├── Header.tsx                # Top navigation with export & theme toggle
│   ├── ThreadPanel.tsx           # Thread sidebar with active thread view
│   ├── SelectionActionMenu.tsx   # Floating menu for code selection
│   ├── ThreadCreationDialog.tsx  # Dialog to create new threads
│   ├── SessionManager.tsx        # Session load/delete management
│   └── __tests__/                # Component unit tests
├── lib/
│   ├── types.ts                  # TypeScript definitions
│   ├── utils.ts                  # Utility functions (detection, formatting)
│   ├── storage.ts                # localStorage helpers
│   └── __tests__/                # Utility unit tests
├── jest.config.js                # Jest test configuration
├── jest.setup.js                 # Jest setup with mocks
├── .env.example                  # Environment template
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
└── tsconfig.json                 # TypeScript config
```

## ✅ What's Implemented

### Core Features
- ✅ **Selection Handling** - Capture and track user text selection in CodeMirror Editor
- ✅ **Thread Creation Flow** - Dialog to create new threads from code selection
- ✅ **CodeMirror Decorations** - Colored highlights and gutter icons for thread ranges
- ✅ **CommentThread Component** - Full conversation UI with message history
- ✅ **AI Integration** - Connected to Claude API with streaming responses
- ✅ **Message Streaming** - Real-time character-by-character response updates
- ✅ **Multiple Threads** - Independent conversations on different code sections
- ✅ **Thread Management** - Switch, resolve, and delete threads
- ✅ **Active Thread Highlighting** - Visual distinction for active thread

### Enhanced Features
- ✅ **Keyboard Shortcuts** - `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to create threads
- ✅ **Language Auto-Detection** - Automatically detects language from code patterns
- ✅ **Export Functionality** - Export all threads and conversations as markdown
- ✅ **Session Management** - Load, save, and delete multiple review sessions
- ✅ **Theme Toggle** - Switch between light and dark themes with persistence
- ✅ **Auto-Save** - Debounced auto-save to localStorage
- ✅ **Error Handling** - User-friendly error messages and recovery
- ✅ **Markdown Rendering** - AI responses rendered with proper markdown formatting
- ✅ **Code Copy Button** - Quick copy for selected code snippets

### Testing
- ✅ **Unit Tests** - 39 tests covering utilities and components
- ✅ **Test Configuration** - Jest with React Testing Library setup
- ✅ **All Tests Passing** - 100% test success rate

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Verify everything (lint, build, tests):

```bash
npm run verify
```

### Test Coverage

- **Utilities**: Language detection, text formatting, selection extraction, storage operations
- **Components**: SelectionActionMenu, ThreadCreationDialog, CommentThread, ThreadPanel
- **All 39 tests passing** with comprehensive coverage

## 💡 Development Tips

### Debugging

- Check browser console for errors
- Verify API key is set correctly in `.env.local`
- Use React DevTools to inspect state
- Check Network tab for API calls
- Use CodeMirror Editor's built-in debugging tools

### Code Structure

- **State Management**: Centralized in `CodeReviewProvider` using Context + Reducer
- **Type Safety**: All types defined in `lib/types.ts`
- **Utilities**: Reusable functions in `lib/utils.ts`
- **Storage**: localStorage operations in `lib/storage.ts`

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run verify` - Run lint, build, and tests (all checks)

## 🎯 How It Works

1. **Code Selection**: Select code in the CodeMirror editor
2. **Thread Creation**: Press `Cmd+K` or click "Ask AI" to create a thread
3. **AI Review**: Ask questions and get streaming AI responses
4. **Multiple Threads**: Create independent threads for different code sections
5. **Visual Indicators**: Threads are highlighted with colors in the editor
6. **Session Management**: All work is auto-saved and can be loaded later
7. **Export**: Generate markdown reports of all review conversations

## 🤝 Future Enhancements

Potential features for future development:

- Real-time collaboration (Yjs)
- GitHub PR integration
- VS Code extension
- Team features with authentication
- Multi-file support
- Diff view for AI suggestions
- Code refactoring suggestions with apply button

## 📄 License

MIT

---

**Built for the Automattic Code Review Challenge**

Implementation complete! 🎉 All features from the PRD have been implemented and tested.
