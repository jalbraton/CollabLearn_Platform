import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateGallery } from '@/components/templates/TemplateGallery';

describe('TemplateGallery', () => {
  const mockOnClose = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSelect.mockClear();
  });

  it('renders template gallery when open', () => {
    render(
      <TemplateGallery
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Template Gallery')).toBeInTheDocument();
  });

  it('filters templates by category', async () => {
    render(
      <TemplateGallery
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    // Click on Meetings category
    const meetingsButton = screen.getByText('Meetings');
    fireEvent.click(meetingsButton);

    // Should show only meeting templates
    await waitFor(() => {
      expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
    });
  });

  it('searches templates by name', async () => {
    render(
      <TemplateGallery
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'meeting' } });

    await waitFor(() => {
      expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
    });
  });

  it('calls onSelect when template is clicked', async () => {
    render(
      <TemplateGallery
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    const templateButton = screen.getByText('Meeting Notes').closest('button');
    fireEvent.click(templateButton!);

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Meeting Notes',
        })
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows empty state when no templates match search', async () => {
    render(
      <TemplateGallery
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No templates found')).toBeInTheDocument();
    });
  });
});
