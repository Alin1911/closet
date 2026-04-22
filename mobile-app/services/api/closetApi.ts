import api from './client';
import { ApiEnvelope, AuthUser, Closet, Coat } from '../../types/models';

export const fetchClosets = async (params: Record<string, string | number | undefined> = {}) => {
  const response = await api.get<Closet[]>('/api/v1/closets', { params });
  return response.data;
};

export const fetchClosetById = async (id: string) => {
  const response = await api.get<Closet | null>(`/api/v1/closets/${id}`);
  return response.data;
};

export const fetchCoats = async (closetId: string) => {
  const response = await api.get<Coat[]>(`/api/v1/closets/${closetId}/coats`);
  return response.data ?? [];
};

export const createCoat = async (closetId: string, description: string) => {
  const response = await api.post<ApiEnvelope<Coat>>(`/api/v1/closets/${closetId}/coats`, {
    name: 'Closet note',
    description,
    images: [],
  });
  return response.data;
};

export const updateCoat = async (closetId: string, coat: Coat, description: string) => {
  const response = await api.put<ApiEnvelope<Coat>>(`/api/v1/closets/${closetId}/coats/${coat.id}`, {
    name: coat.name || 'Closet note',
    description,
    images: coat.images || [],
  });
  return response.data;
};

export const deleteCoat = async (closetId: string, coatId: string) => {
  const response = await api.delete<ApiEnvelope<void>>(`/api/v1/closets/${closetId}/coats/${coatId}`);
  return response.data;
};

export const registerUser = async (payload: { email: string; password: string; displayName: string }) => {
  const response = await api.post<ApiEnvelope<AuthUser>>('/api/v1/auth/register', payload);
  return response.data;
};

export const loginUser = async (payload: { email: string; password: string }) => {
  const response = await api.post<ApiEnvelope<AuthUser>>('/api/v1/auth/login', payload);
  return response.data;
};

export const updateProfile = async (userId: string, payload: { displayName?: string; password?: string }) => {
  const response = await api.put<ApiEnvelope<AuthUser>>(`/api/v1/users/${userId}/profile`, payload);
  return response.data;
};

export const refreshToken = async (refreshTokenValue: string) => {
  const response = await api.post<ApiEnvelope<AuthUser>>('/api/v1/auth/refresh', { refreshToken: refreshTokenValue });
  return response.data;
};

export const logout = async () => {
  await api.post('/api/v1/auth/logout', {});
};

export const fetchFavorites = async (userId: string) => {
  const response = await api.get<Closet[]>(`/api/v1/users/${userId}/favorites`);
  return response.data ?? [];
};

export const toggleFavorite = async (userId: string, closetId: string, isSaved: boolean) => {
  const endpoint = `/api/v1/users/${userId}/favorites/${closetId}`;
  const response = isSaved
    ? await api.delete<ApiEnvelope<AuthUser>>(endpoint)
    : await api.put<ApiEnvelope<AuthUser>>(endpoint);
  return response.data;
};
