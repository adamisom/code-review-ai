'use client';

import { useEffect, useRef, useState } from 'react';

interface SelectionActionMenuProps {
  position: { top: number; left: number };
  onAskAI: () => void;
  onCancel: () => void;
}

export function SelectionActionMenu({ position, onAskAI, onCancel }: SelectionActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Adjust position to avoid going off-screen
    setAdjustedPosition({
      top: Math.max(10, Math.min(position.top, window.innerHeight - 100)),
      left: Math.max(10, Math.min(position.left, window.innerWidth - 200)),
    });

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    // Use click instead of mousedown to allow menu buttons to be clicked
    window.addEventListener('click', handleClickOutside, true);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('click', handleClickOutside, true);
    };
  }, [onCancel, position]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-[var(--modal-bg)] border border-border rounded-lg shadow-xl p-1 min-w-[180px]"
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={onAskAI}
        className="w-full text-left px-4 py-2.5 rounded hover:bg-border/50 transition flex items-center gap-3 text-sm font-medium"
      >
        <span className="text-lg">💬</span>
        <span>Ask AI</span>
      </button>
      <div className="h-px bg-border my-1" />
      <button
        onClick={onCancel}
        className="w-full text-left px-4 py-2 rounded hover:bg-border/50 transition text-secondary text-sm"
      >
        Cancel
      </button>
    </div>
  );
}

