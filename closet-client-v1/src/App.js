import './App.css';
import api from './api/axiosConfig';
import { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import {Routes, Route} from 'react-router-dom';
import Home from './components/home/Home'
import Header from './components/header/Header.js';
import { Trailer } from './components/trailer/Trailer.js';
import { Coats } from './components/coats/Coats.js';
import Browse from './components/browse/Browse';
import Saved from './components/saved/Saved';
import Profile from './components/profile/Profile';
import ClosetDetail from './components/closetDetail/ClosetDetail';
import { Toast, ToastContainer } from 'react-bootstrap';
import ProtectedRoute from './components/common/ProtectedRoute';
import { trackEvent } from './utils/analytics';

function App() {
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
  const [toast, setToast] = useState({ show: false, message: '' });
  const refreshInFlightRef = useRef(null);

  const updateAuthUser = (user) => {
    setAuthUser(user);
    if (user) {
      localStorage.setItem('closetAuthUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('closetAuthUser');
    }
  };

  useEffect(() => {
    if (authUser?.token) {
      api.defaults.headers.common.Authorization = `Bearer ${authUser.token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [authUser?.token]);

  const showToast = (message) => {
    if (!message) {
      return;
    }
    setToast({ show: true, message });
  };

  const getClosets = async (filters = {}) => {
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
  }

  const getClosetData = useCallback(async (closetId) => {
    setClosetLoading(true);
    setClosetError('');
    try {
      const response = await api.get(`/api/v1/closets/${closetId}`);
      const singleCloset = response.data;
      setCloset(singleCloset);
      const coatsResponse = await api.get(`/api/v1/closets/${closetId}/coats`);
      setCoats(coatsResponse.data ?? []);
    } catch (error) {
      console.error(error);
      setClosetError('Failed to load closet details.');
    } finally {
      setClosetLoading(false);
    }
  
  }, []);

  useEffect(() => {
    getClosets();
  }, []);

  const recentlyViewedClosets = recentlyViewedIds
    .map((id) => closets.find((item) => item.id === id))
    .filter(Boolean);

  const trackRecentlyViewed = (closetId) => {
    setRecentlyViewedIds((prev) => {
      const next = [closetId, ...prev.filter((id) => id !== closetId)].slice(0, 8);
      localStorage.setItem('closetRecentlyViewed', JSON.stringify(next));
      trackEvent('closet_viewed', { closetId });
      return next;
    });
  };

  const syncUserFromResponse = (user) => {
    if (!user) {
      return;
    }
    updateAuthUser({
      ...authUser,
      ...user,
      token: user.token || authUser?.token,
      refreshToken: user.refreshToken || authUser?.refreshToken
    });
  };

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
  }, [authUser?.refreshToken]);

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
  }, [authUser?.refreshToken, refreshAuthToken]);

  const handleRegister = async (payload) => {
    const response = await api.post('/api/v1/auth/register', payload);
    syncUserFromResponse(response?.data?.data);
    trackEvent('register_success');
    return response?.data?.message || 'Registered successfully.';
  };

  const handleLogin = async (payload) => {
    const response = await api.post('/api/v1/auth/login', payload);
    syncUserFromResponse(response?.data?.data);
    trackEvent('login_success');
    return response?.data?.message || 'Logged in successfully.';
  };

  const handleLogout = () => {
    if (authUser?.token) {
      api.post('/api/v1/auth/logout', {}, { _skipAuthRefresh: true }).catch(() => {});
    }
    updateAuthUser(null);
    setSavedClosets([]);
    trackEvent('logout');
  };

  const handleProfileUpdate = async (payload) => {
    if (!authUser?.userId) {
      throw new Error('Please log in first.');
    }
    const response = await api.put(`/api/v1/users/${authUser.userId}/profile`, payload);
    syncUserFromResponse(response?.data?.data);
    trackEvent('profile_updated');
    return response?.data?.message || 'Profile updated.';
  };

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

  const handleToggleFavorite = async (closetId) => {
    if (!authUser?.userId) {
      throw new Error('Please sign in to save closets.');
    }

    const isSaved = authUser.favoriteClosetIds?.includes(closetId);
    const endpoint = `/api/v1/users/${authUser.userId}/favorites/${closetId}`;
    const response = isSaved ? await api.delete(endpoint) : await api.put(endpoint);
    syncUserFromResponse(response?.data?.data);
    await refreshSavedClosets();
    trackEvent(isSaved ? 'closet_unsaved' : 'closet_saved', { closetId });
    return response?.data?.message || (isSaved ? 'Removed from saved.' : 'Saved.');
  };

  return (
    <div className="App">
      <Header authUser={authUser} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route path="/" element={<Home closets={closets} loading={closetsLoading} error={closetsError} recentlyViewedClosets={recentlyViewedClosets} onTrackViewed={trackRecentlyViewed} onToggleFavorite={handleToggleFavorite} authUser={authUser} onNotify={showToast} onRetry={() => getClosets()} />} />
          <Route path="/browse" element={<Browse closets={closets} loading={closetsLoading} error={closetsError} onTrackViewed={trackRecentlyViewed} onToggleFavorite={handleToggleFavorite} authUser={authUser} onNotify={showToast} />} />
          <Route path="/saved" element={<ProtectedRoute authUser={authUser}><Saved closets={savedClosets} loading={closetsLoading} authUser={authUser} onTrackViewed={trackRecentlyViewed} onToggleFavorite={handleToggleFavorite} onNotify={showToast} /></ProtectedRoute>} />
          <Route path="/profile" element={<Profile authUser={authUser} onLogin={handleLogin} onRegister={handleRegister} onUpdateProfile={handleProfileUpdate} onNotify={showToast} />} />
          <Route path="/closets/:closetId" element={<ClosetDetail closets={closets} loading={closetsLoading} error={closetsError} onTrackViewed={trackRecentlyViewed} onToggleFavorite={handleToggleFavorite} authUser={authUser} onNotify={showToast} />} />
          <Route path='/trailer/:ytTrailerId' element={<Trailer/>} />
          <Route path='/Trailer/:ytTrailerId' element={<Trailer/>} />
          <Route path="/coats/:closetId" element={<Coats getClosetData={getClosetData} closet={closet} coats={coats} setCoats={setCoats} loading={closetLoading} error={closetError} onTrackViewed={trackRecentlyViewed} onNotify={showToast} />} />
          <Route path="/Coats/:closetId" element={<Coats getClosetData={getClosetData} closet={closet} coats={coats} setCoats={setCoats} loading={closetLoading} error={closetError} onTrackViewed={trackRecentlyViewed} onNotify={showToast} />} />
        </Route>
      </Routes>
      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="dark" role="status" aria-live="polite" onClose={() => setToast({ show: false, message: '' })} show={toast.show} delay={2500} autohide>
          <Toast.Body className="text-light">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}

export default App;
