import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axiosConfig';
import { trackEvent } from '../utils/analytics';

const DEFAULT_BROWSE_FILTERS = {
  style: '',
  season: '',
  color: '',
  sort: 'newest',
  q: '',
  page: 0,
  size: 12
};

export default function useClosetData() {
  const [closets, setClosets] = useState([]);
  const [closet, setCloset] = useState({});
  const [coats, setCoats] = useState([]);
  const [savedClosets, setSavedClosets] = useState([]);
  const [closetsLoading, setClosetsLoading] = useState(true);
  const [closetsError, setClosetsError] = useState('');
  const [closetLoading, setClosetLoading] = useState(false);
  const [closetError, setClosetError] = useState('');
  const [authUser, setAuthUser] = useState(() => {
    const raw = localStorage.getItem('closetAuthUser');
    return raw ? JSON.parse(raw) : null;
  });
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() => {
    const raw = localStorage.getItem('closetRecentlyViewed');
    return raw ? JSON.parse(raw) : [];
  });

  const [browseFilters, setBrowseFilters] = useState(DEFAULT_BROWSE_FILTERS);
  const [browseItems, setBrowseItems] = useState([]);
  const [browseTotalPages, setBrowseTotalPages] = useState(0);
  const [browseTotalCount, setBrowseTotalCount] = useState(0);
  const [browseFacetCounts, setBrowseFacetCounts] = useState({ styles: {}, seasons: {}, colors: {} });
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState('');

  const refreshInFlightRef = useRef(null);
  const browseCacheRef = useRef(new Map());

  const updateAuthUser = useCallback((userOrUpdater) => {
    setAuthUser((previous) => {
      const next = typeof userOrUpdater === 'function' ? userOrUpdater(previous) : userOrUpdater;
      if (next) {
        localStorage.setItem('closetAuthUser', JSON.stringify(next));
      } else {
        localStorage.removeItem('closetAuthUser');
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (authUser?.token) {
      api.defaults.headers.common.Authorization = `Bearer ${authUser.token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [authUser?.token]);

  const getClosets = useCallback(async (filters = {}) => {
    setClosetsLoading(true);
    setClosetsError('');
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      const query = params.toString();
      const response = await api.get(`/api/v1/closets${query ? `?${query}` : ''}`);
      setClosets(response.data);
    } catch (error) {
      console.error(error);
      setClosetsError('Failed to load closets. Please try again.');
    } finally {
      setClosetsLoading(false);
    }
  }, []);

  useEffect(() => {
    getClosets();
  }, [getClosets]);

  const parseHeaderObject = (headerValue) => {
    if (!headerValue) {
      return {};
    }
    try {
      return JSON.parse(headerValue);
    } catch (_) {
      return {};
    }
  };

  const fetchBrowseClosets = useCallback(async (filters, { force = false } = {}) => {
    const key = JSON.stringify(filters);
    if (!force && browseCacheRef.current.has(key)) {
      const cached = browseCacheRef.current.get(key);
      setBrowseItems(cached.items);
      setBrowseTotalPages(cached.totalPages);
      setBrowseTotalCount(cached.totalCount);
      setBrowseFacetCounts(cached.facetCounts);
      setBrowseError('');
      return;
    }

    setBrowseLoading(true);
    setBrowseError('');
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([paramKey, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(paramKey, value);
        }
      });
      const response = await api.get(`/api/v1/closets?${params.toString()}`);
      const next = {
        items: response.data || [],
        totalPages: Number(response.headers['x-total-pages'] || 0),
        totalCount: Number(response.headers['x-total-count'] || (response.data || []).length),
        facetCounts: {
          styles: parseHeaderObject(response.headers['x-facet-styles']),
          seasons: parseHeaderObject(response.headers['x-facet-seasons']),
          colors: parseHeaderObject(response.headers['x-facet-colors'])
        }
      };
      browseCacheRef.current.set(key, next);
      setBrowseItems(next.items);
      setBrowseTotalPages(next.totalPages);
      setBrowseTotalCount(next.totalCount);
      setBrowseFacetCounts(next.facetCounts);
    } catch (error) {
      console.error(error);
      setBrowseError('Could not load closets for browse.');
    } finally {
      setBrowseLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrowseClosets(browseFilters);
  }, [browseFilters, fetchBrowseClosets]);

  const onBrowseFilterChange = useCallback((name, value) => {
    if (name === 'page') {
      const pageNumber = Number(value);
      if (Number.isNaN(pageNumber) || pageNumber < 0) {
        return;
      }
    }
    setBrowseFilters((previous) => ({ ...previous, [name]: value, page: name === 'page' ? value : 0 }));
    if (name === 'q') {
      trackEvent('closet_search', { queryLength: (value || '').trim().length });
    }
  }, []);

  const resetBrowseFilters = useCallback(() => {
    setBrowseFilters(DEFAULT_BROWSE_FILTERS);
    trackEvent('browse_filters_reset');
  }, []);

  const retryBrowseFetch = useCallback(() => {
    fetchBrowseClosets(browseFilters, { force: true });
  }, [browseFilters, fetchBrowseClosets]);

  const getClosetData = useCallback(async (closetId) => {
    setClosetLoading(true);
    setClosetError('');
    try {
      const response = await api.get(`/api/v1/closets/${closetId}`);
      setCloset(response.data);
      const coatsResponse = await api.get(`/api/v1/closets/${closetId}/coats`);
      setCoats(coatsResponse.data ?? []);
    } catch (error) {
      console.error(error);
      setClosetError('Failed to load closet details.');
    } finally {
      setClosetLoading(false);
    }
  }, []);

  const syncUserFromResponse = useCallback((user) => {
    if (!user) {
      return;
    }
    updateAuthUser((previous) => ({
      ...previous,
      ...user,
      token: user.token || previous?.token,
      refreshToken: user.refreshToken || previous?.refreshToken
    }));
  }, [updateAuthUser]);

  const refreshAuthToken = useCallback(async () => {
    if (!authUser?.refreshToken) {
      throw new Error('Missing refresh token');
    }
    if (!refreshInFlightRef.current) {
      refreshInFlightRef.current = api
        .post('/api/v1/auth/refresh', { refreshToken: authUser.refreshToken }, { _skipAuthRefresh: true })
        .then((response) => {
          syncUserFromResponse(response?.data?.data);
          return response?.data?.data;
        })
        .finally(() => {
          refreshInFlightRef.current = null;
        });
    }
    return refreshInFlightRef.current;
  }, [authUser?.refreshToken, syncUserFromResponse]);

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error?.config;
        if (
          error?.response?.status !== 401 ||
          !authUser?.refreshToken ||
          originalRequest?._retry ||
          originalRequest?._skipAuthRefresh
        ) {
          return Promise.reject(error);
        }
        originalRequest._retry = true;
        try {
          const refreshed = await refreshAuthToken();
          if (refreshed?.token) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${refreshed.token}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          updateAuthUser(null);
          return Promise.reject(refreshError);
        }
      }
    );
    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [authUser?.refreshToken, refreshAuthToken, updateAuthUser]);

  const handleRegister = useCallback(async (payload) => {
    const response = await api.post('/api/v1/auth/register', payload);
    syncUserFromResponse(response?.data?.data);
    trackEvent('register_success');
    return response?.data?.message || 'Registered successfully.';
  }, [syncUserFromResponse]);

  const handleLogin = useCallback(async (payload) => {
    const response = await api.post('/api/v1/auth/login', payload);
    syncUserFromResponse(response?.data?.data);
    trackEvent('login_success');
    return response?.data?.message || 'Logged in successfully.';
  }, [syncUserFromResponse]);

  const handleLogout = useCallback(() => {
    if (authUser?.token) {
      api.post('/api/v1/auth/logout', {}, { _skipAuthRefresh: true }).catch(() => {});
    }
    updateAuthUser(null);
    setSavedClosets([]);
    trackEvent('logout');
  }, [authUser?.token, updateAuthUser]);

  const handleProfileUpdate = useCallback(async (payload) => {
    if (!authUser?.userId) {
      throw new Error('Please log in first.');
    }
    const response = await api.put(`/api/v1/users/${authUser.userId}/profile`, payload);
    syncUserFromResponse(response?.data?.data);
    trackEvent('profile_updated');
    return response?.data?.message || 'Profile updated.';
  }, [authUser?.userId, syncUserFromResponse]);

  const refreshSavedClosets = useCallback(async () => {
    if (!authUser?.userId) {
      setSavedClosets([]);
      return;
    }
    const response = await api.get(`/api/v1/users/${authUser.userId}/favorites`);
    setSavedClosets(response.data || []);
  }, [authUser?.userId]);

  useEffect(() => {
    refreshSavedClosets().catch((error) => console.error(error));
  }, [refreshSavedClosets]);

  const handleToggleFavorite = useCallback(async (closetId) => {
    if (!authUser?.userId) {
      throw new Error('Please sign in to save closets.');
    }
    const isSaved = authUser.favoriteClosetIds?.includes(closetId);
    const endpoint = `/api/v1/users/${authUser.userId}/favorites/${closetId}`;
    const response = isSaved ? await api.delete(endpoint) : await api.put(endpoint);
    syncUserFromResponse(response?.data?.data);
    await refreshSavedClosets();
    browseCacheRef.current.clear();
    trackEvent(isSaved ? 'closet_unsaved' : 'closet_saved', { closetId });
    return response?.data?.message || (isSaved ? 'Removed from saved.' : 'Saved.');
  }, [authUser, refreshSavedClosets, syncUserFromResponse]);

  const recentlyViewedClosets = useMemo(() => recentlyViewedIds
    .map((id) => closets.find((item) => item.id === id))
    .filter(Boolean), [closets, recentlyViewedIds]);

  const trackRecentlyViewed = useCallback((closetId) => {
    setRecentlyViewedIds((previous) => {
      const next = [closetId, ...previous.filter((id) => id !== closetId)].slice(0, 8);
      localStorage.setItem('closetRecentlyViewed', JSON.stringify(next));
      trackEvent('closet_viewed', { closetId });
      return next;
    });
  }, []);

  return {
    closets,
    closet,
    coats,
    setCoats,
    savedClosets,
    closetsLoading,
    closetsError,
    closetLoading,
    closetError,
    authUser,
    recentlyViewedClosets,
    trackRecentlyViewed,
    getClosets,
    getClosetData,
    handleRegister,
    handleLogin,
    handleLogout,
    handleProfileUpdate,
    handleToggleFavorite,
    browseFilters,
    browseItems,
    browseTotalPages,
    browseTotalCount,
    browseFacetCounts,
    browseLoading,
    browseError,
    onBrowseFilterChange,
    resetBrowseFilters,
    retryBrowseFetch
  };
}
