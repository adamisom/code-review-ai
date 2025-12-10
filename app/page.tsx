'use client';

import { CodeReviewProvider, useCodeReview } from '@/components/providers/CodeReviewProvider';
import { CodeEditor } from '@/components/CodeEditor';
import { ThreadPanel } from '@/components/ThreadPanel';
import { Header } from '@/components/Header';

function ErrorDisplay() {
  const { state, dispatch } = useCodeReview();

  if (!state.error) return null;

  return (
    <div className="px-6 py-3 bg-danger/20 border-b border-danger">
      <div className="flex items-center justify-between">
        <p className="text-danger text-sm">{state.error}</p>
        <button
          onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
          className="text-danger hover:text-danger/80 text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <CodeReviewProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <Header />
        <ErrorDisplay />
        <main className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CodeEditor />
          </div>
          <div className="w-96 border-l border-border overflow-hidden">
            <ThreadPanel />
          </div>
        </main>
      </div>
    </CodeReviewProvider>
  );
}
