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

const RECOMMENDATION_LIMIT = 6;
const MIN_RECENT_WEIGHT = 0;
const MAX_RECENT_WEIGHT = 8;
const FAVORITE_WEIGHT = 80;
const RECENT_VIEW_MULTIPLIER = 10;
const STYLE_WEIGHT = 8;
const SEASON_WEIGHT = 6;
const COLOR_WEIGHT = 5;
const TRAILER_BONUS = 1;

export default function useClosetData() {
  const [closets, setClosets] = useState([]);
  const [closet, setCloset] = useState({});
  const [coats, setCoats] = useState([]);
  const [savedClosets, setSavedClosets] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState('');
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
  const [browsePreferenceCounts, setBrowsePreferenceCounts] = useState(() => {
    const raw = localStorage.getItem('closetBrowsePreferences');
    if (!raw) {
      return { style: {}, season: {}, color: {} };
    }
    try {
      return JSON.parse(raw);
    } catch (_) {
      return { style: {}, season: {}, color: {} };
    }
  });

  const [browseFilters, setBrowseFilters] = useState(DEFAULT_BROWSE_FILTERS);
  const [browseItems, setBrowseItems] = useState([]);
  const [browseTotalPages, setBrowseTotalPages] = useState(0);
  const [browseTotalCount, setBrowseTotalCount] = useState(0);
  const [browseFacetCounts, setBrowseFacetCounts] = useState({ styles: {}, seasons: {}, colors: {} });
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState('');
  const [outfitPlans, setOutfitPlans] = useState([]);
  const [outfitPlansLoading, setOutfitPlansLoading] = useState(false);
  const [outfitPlansError, setOutfitPlansError] = useState('');

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
    if ((name === 'style' || name === 'season' || name === 'color') && value) {
      setBrowsePreferenceCounts((previous) => {
        const next = {
          ...previous,
          [name]: {
            ...(previous?.[name] || {}),
            [value]: ((previous?.[name] || {})[value] || 0) + 1
          }
        };
        localStorage.setItem('closetBrowsePreferences', JSON.stringify(next));
        return next;
      });
    }
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
    setSavedError('');
    setOutfitPlans([]);
    setOutfitPlansError('');
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
      setSavedError('');
      return;
    }
    setSavedLoading(true);
    setSavedError('');
    try {
      const response = await api.get(`/api/v1/users/${authUser.userId}/favorites`);
      setSavedClosets(response.data || []);
    } catch (error) {
      console.error(error);
      setSavedError('Could not load saved closets.');
    } finally {
      setSavedLoading(false);
    }
  }, [authUser?.userId]);

  useEffect(() => {
    refreshSavedClosets();
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

  const retrySavedFetch = useCallback(() => {
    refreshSavedClosets();
  }, [refreshSavedClosets]);

  const refreshOutfitPlans = useCallback(async () => {
    if (!authUser?.userId) {
      setOutfitPlans([]);
      setOutfitPlansError('');
      return;
    }
    setOutfitPlansLoading(true);
    setOutfitPlansError('');
    try {
      const response = await api.get(`/api/v1/users/${authUser.userId}/outfit-plans`);
      setOutfitPlans(response.data || []);
    } catch (error) {
      console.error(error);
      setOutfitPlansError('Could not load outfit plans.');
    } finally {
      setOutfitPlansLoading(false);
    }
  }, [authUser?.userId]);

  useEffect(() => {
    refreshOutfitPlans();
  }, [refreshOutfitPlans]);

  const createOutfitPlan = useCallback(async (payload) => {
    if (!authUser?.userId) {
      throw new Error('Please sign in to plan outfits.');
    }
    const response = await api.post(`/api/v1/users/${authUser.userId}/outfit-plans`, payload);
    await refreshOutfitPlans();
    trackEvent('outfit_plan_created');
    return response?.data?.message || 'Outfit plan created.';
  }, [authUser?.userId, refreshOutfitPlans]);

  const updateOutfitPlan = useCallback(async (planId, payload) => {
    if (!authUser?.userId) {
      throw new Error('Please sign in to edit outfit plans.');
    }
    const response = await api.put(`/api/v1/users/${authUser.userId}/outfit-plans/${planId}`, payload);
    await refreshOutfitPlans();
    trackEvent('outfit_plan_updated');
    return response?.data?.message || 'Outfit plan updated.';
  }, [authUser?.userId, refreshOutfitPlans]);

  const deleteOutfitPlan = useCallback(async (planId) => {
    if (!authUser?.userId) {
      throw new Error('Please sign in to remove outfit plans.');
    }
    const response = await api.delete(`/api/v1/users/${authUser.userId}/outfit-plans/${planId}`);
    await refreshOutfitPlans();
    trackEvent('outfit_plan_deleted');
    return response?.data?.message || 'Outfit plan deleted.';
  }, [authUser?.userId, refreshOutfitPlans]);

  const recentlyViewedClosets = useMemo(() => recentlyViewedIds
    .map((id) => closets.find((item) => item.id === id))
    .filter(Boolean), [closets, recentlyViewedIds]);

  const recommendedClosets = useMemo(() => {
    if (!closets.length) {
      return [];
    }
    const favoriteIds = new Set(authUser?.favoriteClosetIds || []);
    const recentWeights = new Map(recentlyViewedIds.map((id, index) => [id, Math.max(MIN_RECENT_WEIGHT, MAX_RECENT_WEIGHT - index)]));
    const score = (item) => {
      let total = 0;
      if (favoriteIds.has(item.id)) {
        total += FAVORITE_WEIGHT;
      }
      total += (recentWeights.get(item.id) || 0) * RECENT_VIEW_MULTIPLIER;
      total += (browsePreferenceCounts.style?.[item.style] || 0) * STYLE_WEIGHT;
      total += (browsePreferenceCounts.season?.[item.season] || 0) * SEASON_WEIGHT;
      total += (browsePreferenceCounts.color?.[item.color] || 0) * COLOR_WEIGHT;
      if (item.trailerLink) {
        total += TRAILER_BONUS;
      }
      return total;
    };

    const ranked = closets
      .map((item) => ({ item, score: score(item) }))
      .sort((left, right) => right.score - left.score);

    if ((ranked[0]?.score || 0) <= 0) {
      return closets.slice(0, RECOMMENDATION_LIMIT);
    }
    return ranked.slice(0, RECOMMENDATION_LIMIT).map(({ item }) => item);
  }, [authUser?.favoriteClosetIds, browsePreferenceCounts, closets, recentlyViewedIds]);

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
    savedLoading,
    savedError,
    closetsLoading,
    closetsError,
    closetLoading,
    closetError,
    authUser,
    recentlyViewedClosets,
    recommendedClosets,
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
    retryBrowseFetch,
    retrySavedFetch,
    outfitPlans,
    outfitPlansLoading,
    outfitPlansError,
    refreshOutfitPlans,
    createOutfitPlan,
    updateOutfitPlan,
    deleteOutfitPlan
  };
}
