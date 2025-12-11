'use client';

import { CodeReviewProvider, useCodeReview } from '@/components/providers/CodeReviewProvider';
import { CodeEditor } from '@/components/CodeEditor';
import { ThreadPanel } from '@/components/ThreadPanel';
import { Header } from '@/components/Header';
import { useState, useEffect, useRef } from 'react';

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

const MIN_PANEL_WIDTH = 384; // w-96 = 384px (current width)
const DEFAULT_PANEL_WIDTH = 512; // Wider default

export default function Home() {
  // Start with default width to avoid hydration mismatch
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Load saved width after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('threadPanelWidth');
    if (saved) {
      const width = parseInt(saved, 10);
      if (width >= MIN_PANEL_WIDTH) {
        setPanelWidth(width);
      }
    }
  }, []);

  // Save width to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('threadPanelWidth', panelWidth.toString());
    }
  }, [panelWidth, isMounted]);

  // Handle mouse move for resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= MIN_PANEL_WIDTH) {
        setPanelWidth(newWidth);
      } else {
        setPanelWidth(MIN_PANEL_WIDTH);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <CodeReviewProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <Header />
        <ErrorDisplay />
        <main className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CodeEditor />
          </div>
          <div
            ref={resizeRef}
            className="relative border-l border-border overflow-hidden bg-background"
            style={{ width: `${panelWidth}px`, minWidth: `${MIN_PANEL_WIDTH}px` }}
          >
            {/* Resize handle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-10"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
              }}
            />
            <ThreadPanel />
          </div>
        </main>
      </div>
    </CodeReviewProvider>
  );
}
