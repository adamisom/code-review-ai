'use client';

import { useState, useEffect } from 'react';
import { CodeReviewSession } from '@/lib/types';
import { loadSessions, deleteSession, clearAllSessions } from '@/lib/storage';
import { formatTimestamp, truncateText } from '@/lib/utils';

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSession: (session: CodeReviewSession) => void;
  onNewSession: () => void;
}

export function SessionManager({
  isOpen,
  onClose,
  onLoadSession,
  onNewSession,
}: SessionManagerProps) {
  const [sessions, setSessions] = useState<CodeReviewSession[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSessions(loadSessions());
    }
  }, [isOpen]);

  const handleLoad = (session: CodeReviewSession) => {
    onLoadSession(session);
    onClose();
  };

  const handleDelete = (sessionId: string) => {
    if (confirm('Delete this session? This cannot be undone.')) {
      deleteSession(sessionId);
      setSessions(loadSessions());
    }
  };

  const handleDeleteAll = () => {
    if (sessions.length === 0) return;
    
    const count = sessions.length;
    if (confirm(`Delete all ${count} saved session${count !== 1 ? 's' : ''}? This cannot be undone.`)) {
      clearAllSessions();
      setSessions([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--modal-bg)] border border-border rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Saved Sessions</h2>
          <div className="flex items-center gap-2">
            {sessions.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="px-3 py-1.5 text-sm border border-danger rounded hover:bg-danger/20 text-danger transition"
              >
                Delete All
              </button>
            )}
            <button
              onClick={onNewSession}
              className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary/90 transition"
            >
              New Session
            </button>
            <button
              onClick={onClose}
              className="text-secondary hover:text-foreground transition"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-secondary">
              <p className="mb-2">No saved sessions</p>
              <p className="text-sm">Create a session to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 border border-border rounded hover:bg-border/30 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {session.fileName || 'Untitled'}
                      </h3>
                      <p className="text-sm text-secondary mt-1">
                        {session.language} • {session.threads.length} thread
                        {session.threads.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-secondary mt-1">
                        {formatTimestamp(session.updatedAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoad(session)}
                        className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary/90 transition"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="px-3 py-1.5 text-sm border border-border rounded hover:bg-danger/20 text-danger transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {session.code && (
                    <div className="mt-2 p-2 bg-border/20 rounded text-xs">
                      <code className="text-secondary">
                        {truncateText(session.code, 100)}
                      </code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

