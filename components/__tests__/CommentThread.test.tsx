import React from 'react';
import { render, screen } from '@testing-library/react';
import { CommentThread } from '../CommentThread';
import { CodeReviewProvider } from '../providers/CodeReviewProvider';
import { CodeThread } from '@/lib/types';

// Mock the API
global.fetch = jest.fn();

const mockThread: CodeThread = {
  id: 'thread-1',
  startLine: 1,
  endLine: 3,
  startColumn: 1,
  endColumn: 10,
  selectedCode: 'const x = 1;',
  messages: [
    {
      id: 'msg-1',
      role: 'user',
      content: 'Test question',
      timestamp: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'active',
  color: 'blue',
};

describe('CommentThread', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render thread with messages', () => {
    render(
      <CodeReviewProvider>
        <CommentThread thread={mockThread} onClose={jest.fn()} />
      </CodeReviewProvider>
    );

    expect(screen.getByText('Lines 1-3')).toBeInTheDocument();
    expect(screen.getByText('Test question')).toBeInTheDocument();
  });

  it('should display selected code', () => {
    render(
      <CodeReviewProvider>
        <CommentThread thread={mockThread} onClose={jest.fn()} />
      </CodeReviewProvider>
    );

    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('should show copy button for code', () => {
    render(
      <CodeReviewProvider>
        <CommentThread thread={mockThread} onClose={jest.fn()} />
      </CodeReviewProvider>
    );

    expect(screen.getByText('Copy')).toBeInTheDocument();
  });
});

