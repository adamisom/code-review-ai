'use client';

import { useCodeReview } from './providers/CodeReviewProvider';

export function Header() {
  const { state, dispatch } = useCodeReview();

  const handleNewSession = () => {
    if (confirm('Start a new session? Current work will be saved.')) {
      dispatch({ type: 'NEW_SESSION' });
    }
  };

  return (
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
        <button className="px-3 py-1.5 text-sm border border-border rounded hover:bg-border/50 transition">
          Load Session
        </button>
        <button className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary/90 transition">
          Export
        </button>
      </div>
    </header>
  );
}
