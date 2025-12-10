'use client';

import { useCodeReview } from './providers/CodeReviewProvider';
import { CommentThread } from './CommentThread';
import { formatTimestamp, truncateText } from '@/lib/utils';

export function ThreadPanel() {
  const { state, dispatch } = useCodeReview();

  const threads = state.currentSession?.threads || [];
  const activeThreads = threads.filter(t => t.status === 'active');
  const resolvedThreads = threads.filter(t => t.status === 'resolved');

  const handleThreadClick = (threadId: string) => {
    dispatch({ type: 'SET_ACTIVE_THREAD', payload: threadId });
  };

  const handleResolveThread = (threadId: string) => {
    dispatch({
      type: 'UPDATE_THREAD_STATUS',
      payload: { threadId, status: 'resolved' },
    });
  };

  const handleDeleteThread = (threadId: string) => {
    if (confirm('Delete this thread?')) {
      dispatch({ type: 'DELETE_THREAD', payload: threadId });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">
          Threads ({threads.length})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-4 text-center text-secondary">
            <p>No threads yet</p>
            <p className="text-sm mt-1">Select code and press Cmd+K to start</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activeThreads.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-secondary uppercase">
                  Active
                </div>
                {activeThreads.map(thread => (
                  <div
                    key={thread.id}
                    className={`p-4 cursor-pointer hover:bg-border/30 transition ${
                      state.activeThreadId === thread.id ? 'bg-border/50' : ''
                    }`}
                    onClick={() => handleThreadClick(thread.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium text-thread-${thread.color}`}>
                        Lines {thread.startLine}-{thread.endLine}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveThread(thread.id);
                          }}
                          className="text-xs px-2 py-1 rounded hover:bg-success/20 text-success"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteThread(thread.id);
                          }}
                          className="text-xs px-2 py-1 rounded hover:bg-danger/20 text-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80">
                      {truncateText(thread.messages[0]?.content || '', 80)}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-secondary">
                      <span>{thread.messages.length} messages</span>
                      <span>•</span>
                      <span>{formatTimestamp(thread.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {resolvedThreads.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-secondary uppercase">
                  Resolved
                </div>
                {resolvedThreads.map(thread => (
                  <div
                    key={thread.id}
                    className="p-4 opacity-60 cursor-pointer hover:opacity-80 transition"
                    onClick={() => handleThreadClick(thread.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium text-thread-${thread.color}`}>
                        Lines {thread.startLine}-{thread.endLine}
                      </span>
                      <span className="text-xs text-success">✓ Resolved</span>
                    </div>
                    <p className="text-sm text-foreground/60">
                      {truncateText(thread.messages[0]?.content || '', 80)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active thread conversation view */}
      {state.activeThreadId && (() => {
        const activeThread = threads.find((t) => t.id === state.activeThreadId);
        if (!activeThread) return null;

        return (
          <div className="border-t border-border h-[60%] flex-shrink-0">
            <CommentThread
              thread={activeThread}
              onClose={() => dispatch({ type: 'SET_ACTIVE_THREAD', payload: null })}
            />
          </div>
        );
      })()}
    </div>
  );
}
