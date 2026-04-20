import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Coats } from './Coats';
import api from '../../api/axiosConfig';

jest.mock('../../api/axiosConfig', () => ({
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const renderCoats = (props = {}) => {
  const defaultProps = {
    getClosetData: jest.fn(),
    closet: { id: 'c1', name: 'Winter Closet', poster: '' },
    coats: [{ id: 'coat-1', name: 'Closet note', description: 'Existing note', images: [] }],
    setCoats: jest.fn(),
    loading: false,
    error: '',
    onTrackViewed: jest.fn(),
    onNotify: jest.fn()
  };

  const merged = { ...defaultProps, ...props };
  render(
    <MemoryRouter initialEntries={['/coats/c1']}>
      <Routes>
        <Route path="/coats/:closetId" element={<Coats {...merged} />} />
      </Routes>
    </MemoryRouter>
  );
  return merged;
};

describe('Coats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows validation error when submitting an empty note', async () => {
    renderCoats({ coats: [] });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a note before submitting.')).toBeTruthy();
    });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('creates and deletes item notes', async () => {
    api.post.mockResolvedValue({
      data: {
        message: 'Item note created.',
        data: { id: 'coat-2', name: 'Closet note', description: 'New note', images: [] }
      }
    });
    api.delete.mockResolvedValue({ data: { message: 'Item note deleted.' } });

    const props = renderCoats();
    fireEvent.change(screen.getByLabelText('Add item note'), { target: { value: 'New note' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/v1/closets/c1/coats', {
      name: 'Closet note',
      description: 'New note',
      images: []
    }));
    await waitFor(() => expect(props.setCoats).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/api/v1/closets/c1/coats/coat-1'));
  });
});
