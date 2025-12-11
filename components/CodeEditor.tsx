'use client';

import { useCodeReview } from './providers/CodeReviewProvider';
import { ThreadCreationDialog } from './ThreadCreationDialog';
import { generateId, getNextThreadColor, extractSelection, detectLanguage } from '@/lib/utils';
import { CodeThread } from '@/lib/types';
import dynamic from 'next/dynamic';
import { useRef, useState, useEffect, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView, ViewUpdate, placeholder } from '@codemirror/view';
import { Extension, EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { createThreadDecorationsExtension, setThreadDecorations } from '@/lib/codemirror/threadDecorations';

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
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'js':
      return javascript({ jsx: false });
    case 'jsx':
      return javascript({ jsx: true });
    case 'typescript':
    case 'ts':
      return javascript({ jsx: false, typescript: true });
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


export function CodeEditor() {
  const { state, dispatch } = useCodeReview();
  const viewRef = useRef<EditorView | null>(null);
  const [showThreadDialog, setShowThreadDialog] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false); // Track if editor has ever loaded
  const isSelectingRef = useRef(false); // Track if user is actively selecting with mouse

  // Set timeout to show warning only if editor truly fails to load (only on initial mount)
  useEffect(() => {
    // If editor already loaded, never show timeout
    if (hasLoadedRef.current || viewRef.current) {
      setLoadingTimeout(false);
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set timeout on initial mount if editor hasn't loaded
    timeoutRef.current = setTimeout(() => {
      // Only show timeout if editor still hasn't loaded
      if (!hasLoadedRef.current && !viewRef.current) {
        setLoadingTimeout(true);
      }
    }, 10000); // 10 second timeout - CodeMirror should load much faster

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []); // Empty deps - only run on mount

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
    return createThreadDecorationsExtension();
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
    // Auto-detect language only if currently plaintext (don't override manual selection)
    let language = state.editorLanguage;
    if (language === 'plaintext' || !state.currentSession) {
      language = detectLanguage(value, state.currentSession?.fileName);
    }
    
      dispatch({
        type: 'SET_CODE',
        payload: {
          code: value,
        language: language,
        fileName: state.currentSession?.fileName,
        },
      });
  };

  const handleSelectionChange = (update: ViewUpdate) => {
    if (!update.selectionSet) return;
    
    const selection = update.state.selection.main;
    if (selection.empty) {
      dispatch({ type: 'SET_SELECTION', payload: null });
      return;
    }

    const selectedText = update.state.sliceDoc(selection.from, selection.to);
    if (!selectedText.trim()) {
      dispatch({ type: 'SET_SELECTION', payload: null });
      return;
    }

    // Auto-scroll to keep selection visible during drag
    if (update.view && !selection.empty) {
      try {
        const coords = update.view.coordsAtPos(selection.to);
        if (coords) {
          const rect = update.view.scrollDOM.getBoundingClientRect();
          const viewportTop = rect.top;
          const viewportBottom = rect.bottom;
          const margin = 60; // 60px margin
          
          // Scroll if selection end is near viewport edges
          if (coords.top < viewportTop + margin) {
            // Scroll up to show selection
            update.view.scrollDOM.scrollBy({
              top: coords.top - viewportTop - margin,
              behavior: 'auto',
            });
          } else if (coords.top > viewportBottom - margin) {
            // Scroll down to show selection
            update.view.scrollDOM.scrollBy({
              top: coords.top - viewportBottom + margin,
              behavior: 'auto',
            });
          }
        }
      } catch (e) {
        // Ignore scroll errors
      }
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

    // Don't automatically show menu on selection - only show when explicitly triggered
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

  // Listen for "Analyze Code" button click or Cmd+A+I shortcut
  useEffect(() => {
    const handleAnalyzeCode = () => {
      if (!state.currentSession || !state.currentSession.code) return;
      
      // If there's a selection, use it; otherwise select all
      if (!state.selectedRange && viewRef.current) {
        // Select all code
        const code = state.currentSession.code;
        const startPos = 0;
        const endPos = code.length;
        
        viewRef.current.dispatch({
          selection: { anchor: startPos, head: endPos },
        });
        
        // Set selection in state
        const startLine = viewRef.current.state.doc.lineAt(startPos);
        const endLine = viewRef.current.state.doc.lineAt(endPos);
        
        dispatch({
          type: 'SET_SELECTION',
          payload: {
            startLine: startLine.number,
            endLine: endLine.number,
            startColumn: 1,
            endColumn: endLine.length + 1,
          },
        });
      }
      
      // Open thread creation dialog if there's a selection
      if (state.selectedRange) {
        setShowThreadDialog(true);
      } else {
        // Wait a bit for selection to be set, then open dialog
        setTimeout(() => {
          if (state.selectedRange) {
            setShowThreadDialog(true);
          }
        }, 100);
      }
    };

    // Keyboard shortcut: Cmd+A+I (or Ctrl+A+I) - detect sequence
    let waitingForI = false;
    let sequenceTimeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.metaKey || e.ctrlKey;
      
      // Clear any existing timeout
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
      }

      // If Cmd/Ctrl+A is pressed, wait for I
      if (isModifier && (e.key === 'a' || e.key === 'A')) {
        waitingForI = true;
        sequenceTimeout = setTimeout(() => {
          waitingForI = false;
        }, 1000); // Reset after 1 second
      } 
      // If we're waiting for I and Cmd/Ctrl+I is pressed
      else if (waitingForI && isModifier && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        waitingForI = false;
        if (sequenceTimeout) clearTimeout(sequenceTimeout);
        handleAnalyzeCode();
      } 
      // Reset if any other key is pressed
      else if (!isModifier) {
        waitingForI = false;
      }
    };

    window.addEventListener('analyze-code', handleAnalyzeCode);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('analyze-code', handleAnalyzeCode);
      window.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimeout) clearTimeout(sequenceTimeout);
    };
  }, [state.currentSession, state.selectedRange, dispatch]);


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
    const code = state.currentSession?.code || '';
    const isDark = state.editorTheme === 'vs-dark';
    return [
      languageExtension,
      themeExtension,
      ...threadDecorationsExtension,
      placeholder('// Paste your code here or start typing...'),
      EditorView.theme({
        '&': {
          fontSize: '14px',
          fontFamily: 'Fira Code, Menlo, Monaco, Courier New, monospace',
        },
        '.cm-content': {
          padding: '16px',
          backgroundColor: 'var(--editor-bg)',
          caretColor: 'var(--foreground)',
        },
        '.cm-editor': {
          height: '100%',
          backgroundColor: 'var(--editor-bg)',
        },
        '.cm-scroller': {
          overflow: 'auto',
          backgroundColor: 'var(--editor-bg)',
        },
        '.cm-selectionBackground': {
          background: 'var(--selection-bg) !important',
          opacity: '1 !important',
        },
        '.cm-selectionMatch': {
          backgroundColor: 'var(--selection-bg) !important',
          opacity: '1 !important',
        },
        '.cm-focused .cm-selectionBackground': {
          background: 'var(--selection-bg) !important',
          opacity: '1 !important',
        },
        '.cm-selectionLayer .cm-selectionBackground': {
          background: 'var(--selection-bg) !important',
          opacity: '1 !important',
        },
        // Ensure selection is visible during drag
        '.cm-selection': {
          background: 'var(--selection-bg) !important',
          opacity: '1 !important',
        },
      }),
      EditorState.tabSize.of(2),
      EditorView.lineWrapping,
    ];
  }, [languageExtension, themeExtension, threadDecorationsExtension, state.currentSession?.code, state.editorTheme]);

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
        value={state.currentSession?.code || ''}
        height="100%"
        extensions={extensions}
        onChange={handleEditorChange}
        onUpdate={(update) => {
          if (update.view && !viewRef.current) {
            viewRef.current = update.view;
            hasLoadedRef.current = true; // Mark as loaded
            setLoadingTimeout(false);
            // Clear timeout since editor has loaded
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
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
