import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Profile from './Profile';

describe('Profile', () => {
  it('submits register payload in register mode', async () => {
    const onRegister = jest.fn().mockResolvedValue('Registered successfully.');
    const onLogin = jest.fn();
    const onUpdateProfile = jest.fn();

    render(
      <Profile
        authUser={null}
        onLogin={onLogin}
        onRegister={onRegister}
        onUpdateProfile={onUpdateProfile}
        onNotify={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'alex@closet.dev' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(onRegister).toHaveBeenCalledWith({
        email: 'alex@closet.dev',
        password: 'password123',
        displayName: 'Alex'
      });
    });
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('submits profile update payload for authenticated user', async () => {
    const onUpdateProfile = jest.fn().mockResolvedValue('Profile updated.');
    render(
      <Profile
        authUser={{ userId: 'u1', displayName: 'Current User', email: 'user@closet.dev', favoriteClosetIds: [] }}
        onLogin={jest.fn()}
        onRegister={jest.fn()}
        onUpdateProfile={onUpdateProfile}
        onNotify={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: 'Updated User' } });
    fireEvent.click(screen.getByRole('button', { name: /update profile/i }));

    await waitFor(() => {
      expect(onUpdateProfile).toHaveBeenCalledWith({
        displayName: 'Updated User',
        password: undefined
      });
    });
  });
});
