'use client';

import { useState, useEffect, useRef } from 'react';
import { useCodeReview } from './providers/CodeReviewProvider';
import { SessionManager } from './SessionManager';

export function Header() {
  const { state, dispatch } = useCodeReview();
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleNewSession = () => {
    if (confirm('Start a new session? Current work will be saved.')) {
      dispatch({ type: 'NEW_SESSION' });
    }
  };

  const handleLoadSession = (session: any) => {
    dispatch({ type: 'LOAD_SESSION', payload: session });
  };

  const handleThemeToggle = () => {
    const newTheme = state.editorTheme === 'vs-dark' ? 'vs-light' : 'vs-dark';
    dispatch({ type: 'SET_THEME', payload: newTheme });
    // Update CSS theme variable
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme === 'vs-dark' ? 'dark' : 'light');
      localStorage.setItem('code-review-theme', newTheme);
    }
  };

  // Load theme preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('code-review-theme');
      const theme = savedTheme === 'vs-light' ? 'vs-light' : 'vs-dark';
      dispatch({ type: 'SET_THEME', payload: theme });
      // Set initial CSS theme variable
      document.documentElement.setAttribute('data-theme', theme === 'vs-dark' ? 'dark' : 'light');
    }
  }, [dispatch]);

  const handleExport = () => {
    if (!state.currentSession) return;

    const session = state.currentSession;
    const markdown = `# Code Review Report

## ${session.fileName || 'Untitled'}
Generated: ${new Date().toLocaleString()}

${session.threads.length === 0 ? 'No threads in this session.' : ''}

${session.threads.map((thread) => `
### Lines ${thread.startLine}-${thread.endLine}

**Code:**
\`\`\`${session.language}
${thread.selectedCode}
\`\`\`

**Discussion:**
${thread.messages.map((m) => `**${m.role === 'user' ? 'User' : 'AI'}** (${new Date(m.timestamp).toLocaleString()}):\n${m.content}`).join('\n\n---\n\n')}
`).join('\n\n---\n\n')}
  `;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review-${session.fileName || 'untitled'}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNameClick = () => {
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_FILE_NAME', payload: e.target.value });
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
    }
  };


  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold font-mono lowercase">linewise</h1>
          {state.currentSession && (
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  type="text"
                  value={state.currentSession.fileName || ''}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  placeholder="Untitled"
                  className="text-sm text-secondary bg-transparent border-b border-primary focus:outline-none focus:border-primary/80 min-w-[100px] max-w-[200px]"
                />
              ) : (
                <span
                  onClick={handleNameClick}
                  className="text-sm text-secondary cursor-pointer hover:text-foreground transition px-1 py-0.5 rounded hover:bg-border/30"
                  title="Click to edit name"
                >
                  {state.currentSession.fileName || 'Untitled'}
                </span>
              )}
              <span className="text-sm text-secondary">•</span>
              <select
                value={state.editorLanguage}
                onChange={(e) => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
                className="text-sm text-secondary bg-transparent border border-border rounded px-2 py-1 hover:bg-border/30 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                title="Select language for syntax highlighting"
              >
                <option value="plaintext">Plain Text</option>
                <option value="typescript">TypeScript</option>
                <option value="tsx">TSX (React)</option>
                <option value="javascript">JavaScript</option>
                <option value="jsx">JSX (React)</option>
                <option value="python">Python</option>
                <option value="json">JSON</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="csharp">C#</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="sql">SQL</option>
                <option value="shell">Shell</option>
                <option value="yaml">YAML</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('analyze-code'))}
              disabled={!state.selectedRange}
              className="px-4 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary/90 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
            >
              <span>🤖</span>
              <span>Analyze Code</span>
            </button>
            <span className="text-xs italic text-secondary">
              ⌘A+I / Ctrl+A+I
            </span>
          </div>
          <button
            onClick={handleNewSession}
            className="px-3 py-1.5 text-sm border border-border rounded hover:bg-border/50 transition"
          >
            New Session
          </button>
          <button
            onClick={() => setShowSessionManager(true)}
            className="px-3 py-1.5 text-sm border border-border rounded hover:bg-border/50 transition"
          >
            Load Session
          </button>
          <button
            onClick={handleThemeToggle}
            className="px-3 py-1.5 text-sm border border-border rounded hover:bg-border/50 transition"
            title={`Switch to ${state.editorTheme === 'vs-dark' ? 'light' : 'dark'} theme`}
          >
            {state.editorTheme === 'vs-dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={handleExport}
            disabled={!state.currentSession}
            className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export
          </button>
        </div>
      </header>
      <SessionManager
        isOpen={showSessionManager}
        onClose={() => setShowSessionManager(false)}
        onLoadSession={handleLoadSession}
        onNewSession={handleNewSession}
      />
    </>
  );
}
