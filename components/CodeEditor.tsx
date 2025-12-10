'use client';

import { useCodeReview } from './providers/CodeReviewProvider';
import { SelectionActionMenu } from './SelectionActionMenu';
import { ThreadCreationDialog } from './ThreadCreationDialog';
import { generateId, getNextThreadColor, extractSelection, detectLanguage } from '@/lib/utils';
import { CodeThread } from '@/lib/types';
import dynamic from 'next/dynamic';
import { useRef, useState, useEffect, useMemo } from 'react';
import { truncateText } from '@/lib/utils';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView, ViewUpdate, Decoration, DecorationSet, WidgetType, ViewPlugin } from '@codemirror/view';
import { EditorState, Extension, StateField, StateEffect, RangeSetBuilder } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';

// CodeMirror is loaded dynamically (client-side only)
const CodeMirrorEditor = dynamic(() => Promise.resolve(CodeMirror), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full flex-col gap-2">
      <div className="text-secondary">Loading editor...</div>
      <div className="text-xs text-secondary/60 text-center max-w-md px-4">
        First load may take a few seconds. Subsequent loads are faster.
      </div>
    </div>
  ),
});

// Helper to get language extension
function getLanguageExtension(language: string): Extension {
  switch (language) {
    case 'javascript':
    case 'js':
    case 'jsx':
      return javascript({ jsx: true });
    case 'typescript':
    case 'ts':
    case 'tsx':
      return javascript({ jsx: true, typescript: true });
    case 'python':
    case 'py':
      return python();
    case 'json':
      return json();
    case 'html':
      return html();
    case 'css':
      return css();
    default:
      return [];
  }
}

// Thread decoration widget
class ThreadWidget extends WidgetType {
  constructor(private color: string, private isActive: boolean) {
    super();
  }

  toDOM() {
    const span = document.createElement('span');
    span.className = `thread-glyph-${this.color}`;
    span.style.cssText = `
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-right: 4px;
      ${this.isActive ? 'opacity: 1;' : 'opacity: 0.7;'}
    `;
    return span;
  }
}

// Helper to convert 1-indexed line/column to CodeMirror position
function getPosition(state: EditorState, line: number, column: number): number {
  try {
    const lineObj = state.doc.line(line);
    return lineObj.from + column - 1;
  } catch {
    return 0;
  }
}

// Create decoration for thread highlight
function createThreadDecoration(thread: CodeThread, isActive: boolean, state: EditorState): { decoration: Decoration; from: number; to: number } {
  const from = getPosition(state, thread.startLine, thread.startColumn);
  const to = getPosition(state, thread.endLine, thread.endColumn);
  
  const className = `thread-highlight-${thread.color}${isActive ? ' thread-highlight-active' : ''}`;
  
  const decoration = Decoration.mark({
    class: className,
    attributes: {
      title: `Thread: ${truncateText(thread.messages[0]?.content || '', 50)}`,
    },
  });
  
  return { decoration, from, to };
}

// Create gutter decoration for thread
function createGutterDecoration(thread: CodeThread, isActive: boolean, state: EditorState): { decoration: Decoration | null; from: number; to: number } {
  try {
    const line = state.doc.line(thread.startLine);
    const decoration = Decoration.widget({
      widget: new ThreadWidget(thread.color, isActive),
      side: -1,
    });
    
    return { decoration, from: line.from, to: line.from };
  } catch {
    return { decoration: null, from: 0, to: 0 };
  }
}

// Thread decorations state field
const threadDecorations = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    return decorations;
  },
  provide: f => EditorView.decorations.from(f),
});

// Effect to update thread decorations
const setThreadDecorations = StateEffect.define<{ threads: CodeThread[]; activeThreadId: string | null }>();

// Plugin to handle thread decorations
const threadDecorationsPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = Decoration.none;
    }

    update(update: ViewUpdate) {
      for (const tr of update.transactions) {
        const threadData = tr.effects.find(e => e.is(setThreadDecorations));
        if (threadData) {
          const { threads, activeThreadId } = threadData.value;
          const builder = new RangeSetBuilder<Decoration>();
          
          threads.forEach(thread => {
            const isActive = thread.id === activeThreadId;
            try {
              const { decoration: markDeco, from, to } = createThreadDecoration(thread, isActive, update.state);
              builder.add(from, to, markDeco);
              
              const { decoration: gutterDeco, from: gutterFrom, to: gutterTo } = createGutterDecoration(thread, isActive, update.state);
              if (gutterDeco) {
                builder.add(gutterFrom, gutterTo, gutterDeco);
              }
            } catch (e) {
              // Skip invalid ranges
              console.warn('Invalid thread range:', thread, e);
            }
          });
          
          this.decorations = builder.finish();
        }
      }
    }
  },
  {
    decorations: v => v.decorations,
  }
);

