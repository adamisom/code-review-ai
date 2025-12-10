'use client';

import { useCodeReview } from './providers/CodeReviewProvider';
import dynamic from 'next/dynamic';

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

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      dispatch({
        type: 'SET_CODE',
        payload: {
          code: value,
          language: state.editorLanguage,
        },
      });
    }
  };

  // TODO: Implement selection handling
  // TODO: Add Monaco decorations for threads
  // TODO: Handle keyboard shortcuts (Cmd+K for comment)

  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        language={state.editorLanguage}
        theme={state.editorTheme}
        value={state.currentSession?.code || '// Paste your code here or start typing...'}
        onChange={handleEditorChange}
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
    </div>
  );
}
