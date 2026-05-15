import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Planner from './Planner';
import api from '../../api/axiosConfig';

jest.mock('../../api/axiosConfig', () => ({
  get: jest.fn()
}));

describe('Planner', () => {
  const baseProps = {
    closets: [{ id: 'c1', name: 'Summer Closet' }],
    plans: [],
    loading: false,
    error: '',
    onRetry: jest.fn(),
    onCreate: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onNotify: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: [] });
  });

  it('renders upcoming empty state', () => {
    render(<Planner {...baseProps} />);
    expect(screen.getByText('Outfit planner')).toBeTruthy();
    expect(screen.getByText('No upcoming outfits yet.')).toBeTruthy();
  });

  it('creates a plan using selected closet', async () => {
    const onCreate = jest.fn().mockResolvedValue('Outfit plan created.');
    render(<Planner {...baseProps} onCreate={onCreate} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Office fit' } });
    fireEvent.click(screen.getByLabelText('Summer Closet'));
    fireEvent.click(screen.getByRole('button', { name: 'Save plan' }));

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Office fit',
      closetIds: ['c1']
    }));
  });
});
