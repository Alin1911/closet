import './App.css';
import { useState } from 'react';
import Layout from './components/Layout';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
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
import useClosetData from './hooks/useClosetData';

function LegacyTrailerRedirect() {
  const { ytTrailerId } = useParams();
  return <Navigate to={`/trailer/${ytTrailerId}`} replace />;
}

function LegacyCoatsRedirect() {
  const { closetId } = useParams();
  return <Navigate to={`/coats/${closetId}`} replace />;
}

function App() {
  const {
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
  } = useClosetData();
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    if (!message) {
      return;
    }
    setToast({ show: true, message });
  };

  return (
    <div className="App">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header authUser={authUser} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route path="/" element={<Home closets={closets} loading={closetsLoading} error={closetsError} recentlyViewedClosets={recentlyViewedClosets} onTrackViewed={trackRecentlyViewed} onToggleFavorite={handleToggleFavorite} authUser={authUser} onNotify={showToast} onRetry={() => getClosets()} />} />
          <Route path="/browse" element={<Browse filters={browseFilters} items={browseItems} totalPages={browseTotalPages} totalCount={browseTotalCount} facetCounts={browseFacetCounts} loading={browseLoading} error={browseError} onFilterChange={onBrowseFilterChange} onResetFilters={resetBrowseFilters} onRetry={retryBrowseFetch} onTrackViewed={trackRecentlyViewed} onToggleFavorite={handleToggleFavorite} authUser={authUser} onNotify={showToast} />} />
          <Route path="/saved" element={<ProtectedRoute authUser={authUser}><Saved closets={savedClosets} loading={closetsLoading} authUser={authUser} onTrackViewed={trackRecentlyViewed} onToggleFavorite={handleToggleFavorite} onNotify={showToast} /></ProtectedRoute>} />
          <Route path="/profile" element={<Profile authUser={authUser} onLogin={handleLogin} onRegister={handleRegister} onUpdateProfile={handleProfileUpdate} onNotify={showToast} />} />
          <Route path="/closets/:closetId" element={<ClosetDetail closets={closets} loading={closetsLoading} error={closetsError} onTrackViewed={trackRecentlyViewed} onToggleFavorite={handleToggleFavorite} authUser={authUser} onNotify={showToast} />} />
          <Route path='/trailer/:ytTrailerId' element={<Trailer/>} />
          <Route path='/Trailer/:ytTrailerId' element={<LegacyTrailerRedirect/>} />
          <Route path="/coats/:closetId" element={<Coats getClosetData={getClosetData} closet={closet} coats={coats} setCoats={setCoats} loading={closetLoading} error={closetError} onTrackViewed={trackRecentlyViewed} onNotify={showToast} />} />
          <Route path="/Coats/:closetId" element={<LegacyCoatsRedirect/>} />
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
