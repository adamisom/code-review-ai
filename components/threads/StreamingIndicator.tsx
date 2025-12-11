'use client';

interface StreamingIndicatorProps {
  isVisible: boolean;
}

export function StreamingIndicator({ isVisible }: StreamingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-2 text-secondary py-3 mb-2 px-2">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
        <div
          className="w-2 h-2 bg-secondary rounded-full animate-pulse"
          style={{ animationDelay: '0.2s' }}
        ></div>
        <div
          className="w-2 h-2 bg-secondary rounded-full animate-pulse"
          style={{ animationDelay: '0.4s' }}
        ></div>
      </div>
      <span className="text-sm">AI is thinking...</span>
    </div>
  );
}

