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

- 🎨 **Monaco Editor** - VS Code's editor with syntax highlighting for 50+ languages
- 💬 **Inline Comment Threads** - Tied to specific code sections
- 🤖 **AI-Powered Reviews** - Using Claude 3.5 Sonnet
- 🔄 **Real-time Streaming** - See responses as they're generated
- 📦 **Multiple Threads** - Independent conversations on different code sections
- 💾 **Auto-Save** - Sessions persist in localStorage
- 🎯 **Context-Aware** - AI sees full file for better feedback

## 📖 Usage

1. **Paste Code**: Copy your code into the Monaco editor
2. **Select Section**: Highlight specific lines you want reviewed
3. **Ask AI**: Press `Cmd+K` or click "Ask AI"
4. **Get Feedback**: AI analyzes your code and provides contextual suggestions
5. **Continue Conversation**: Ask follow-up questions in the thread
6. **Create More Threads**: Select different sections for independent reviews

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Editor**: Monaco Editor (@monaco-editor/react)
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
│   │       └── route.ts          # AI API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── components/
│   ├── providers/
│   │   └── CodeReviewProvider.tsx # State management
│   ├── CodeEditor.tsx            # Monaco editor wrapper
│   ├── Header.tsx                # Top navigation
│   └── ThreadPanel.tsx           # Thread sidebar
├── lib/
│   ├── types.ts                  # TypeScript definitions
│   ├── utils.ts                  # Utility functions
│   └── storage.ts                # localStorage helpers
├── .env.example                  # Environment template
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
└── tsconfig.json                 # TypeScript config
```

## 🔨 What's Implemented (Scaffold)

✅ Project structure and configuration
✅ Type definitions for all data models
✅ State management with Context + Reducer
✅ API route with Claude streaming
✅ localStorage persistence
✅ Basic UI components (Header, ThreadPanel)
✅ Monaco Editor integration
✅ Utility functions (language detection, formatting, etc.)

## 🚧 To Be Implemented

The following features are stubbed out and ready for implementation:

### Core Features (Priority)
- [ ] **Selection Handling** - Capture user text selection in Monaco
- [ ] **Thread Creation Flow** - Dialog to create new thread from selection
- [ ] **Monaco Decorations** - Highlight thread ranges with colors
- [ ] **CommentThread Component** - Display conversation UI
- [ ] **AI Integration** - Connect thread messages to API route
- [ ] **Message Streaming** - Real-time response updates

### Bonus Features
- [ ] **Language Auto-Detection** - Detect from code patterns
- [ ] **Diff View** - Show before/after for AI suggestions
- [ ] **Keyboard Shortcuts** - Cmd+K for quick comment
- [ ] **Export Functionality** - Generate markdown report
- [ ] **Session Management** - Load previous sessions
- [ ] **Theme Toggle** - Light/dark mode

## 🎯 Next Steps for Development

### Phase 1: Core Selection & Thread Creation (1-2 hours)

1. **Implement Selection Handling in CodeEditor**
   - Add `onDidChangeCursorSelection` listener
   - Store selection in state
   - Show selection action menu

2. **Create ThreadCreationDialog Component**
   - Modal to capture initial user question
   - Show selected code preview
   - Create thread on submit

3. **Build CommentThread Component**
   - Display message history
   - Input field for user messages
   - Show loading state

### Phase 2: AI Integration (1-2 hours)

1. **Connect Messages to API**
   - Call `/api/review` on message send
   - Handle streaming response
   - Update message content in real-time

2. **Error Handling**
   - API failures
   - Network timeouts
   - Rate limits

### Phase 3: Visual Indicators (1-2 hours)

1. **Monaco Decorations**
   - Add colored highlights for thread ranges
   - Gutter icons showing thread count
   - Click decoration to open thread

2. **Thread Management**
   - Switch between threads
   - Update active thread visual state
   - Handle overlapping selections

### Phase 4: Polish & Bonus (2-3 hours)

1. **Session Management**
   - Load previous sessions dialog
   - Delete sessions
   - Export to markdown

2. **Enhancements**
   - Language auto-detection
   - Keyboard shortcuts
   - Diff view for suggestions

## 💡 Development Tips

### Using Cursor AI

This scaffold is designed to work well with Cursor. Here are some tips:

1. **Start with Core Features**: Implement selection handling first
2. **Use Types**: All TypeScript types are defined in `lib/types.ts`
3. **Reference PRD**: See `code-review-assistant-prd.md` for detailed specs
4. **Test Incrementally**: Build and test one feature at a time
5. **Use Existing Patterns**: Follow the structure in stub components

### Debugging

- Check browser console for errors
- Verify API key is set correctly
- Use React DevTools to inspect state
- Check Network tab for API calls

## 🤝 Contributing

This is a challenge project, but feel free to extend it! Some ideas:

- Real-time collaboration (Yjs)
- GitHub PR integration
- VS Code extension
- Team features with authentication
- Multi-file support

## 📄 License

MIT

---

**Built for the Automattic Code Review Challenge**

Ready to build! 🚀 Check the PRD for detailed implementation guidance.
