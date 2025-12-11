'use client';

import { CodeThread } from '@/lib/types';

interface CommentThreadHeaderProps {
  thread: CodeThread;
  onClose: () => void;
}

export function CommentThreadHeader({ thread, onClose }: CommentThreadHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div>
        <h3 className={`font-semibold text-thread-${thread.color}`}>
          Lines {thread.startLine}-{thread.endLine}
        </h3>
        <p className="text-xs text-secondary mt-1">{thread.messages.length} messages</p>
      </div>
      <button
        onClick={onClose}
        className="text-secondary hover:text-foreground transition"
        aria-label="Close thread"
      >
        ✕
      </button>
    </div>
  );
}

