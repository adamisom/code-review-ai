'use client';

import { useCodeReview } from './providers/CodeReviewProvider';
import { SelectionActionMenu } from './SelectionActionMenu';
import { ThreadCreationDialog } from './ThreadCreationDialog';
import { generateId, getNextThreadColor, extractSelection, detectLanguage } from '@/lib/utils';
import { CodeThread, Message } from '@/lib/types';
import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';
import type { editor } from 'monaco-editor';
import { truncateText } from '@/lib/utils';

// Monaco Editor is loaded dynamically (client-side only)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-secondary">Loading editor...</div>
    </div>
  ),
});

export function CodeEditor() {
  const { state, dispatch } = useCodeReview();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationIdsRef = useRef<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({ top: 0, left: 0 });
  const [showThreadDialog, setShowThreadDialog] = useState(false);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      // Auto-detect language if code changes significantly
      const detectedLanguage = detectLanguage(value, state.currentSession?.fileName);
      dispatch({
        type: 'SET_CODE',
        payload: {
          code: value,
          language: detectedLanguage,
        },
      });
    }
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorSelection((e) => {
      const selection = e.selection;
      if (!selection.isEmpty()) {
        const selectedText = editor.getModel()?.getValueInRange(selection) || '';
        if (selectedText.trim()) {
          dispatch({
            type: 'SET_SELECTION',
            payload: {
              startLine: selection.startLineNumber,
              endLine: selection.endLineNumber,
              startColumn: selection.startColumn,
              endColumn: selection.endColumn,
            },
          });

          // Show action menu near selection
          const position = editor.getScrolledVisiblePosition(selection.getStartPosition());
          if (position) {
            const coords = editor.getScrolledVisiblePosition(selection.getEndPosition());
            if (coords) {
              const top = coords.top + 20;
              const left = coords.left + 10;
              setActionMenuPosition({ top, left });
              setShowActionMenu(true);
            }
          }
        } else {
          dispatch({ type: 'SET_SELECTION', payload: null });
          setShowActionMenu(false);
        }
      } else {
        dispatch({ type: 'SET_SELECTION', payload: null });
        setShowActionMenu(false);
      }
    });
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

  // Monaco decorations for thread ranges
  useEffect(() => {
    if (!editorRef.current || !state.currentSession) {
      // Clean up decorations if no session
      if (editorRef.current && decorationIdsRef.current.length > 0) {
        editorRef.current.deltaDecorations(decorationIdsRef.current, []);
        decorationIdsRef.current = [];
      }
      return;
    }

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    // Dynamically import Range to avoid SSR issues
    import('monaco-editor').then((monaco) => {
      const threads = state.currentSession?.threads || [];
      
      // Clean up old decorations
      if (decorationIdsRef.current.length > 0) {
        editor.deltaDecorations(decorationIdsRef.current, []);
        decorationIdsRef.current = [];
      }

      if (threads.length === 0) {
        return;
      }

      const decorations = threads.map((thread) => {
        const isActive = thread.id === state.activeThreadId;
        const className = `thread-highlight-${thread.color}${isActive ? ' thread-highlight-active' : ''}`;
        const inlineClassName = `thread-inline-${thread.color}`;
        const glyphClassName = `thread-glyph-${thread.color}`;

        return {
          range: new monaco.Range(
            thread.startLine,
            thread.startColumn,
            thread.endLine,
            thread.endColumn
          ),
          options: {
            className,
            isWholeLine: false,
            inlineClassName,
            glyphMarginClassName: glyphClassName,
            hoverMessage: {
              value: `Thread: ${truncateText(thread.messages[0]?.content || '', 50)}`,
            },
          },
        };
      });

      decorationIdsRef.current = editor.deltaDecorations([], decorations);
    });

    return () => {
      if (editorRef.current && decorationIdsRef.current.length > 0) {
        editorRef.current.deltaDecorations(decorationIdsRef.current, []);
        decorationIdsRef.current = [];
      }
    };
  }, [state.currentSession, state.activeThreadId]);

  const selectedCode = state.selectedRange && state.currentSession
    ? extractSelection(
        state.currentSession.code,
        state.selectedRange.startLine,
        state.selectedRange.startColumn,
        state.selectedRange.endLine,
        state.selectedRange.endColumn
      )
    : '';

  return (
    <div className="h-full w-full relative">
      <MonacoEditor
        height="100%"
        language={state.editorLanguage}
        theme={state.editorTheme}
        value={state.currentSession?.code || '// Paste your code here or start typing...'}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'Fira Code, Menlo, Monaco, Courier New, monospace',
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
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
