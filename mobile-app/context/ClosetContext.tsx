import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createCoat,
  deleteCoat,
  fetchClosetById,
  fetchClosets,
  fetchCoats,
  fetchFavorites,
  loginUser,
  logout,
  refreshToken,
  registerUser,
  toggleFavorite,
  updateCoat,
  updateProfile,
} from '../services/api/closetApi';
import api, { setAuthToken } from '../services/api/client';
import { AuthUser, Closet, Coat } from '../types/models';

const AUTH_KEY = 'closetMobileAuthUser';
const RECENT_KEY = 'closetMobileRecentlyViewed';

type ClosetContextValue = {
  closets: Closet[];
  browseItems: Closet[];
  savedClosets: Closet[];
  coats: Coat[];
  currentCloset: Closet | null;
  authUser: AuthUser | null;
  recentlyViewedClosets: Closet[];
  loading: boolean;
  browseLoading: boolean;
  savedLoading: boolean;
  coatsLoading: boolean;
  error: string;
  browseError: string;
  savedError: string;
  coatsError: string;
  loadHome: () => Promise<void>;
  loadBrowse: (filters: Record<string, string | number | undefined>) => Promise<void>;
  loadSaved: () => Promise<void>;
  loadClosetAndCoats: (closetId: string) => Promise<void>;
  addCoatNote: (closetId: string, description: string) => Promise<string>;
  saveCoatNote: (closetId: string, coat: Coat, description: string) => Promise<string>;
  removeCoatNote: (closetId: string, coatId: string) => Promise<string>;
  login: (payload: { email: string; password: string }) => Promise<string>;
  register: (payload: { email: string; password: string; displayName: string }) => Promise<string>;
  saveProfile: (payload: { displayName?: string; password?: string }) => Promise<string>;
  signOut: () => Promise<void>;
  toggleSaved: (closetId: string) => Promise<string>;
  trackViewed: (closetId: string) => Promise<void>;
};

const ClosetContext = createContext<ClosetContextValue | null>(null);

