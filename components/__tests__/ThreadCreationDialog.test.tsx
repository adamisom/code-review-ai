import { render, screen, fireEvent } from '@testing-library/react';
import { ThreadCreationDialog } from '../ThreadCreationDialog';

describe('ThreadCreationDialog', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();
  const selectedCode = 'const x = 1;';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dialog with selected code', () => {
    render(
      <ThreadCreationDialog
        selectedCode={selectedCode}
        lineRange={{ start: 1, end: 1 }}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Create Thread - Lines 1-1')).toBeInTheDocument();
    expect(screen.getByText(selectedCode)).toBeInTheDocument();
  });

  it('should disable submit button when input is empty', () => {
    render(
      <ThreadCreationDialog
        selectedCode={selectedCode}
        lineRange={{ start: 1, end: 1 }}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByText('Create Thread');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when input has text', () => {
    render(
      <ThreadCreationDialog
        selectedCode={selectedCode}
        lineRange={{ start: 1, end: 1 }}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const textarea = screen.getByPlaceholderText('Ask a question about this code...');
    fireEvent.change(textarea, { target: { value: 'Test question' } });

    const submitButton = screen.getByText('Create Thread');
    expect(submitButton).not.toBeDisabled();
  });

  it('should call onSubmit with message when submitted', () => {
    render(
      <ThreadCreationDialog
        selectedCode={selectedCode}
        lineRange={{ start: 1, end: 1 }}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const textarea = screen.getByPlaceholderText('Ask a question about this code...');
    fireEvent.change(textarea, { target: { value: 'Test question' } });

    const submitButton = screen.getByText('Create Thread');
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('Test question');
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <ThreadCreationDialog
        selectedCode={selectedCode}
        lineRange={{ start: 1, end: 1 }}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should populate textarea when suggested prompt is clicked', () => {
    render(
      <ThreadCreationDialog
        selectedCode={selectedCode}
        lineRange={{ start: 1, end: 1 }}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const promptButton = screen.getByText('Can you review this code for potential issues?');
    fireEvent.click(promptButton);

    const textarea = screen.getByPlaceholderText('Ask a question about this code...') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Can you review this code for potential issues?');
  });
});

