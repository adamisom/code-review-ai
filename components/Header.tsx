'use client';

import { useState, useEffect } from 'react';
import { useCodeReview } from './providers/CodeReviewProvider';
import { SessionManager } from './SessionManager';

export function Header() {
  const { state, dispatch } = useCodeReview();
  const [showSessionManager, setShowSessionManager] = useState(false);

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
    // Save theme preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('code-review-theme', newTheme);
    }
  };

  // Load theme preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('code-review-theme');
      if (savedTheme === 'vs-dark' || savedTheme === 'vs-light') {
        dispatch({ type: 'SET_THEME', payload: savedTheme });
      }
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

  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">CodeReview.ai</h1>
          {state.currentSession && (
            <span className="text-sm text-secondary">
              {state.currentSession.fileName || 'Untitled'} • {state.editorLanguage}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
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
