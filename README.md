# Linewise - AI-Powered Inline Code Review

Get instant, contextual AI feedback on your code with inline comment threads.

## 🔄 Development Workflow

**Hot Reload**: Next.js automatically reloads changes - no restart needed. If changes don't appear, hard refresh (`Cmd+Shift+R` / `Ctrl+Shift+R`).

**Restart Required Only For**:
- Environment variable changes (`.env` files)
- Adding/removing npm packages (run `npm install` first)

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
- 🤖 **AI-Powered Reviews** - Using Claude Sonnet with streaming responses
- 🔄 **Real-time Streaming** - See AI responses as they're generated character by character
- 📦 **Multiple Threads** - Independent conversations on different code sections
- 💾 **Auto-Save** - Sessions automatically persist in localStorage
- 🎯 **Context-Aware** - AI sees full file context for better feedback
- ⌨️ **Keyboard Shortcuts** - `Cmd+K` (or `Ctrl+K`) to create threads, `Cmd+A+I` (or `Ctrl+A+I`) to analyze code
- 🎨 **Theme Toggle** - Switch between light and dark themes
- 🔍 **Language Auto-Detection** - Automatically detects programming language from code
- 📤 **Export to Markdown** - Export all threads and conversations as markdown reports
- 💾 **Session Management** - Load, save, and manage multiple review sessions
- 🔄 **Automatic AI Responses** - AI automatically responds when threads are created
- 📏 **Resizable Panel** - Adjustable thread panel width (drag to resize, min 384px)

## 📖 Usage

1. **Paste Code**: Copy your code into the CodeMirror editor
2. **Select Section**: Highlight specific lines you want reviewed
3. **Analyze Code**: Press `Cmd+A+I` (or `Ctrl+A+I`) or click "Analyze Code" button
4. **Get Feedback**: AI automatically analyzes your code and provides contextual suggestions
5. **Continue Conversation**: Ask follow-up questions in the thread
6. **Create More Threads**: Select different sections for independent reviews
7. **Manage Sessions**: Use "New Session", "Load Session", and "Export" buttons in the header

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
│   ├── threads/
│   │   ├── CommentThread.tsx     # Thread conversation UI with streaming
│   │   ├── CommentThreadHeader.tsx # Thread header component
│   │   ├── MessageList.tsx       # Message list with markdown rendering
│   │   ├── MessageInput.tsx      # Input field for sending messages
│   │   └── StreamingIndicator.tsx # "AI is thinking..." indicator
│   ├── CodeEditor.tsx            # CodeMirror editor with selection & decorations
│   ├── DiffView.tsx              # Side-by-side diff view for code suggestions
│   ├── Header.tsx                # Top navigation with export & theme toggle
│   ├── ThreadPanel.tsx           # Thread sidebar with active thread view
│   ├── SelectionActionMenu.tsx   # Floating menu for code selection (unused)
│   ├── ThreadCreationDialog.tsx  # Dialog to create new threads
│   ├── SessionManager.tsx        # Session load/delete management
│   └── __tests__/                # Component unit tests
├── hooks/
│   ├── useAIStreaming.ts         # Custom hook for AI streaming logic
│   └── useCodeSuggestions.ts    # Custom hook for parsing code suggestions
├── lib/
│   ├── api/
│   │   └── streaming.ts          # Streaming API client
│   ├── codemirror/
│   │   └── threadDecorations.ts  # CodeMirror extensions for thread highlights
│   ├── reducers/
│   │   └── threadReducers.ts    # Reducer helper functions
│   ├── types.ts                  # TypeScript definitions
│   ├── utils.ts                  # Utility functions (detection, formatting, diff)
│   ├── storage.ts                # localStorage helpers
│   ├── constants.ts              # Application-wide constants
│   └── __tests__/                # Unit tests (utils, storage, api, reducers)
├── docs/                         # Documentation
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

### UI/UX Improvements
- ✅ **Resizable Thread Panel** - Drag handle to adjust panel width (default 512px, min 384px)
- ✅ **Streamlined Layout** - Conversation view at top, thread list at bottom
- ✅ **Prominent Selection Highlighting** - Enhanced visual feedback during code selection
- ✅ **Automatic AI Responses** - AI responds immediately when threads are created
- ✅ **Improved Spacing** - Better padding and layout throughout the UI
- ✅ **Theme-Aware Colors** - CSS variables for easy light/dark mode switching

### Testing
- ✅ **Unit Tests** - 44 tests covering utilities and components
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
- **All 44 tests passing** with comprehensive coverage

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

1. **Code Selection**: Select code in the CodeMirror editor (selection is prominently highlighted)
2. **Thread Creation**: Press `Cmd+A+I` (or `Ctrl+A+I`) or click "Analyze Code" button
3. **Automatic AI Review**: AI automatically analyzes your code and provides streaming responses
4. **Continue Conversation**: Ask follow-up questions in the thread
5. **Multiple Threads**: Create independent threads for different code sections
6. **Visual Indicators**: Threads are highlighted with colors in the editor
7. **Session Management**: All work is auto-saved and can be loaded later
8. **Export**: Generate markdown reports of all review conversations
9. **Resize Panel**: Drag the left edge of the thread panel to adjust width

## 📚 Documentation

- **[PRD](./docs/PRD.md)** - Product requirements document (original challenge)
- **[PRD Implementation](./docs/PRD_IMPLEMENTATION.md)** - Detailed implementation-ready PRD
- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture overview
- **[Code Analysis](./docs/CODE_ANALYSIS.md)** - Complete function inventory and call sites
- **[AI Usage](./docs/AI_USAGE.md)** - Documentation of AI tools used during development

## 🤝 Future Enhancements

Potential features for future development:

- Real-time collaboration (Yjs)
- GitHub PR integration
- VS Code extension
- Team features with authentication
- Multi-file support
- Enhanced error handling and retry logic
- E2E testing with Playwright
- Accessibility improvements

## 📄 License

MIT

---

**Built for the Automattic Code Review Challenge**

## ✅ Implementation Status

**Core Requirements**: ✅ Complete  
All core requirements from PRD.md have been implemented:
- ✅ Code editor interface with syntax highlighting
- ✅ Selection-based interaction
- ✅ Contextual AI responses with full file context
- ✅ Inline conversation threads tied to code sections
- ✅ Multiple independent conversation threads

**Recent Improvements**:
- ✅ Refactored from Monaco Editor to CodeMirror 6 for faster loading
- ✅ Added resizable thread panel
- ✅ Improved UI/UX with streamlined layout
- ✅ Enhanced selection highlighting
- ✅ Automatic AI responses on thread creation
- ✅ Fixed hydration errors and layout issues
- ✅ Code suggestions and diff view with apply functionality
- ✅ Language dropdown for syntax highlighting
