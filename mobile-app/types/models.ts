export type Closet = {
  id: string;
  name?: string;
  poster?: string;
  description?: string;
  trailerLink?: string;
  images?: string[];
  style?: string;
  season?: string;
  color?: string;
};

export type Coat = {
  id: string;
  name?: string;
  description?: string;
  images?: string[];
};

export type AuthUser = {
  userId: string;
  email: string;
  displayName: string;
  favoriteClosetIds: string[];
  token: string;
  refreshToken: string;
};

export type ApiEnvelope<T> = {
  message: string;
  data: T;
};
