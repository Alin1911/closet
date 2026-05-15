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

export type BrowseMeta = {
  totalCount: number;
  totalPages: number;
  page: number;
  size: number;
  styleCounts: Record<string, number>;
  seasonCounts: Record<string, number>;
  colorCounts: Record<string, number>;
};

export type ClosetListResponse = {
  items: Closet[];
  meta: BrowseMeta;
};