export const ClosetProvider = ({ children }: { children: React.ReactNode }) => {
  const [closets, setClosets] = useState<Closet[]>([]);
  const [browseItems, setBrowseItems] = useState<Closet[]>([]);
  const [savedClosets, setSavedClosets] = useState<Closet[]>([]);
  const [coats, setCoats] = useState<Coat[]>([]);
  const [currentCloset, setCurrentCloset] = useState<Closet | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [coatsLoading, setCoatsLoading] = useState(false);
  const [error, setError] = useState('');
  const [browseError, setBrowseError] = useState('');
  const [savedError, setSavedError] = useState('');
  const [coatsError, setCoatsError] = useState('');
  const refreshRef = useRef<Promise<AuthUser> | null>(null);

  const syncAuth = useCallback(async (user: AuthUser | null) => {
    setAuthUser(user);
    setAuthToken(user?.token);
    if (user) {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(AUTH_KEY);
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const [storedUser, storedRecent] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(RECENT_KEY),
      ]);
      if (storedUser) {
        const user = JSON.parse(storedUser) as AuthUser;
        setAuthUser(user);
        setAuthToken(user.token);
      }
      if (storedRecent) {
        setRecentlyViewedIds(JSON.parse(storedRecent));
      }
    };
    bootstrap();
  }, []);

  const loadHome = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchClosets();
      setClosets(data);
    } catch {
      setError('Failed to load closets.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBrowse = useCallback(async (filters: Record<string, string | number | undefined>) => {
    setBrowseLoading(true);
    setBrowseError('');
    try {
      const data = await fetchClosets(filters);
      setBrowseItems(data);
    } catch {
      setBrowseError('Could not load browse results.');
    } finally {
      setBrowseLoading(false);
    }
  }, []);

  const loadSavedForUser = useCallback(async (userId?: string) => {
    if (!userId) {
      setSavedClosets([]);
      return;
    }
    setSavedLoading(true);
    setSavedError('');
    try {
      const items = await fetchFavorites(userId);
      setSavedClosets(items);
    } catch {
      setSavedError('Could not load saved closets.');
    } finally {
      setSavedLoading(false);
    }
  }, []);

  const loadSaved = useCallback(async () => {
    await loadSavedForUser(authUser?.userId);
  }, [authUser?.userId, loadSavedForUser]);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  useEffect(() => {
    loadBrowse({ sort: 'newest', size: 12, page: 0 });
  }, [loadBrowse]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const loadClosetAndCoats = useCallback(async (closetId: string) => {
    setCoatsLoading(true);
    setCoatsError('');
    try {
      const [closet, closetCoats] = await Promise.all([fetchClosetById(closetId), fetchCoats(closetId)]);
      setCurrentCloset(closet);
      setCoats(closetCoats);
    } catch {
      setCoatsError('Could not load closet details.');
    } finally {
      setCoatsLoading(false);
    }
  }, []);

  const addCoatNote = useCallback(async (closetId: string, description: string) => {
    const response = await createCoat(closetId, description);
    if (response.data) {
      setCoats((previous) => [...previous, response.data]);
    }
    return response.message;
  }, []);

  const saveCoatNote = useCallback(async (closetId: string, coat: Coat, description: string) => {
    const response = await updateCoat(closetId, coat, description);
    if (response.data) {
      setCoats((previous) => previous.map((item) => (item.id === coat.id ? response.data : item)));
    }
    return response.message;
  }, []);

  const removeCoatNote = useCallback(async (closetId: string, coatId: string) => {
    const response = await deleteCoat(closetId, coatId);
    setCoats((previous) => previous.filter((item) => item.id !== coatId));
    return response.message;
  }, []);

  const hydrateUser = useCallback(
    async (user: AuthUser) => {
      await syncAuth(user);
      await loadSavedForUser(user.userId);
    },
    [loadSavedForUser, syncAuth],
  );

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const response = await loginUser(payload);
      if (response.data) {
        await hydrateUser(response.data);
      }
      return response.message;
    },
    [hydrateUser],
  );

  const register = useCallback(
    async (payload: { email: string; password: string; displayName: string }) => {
      const response = await registerUser(payload);
      if (response.data) {
        await hydrateUser(response.data);
      }
      return response.message;
    },
    [hydrateUser],
  );

  const saveProfile = useCallback(
    async (payload: { displayName?: string; password?: string }) => {
      if (!authUser?.userId) {
        throw new Error('Please login first.');
      }
      const response = await updateProfile(authUser.userId, payload);
      if (response.data) {
        await syncAuth(response.data);
      }
      return response.message;
    },
    [authUser?.userId, syncAuth],
  );

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch {
      // ignore network errors while logging out
    }
    await syncAuth(null);
    setSavedClosets([]);
  }, [syncAuth]);

  const toggleSaved = useCallback(
    async (closetId: string) => {
      if (!authUser?.userId) {
        throw new Error('Please sign in first.');
      }
      const isSaved = authUser.favoriteClosetIds?.includes(closetId);
      const response = await toggleFavorite(authUser.userId, closetId, Boolean(isSaved));
      if (response.data) {
        await syncAuth(response.data);
      }
      await loadSavedForUser(response.data?.userId || authUser.userId);
      return response.message;
    },
    [authUser, loadSavedForUser, syncAuth],
  );

  const trackViewed = useCallback(async (closetId: string) => {
    setRecentlyViewedIds((previous) => {
      const next = [closetId, ...previous.filter((id) => id !== closetId)].slice(0, 8);
      AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error?.config;
        if (error?.response?.status !== 401 || !authUser?.refreshToken || original?._retry) {
          return Promise.reject(error);
        }
        original._retry = true;
        try {
          if (!refreshRef.current) {
            refreshRef.current = refreshToken(authUser.refreshToken)
              .then((result) => {
                if (!result.data) {
                  throw new Error('Session refresh failed');
                }
                return result.data;
              })
              .finally(() => {
                refreshRef.current = null;
              });
          }
          const refreshed = await refreshRef.current;
          await syncAuth(refreshed);
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${refreshed.token}`;
          return api(original);
        } catch (refreshError) {
          await syncAuth(null);
          return Promise.reject(refreshError);
        }
      },
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [authUser?.refreshToken, syncAuth]);

  const recentlyViewedClosets = useMemo(
    () => recentlyViewedIds.map((id) => closets.find((closet) => closet.id === id)).filter(Boolean) as Closet[],
    [closets, recentlyViewedIds],
  );

  const value: ClosetContextValue = {
    closets,
    browseItems,
    savedClosets,
    coats,
    currentCloset,
    authUser,
    recentlyViewedClosets,
    loading,
    browseLoading,
    savedLoading,
    coatsLoading,
    error,
    browseError,
    savedError,
    coatsError,
    loadHome,
    loadBrowse,
    loadSaved,
    loadClosetAndCoats,
    addCoatNote,
    saveCoatNote,
    removeCoatNote,
    login,
    register,
    saveProfile,
    signOut,
    toggleSaved,
    trackViewed,
  };

  return <ClosetContext.Provider value={value}>{children}</ClosetContext.Provider>;
};

export const useCloset = () => {
  const value = useContext(ClosetContext);
  if (!value) {
    throw new Error('useCloset must be used inside ClosetProvider');
  }
  return value;
};
