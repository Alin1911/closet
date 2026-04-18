import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Browse from './Browse';
import api from '../../api/axiosConfig';

jest.mock('../../api/axiosConfig', () => ({
  get: jest.fn()
}));

const renderBrowse = (props = {}) => render(
  <MemoryRouter>
    <Browse
      loading={false}
      error=""
      onTrackViewed={jest.fn()}
      onToggleFavorite={jest.fn()}
      authUser={null}
      onNotify={jest.fn()}
      {...props}
    />
  </MemoryRouter>
);

describe('Browse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders facet counts from headers and supports page jump', async () => {
    api.get.mockResolvedValue({
      data: [
        { id: '1', name: 'Winter Closet', description: 'desc', poster: '', images: [], trailerLink: '' }
      ],
      headers: {
        'x-total-pages': '5',
        'x-total-count': '12',
        'x-facet-styles': JSON.stringify({ Classic: 3 }),
        'x-facet-seasons': JSON.stringify({ Winter: 5 }),
        'x-facet-colors': JSON.stringify({ Blue: 2 })
      }
    });

    renderBrowse();

    await screen.findByRole('heading', { name: 'Browse closets' });
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Showing 1 of 12 closets')).toBeTruthy();
    expect(screen.getByText('Winter Closet')).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Classic (3)' })).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Jump to page'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
    expect(api.get.mock.calls[1][0]).toContain('page=2');
  });
});
