'use client';

import { CodeReviewProvider } from '@/components/providers/CodeReviewProvider';
import { CodeEditor } from '@/components/CodeEditor';
import { ThreadPanel } from '@/components/ThreadPanel';
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <CodeReviewProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <Header />
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
