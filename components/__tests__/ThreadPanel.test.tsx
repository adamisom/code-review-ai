import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThreadPanel } from '../ThreadPanel';
import { CodeReviewProvider } from '../providers/CodeReviewProvider';

describe('ThreadPanel', () => {
  it('should render empty state when no threads', () => {
    render(
      <CodeReviewProvider>
        <ThreadPanel />
      </CodeReviewProvider>
    );

    expect(screen.getByText('No threads yet')).toBeInTheDocument();
  });

  it('should display thread count header', () => {
    render(
      <CodeReviewProvider>
        <ThreadPanel />
      </CodeReviewProvider>
    );

    expect(screen.getByText(/Threads/)).toBeInTheDocument();
  });
});

