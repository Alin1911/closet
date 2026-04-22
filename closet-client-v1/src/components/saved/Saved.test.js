import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Saved from './Saved';

const renderSaved = (props = {}) => render(
  <MemoryRouter>
    <Saved
      closets={[]}
      authUser={{ userId: 'user-1', favoriteClosetIds: [] }}
      loading={false}
      error=""
      onRetry={jest.fn()}
      onTrackViewed={jest.fn()}
      onToggleFavorite={jest.fn()}
      onNotify={jest.fn()}
      {...props}
    />
  </MemoryRouter>
);

describe('Saved', () => {
  it('shows empty state for authenticated user without saved closets', () => {
    renderSaved();
    expect(screen.getByText('You have not saved any closets yet.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Browse closets' }).getAttribute('href')).toBe('/browse');
  });

  it('removes a closet from saved list and sends notification', async () => {
    const onToggleFavorite = jest.fn().mockResolvedValue('Removed from saved.');
    const onNotify = jest.fn();
    renderSaved({
      closets: [{ id: 'c1', name: 'Winter Closet', description: 'desc', poster: '', images: [], trailerLink: '' }],
      onToggleFavorite,
      onNotify
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove from saved' }));

    await waitFor(() => expect(onToggleFavorite).toHaveBeenCalledWith('c1'));
    await waitFor(() => expect(onNotify).toHaveBeenCalledWith('Removed from saved.'));
  });

  it('shows error recovery actions and retries fetch', () => {
    const onRetry = jest.fn();
    renderSaved({ error: 'Could not load saved closets.', onRetry });

    expect(screen.getByText('Could not load saved closets.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Browse closets' }).getAttribute('href')).toBe('/browse');
  });
});
