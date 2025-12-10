import { render, screen, fireEvent } from '@testing-library/react';
import { SelectionActionMenu } from '../SelectionActionMenu';

describe('SelectionActionMenu', () => {
  const mockOnAskAI = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render menu at correct position', () => {
    render(
      <SelectionActionMenu
        position={{ top: 100, left: 200 }}
        onAskAI={mockOnAskAI}
        onCancel={mockOnCancel}
      />
    );

    const menu = screen.getByText('Ask AI').closest('div');
    expect(menu).toBeInTheDocument();
  });

  it('should call onAskAI when Ask AI button is clicked', () => {
    render(
      <SelectionActionMenu
        position={{ top: 100, left: 200 }}
        onAskAI={mockOnAskAI}
        onCancel={mockOnCancel}
      />
    );

    const askButton = screen.getByText('Ask AI');
    fireEvent.click(askButton);
    expect(mockOnAskAI).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Cancel button is clicked', () => {
    render(
      <SelectionActionMenu
        position={{ top: 100, left: 200 }}
        onAskAI={mockOnAskAI}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Escape key is pressed', () => {
    render(
      <SelectionActionMenu
        position={{ top: 100, left: 200 }}
        onAskAI={mockOnAskAI}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});

