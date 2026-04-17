import './App.css';
import api from './api/axiosConfig';
import { useState, useEffect, useCallback } from 'react';
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

  const updateAuthUser = (user) => {
    setAuthUser(user);
    if (user) {
      localStorage.setItem('closetAuthUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('closetAuthUser');
    }
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
      return next;
    });
  };

  const syncUserFromResponse = (user) => {
    if (!user) {
      return;
    }
    updateAuthUser(user);
  };

  const handleRegister = async (payload) => {
    const response = await api.post('/api/v1/auth/register', payload);
    syncUserFromResponse(response?.data?.data);
    return response?.data?.message || 'Registered successfully.';
  };

  const handleLogin = async (payload) => {
    const response = await api.post('/api/v1/auth/login', payload);
    syncUserFromResponse(response?.data?.data);
    return response?.data?.message || 'Logged in successfully.';
  };

  const handleLogout = () => {
    updateAuthUser(null);
    setSavedClosets([]);
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
    return response?.data?.message || (isSaved ? 'Removed from saved.' : 'Saved.');
  };

  return (
    <div className="App">
      <Header authUser={authUser} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route path="/" element={<Home closets={closets} loading={closetsLoading} error={closetsError} recentlyViewedClosets={recentlyViewedClosets} onTrackViewed={trackRecentlyViewed} onToggleFavorite={handleToggleFavorite} authUser={authUser} />} />
          <Route path="/browse" element={<Browse closets={closets} loading={closetsLoading} error={closetsError} onTrackViewed={trackRecentlyViewed} onToggleFavorite={handleToggleFavorite} authUser={authUser} onRefreshClosets={getClosets} />} />
          <Route path="/saved" element={<Saved closets={savedClosets} loading={closetsLoading} authUser={authUser} onTrackViewed={trackRecentlyViewed} onToggleFavorite={handleToggleFavorite} />} />
          <Route path="/profile" element={<Profile authUser={authUser} onLogin={handleLogin} onRegister={handleRegister} />} />
          <Route path="/closets/:closetId" element={<ClosetDetail closets={closets} loading={closetsLoading} error={closetsError} onTrackViewed={trackRecentlyViewed} onToggleFavorite={handleToggleFavorite} authUser={authUser} />} />
          <Route path='/trailer/:ytTrailerId' element={<Trailer/>} />
          <Route path='/Trailer/:ytTrailerId' element={<Trailer/>} />
          <Route path="/coats/:closetId" element={<Coats getClosetData={getClosetData} closet={closet} coats={coats} setCoats={setCoats} loading={closetLoading} error={closetError} onTrackViewed={trackRecentlyViewed} />} />
          <Route path="/Coats/:closetId" element={<Coats getClosetData={getClosetData} closet={closet} coats={coats} setCoats={setCoats} loading={closetLoading} error={closetError} onTrackViewed={trackRecentlyViewed} />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