export function CodeEditor() {
  const { state, dispatch } = useCodeReview();
  const viewRef = useRef<EditorView | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({ top: 0, left: 0 });
  const [showThreadDialog, setShowThreadDialog] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Set timeout to show warning only if editor truly fails to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 30000); // 30 second timeout

    return () => clearTimeout(timer);
  }, []);

  // Language extension
  const languageExtension = useMemo(() => {
    return getLanguageExtension(state.editorLanguage);
  }, [state.editorLanguage]);

  // Theme extension
  const themeExtension = useMemo(() => {
    return state.editorTheme === 'vs-dark' ? oneDark : [];
  }, [state.editorTheme]);

  // Thread decorations extension
  const threadDecorationsExtension = useMemo(() => {
    return [
      threadDecorations,
      threadDecorationsPlugin,
    ];
  }, []);

  // Update thread decorations when threads change
  useEffect(() => {
    if (!viewRef.current || !state.currentSession) return;
    
    const threads = state.currentSession.threads || [];
    const activeThreadId = state.activeThreadId;
    
    if (threads.length > 0) {
      viewRef.current.dispatch({
        effects: setThreadDecorations.of({ threads, activeThreadId }),
      });
    }
  }, [state.currentSession, state.activeThreadId]);

  const handleEditorChange = (value: string) => {
    // Auto-detect language if code changes significantly
    const detectedLanguage = detectLanguage(value, state.currentSession?.fileName);
    dispatch({
      type: 'SET_CODE',
      payload: {
        code: value,
        language: detectedLanguage,
      },
    });
  };

  const handleSelectionChange = (update: ViewUpdate) => {
    if (!update.selectionSet) return;
    
    const selection = update.state.selection.main;
    if (selection.empty) {
      dispatch({ type: 'SET_SELECTION', payload: null });
      setShowActionMenu(false);
      return;
    }

    const selectedText = update.state.sliceDoc(selection.from, selection.to);
    if (!selectedText.trim()) {
      dispatch({ type: 'SET_SELECTION', payload: null });
      setShowActionMenu(false);
      return;
    }

    // Convert 0-indexed positions to 1-indexed line/column
    const startLine = update.state.doc.lineAt(selection.from);
    const endLine = update.state.doc.lineAt(selection.to);
    
    const startLineNumber = startLine.number;
    const startColumn = selection.from - startLine.from + 1;
    const endLineNumber = endLine.number;
    const endColumn = selection.to - endLine.from + 1;

    dispatch({
      type: 'SET_SELECTION',
      payload: {
        startLine: startLineNumber,
        endLine: endLineNumber,
        startColumn,
        endColumn,
      },
    });

    // Show action menu near selection
    const coords = update.view.coordsAtPos(selection.to);
    if (coords) {
      setActionMenuPosition({ 
        top: coords.top + window.scrollY + 20, 
        left: coords.left + window.scrollX + 10 
      });
      setShowActionMenu(true);
    }
  };

  const handleAskAI = () => {
    setShowActionMenu(false);
    setShowThreadDialog(true);
  };

  const handleCancelAction = () => {
    setShowActionMenu(false);
    dispatch({ type: 'SET_SELECTION', payload: null });
  };

  const handleCreateThread = (message: string) => {
    if (!state.currentSession || !state.selectedRange) return;

    const selectedCode = extractSelection(
      state.currentSession.code,
      state.selectedRange.startLine,
      state.selectedRange.startColumn,
      state.selectedRange.endLine,
      state.selectedRange.endColumn
    );

    const thread: CodeThread = {
      id: generateId(),
      startLine: state.selectedRange.startLine,
      endLine: state.selectedRange.endLine,
      startColumn: state.selectedRange.startColumn,
      endColumn: state.selectedRange.endColumn,
      selectedCode,
      messages: [
        {
          id: generateId(),
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      color: getNextThreadColor(state.currentSession.threads),
    };

    dispatch({ type: 'CREATE_THREAD', payload: thread });
    setShowThreadDialog(false);
  };

  const handleCloseThreadDialog = () => {
    setShowThreadDialog(false);
    dispatch({ type: 'SET_SELECTION', payload: null });
  };

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (state.selectedRange && state.currentSession) {
          setShowThreadDialog(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedRange, state.currentSession]);

  const selectedCode = state.selectedRange && state.currentSession
    ? extractSelection(
        state.currentSession.code,
        state.selectedRange.startLine,
        state.selectedRange.startColumn,
        state.selectedRange.endLine,
        state.selectedRange.endColumn
      )
    : '';

  // Extensions for CodeMirror
  const extensions = useMemo(() => {
    return [
      languageExtension,
      themeExtension,
      ...threadDecorationsExtension,
      EditorView.theme({
        '&': {
          fontSize: '14px',
          fontFamily: 'Fira Code, Menlo, Monaco, Courier New, monospace',
        },
        '.cm-content': {
          padding: '16px',
        },
        '.cm-editor': {
          height: '100%',
        },
        '.cm-scroller': {
          overflow: 'auto',
        },
      }),
      EditorState.tabSize.of(2),
      EditorView.lineWrapping,
    ];
  }, [languageExtension, themeExtension, threadDecorationsExtension]);

  if (loadingTimeout) {
    return (
      <div className="flex items-center justify-center h-full flex-col gap-4">
        <div className="text-warning text-lg">Editor is taking longer than expected</div>
        <div className="text-sm text-secondary max-w-md text-center">
          If the editor hasn&apos;t loaded after 30 seconds, there may be an issue:
          <ul className="list-disc list-inside mt-2 text-left">
            <li>Check browser console for errors (F12)</li>
            <li>Check Network tab for failed requests</li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <CodeMirrorEditor
        value={state.currentSession?.code || '// Paste your code here or start typing...'}
        height="100%"
        extensions={extensions}
        onChange={handleEditorChange}
        onUpdate={(update) => {
          if (update.view && !viewRef.current) {
            viewRef.current = update.view;
            setLoadingTimeout(false);
          }
          handleSelectionChange(update);
        }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
        }}
      />
      {showActionMenu && state.selectedRange && (
        <SelectionActionMenu
          position={actionMenuPosition}
          onAskAI={handleAskAI}
          onCancel={handleCancelAction}
        />
      )}
      {showThreadDialog && state.selectedRange && (
        <ThreadCreationDialog
          selectedCode={selectedCode}
          lineRange={{
            start: state.selectedRange.startLine,
            end: state.selectedRange.endLine,
          }}
          onClose={handleCloseThreadDialog}
          onSubmit={handleCreateThread}
        />
      )}
    </div>
  );
}
