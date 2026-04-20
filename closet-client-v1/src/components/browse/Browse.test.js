import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Browse from './Browse';

describe('Browse', () => {
  it('renders facet counts and supports page jump', async () => {
    const onFilterChange = jest.fn();

    render(
      <MemoryRouter>
        <Browse
          filters={{ style: '', season: '', color: '', sort: 'newest', q: '', page: 0, size: 12 }}
          items={[{ id: '1', name: 'Winter Closet', description: 'desc', poster: '', images: [], trailerLink: '' }]}
          totalPages={5}
          totalCount={12}
          facetCounts={{ styles: { Classic: 3 }, seasons: { Winter: 5 }, colors: { Blue: 2 } }}
          loading={false}
          error=""
          onFilterChange={onFilterChange}
          onResetFilters={jest.fn()}
          onRetry={jest.fn()}
          onTrackViewed={jest.fn()}
          onToggleFavorite={jest.fn()}
          authUser={null}
          onNotify={jest.fn()}
        />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Browse closets' });
    expect(screen.getByText('Showing 1 of 12 closets')).toBeTruthy();
    expect(screen.getByText('Winter Closet')).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Classic (3)' })).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Jump to page'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));

    await waitFor(() => expect(onFilterChange).toHaveBeenCalledWith('page', 2));
  });
});
