import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TagInput } from '@/components/tags/TagInput';

describe('TagInput', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with empty state', () => {
    render(<TagInput tags={[]} onChange={mockOnChange} />);
    
    expect(screen.getByPlaceholderText('Add tags...')).toBeInTheDocument();
  });

  it('adds tag when Enter is pressed', async () => {
    render(<TagInput tags={[]} onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('Add tags...');
    fireEvent.change(input, { target: { value: 'test-tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'test-tag',
        }),
      ]);
    });
  });

  it('removes tag when X button is clicked', async () => {
    const existingTags = [
      { id: '1', name: 'tag1', color: '#FF6B6B' },
      { id: '2', name: 'tag2', color: '#4ECDC4' },
    ];

    render(<TagInput tags={existingTags} onChange={mockOnChange} />);
    
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'tag2' }),
      ]);
    });
  });

  it('removes last tag when Backspace is pressed on empty input', async () => {
    const existingTags = [
      { id: '1', name: 'tag1', color: '#FF6B6B' },
    ];

    render(<TagInput tags={existingTags} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Backspace' });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  it('shows suggestions when typing', async () => {
    const suggestions = ['javascript', 'typescript', 'react'];

    render(
      <TagInput
        tags={[]}
        onChange={mockOnChange}
        suggestions={suggestions}
      />
    );
    
    const input = screen.getByPlaceholderText('Add tags...');
    fireEvent.change(input, { target: { value: 'type' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('typescript')).toBeInTheDocument();
    });
  });

  it('prevents duplicate tags', async () => {
    const existingTags = [
      { id: '1', name: 'existing', color: '#FF6B6B' },
    ];

    render(<TagInput tags={existingTags} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'existing' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Should not call onChange since tag already exists
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
