import './App.css';
import api from './api/axiosConfig';
import { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import {Routes, Route} from 'react-router-dom';
import Home from './components/home/Home'
import Header from './components/header/Header.js';
import { Trailer } from './components/trailer/Trailer.js';
import { Coats } from './components/coats/Coats.js';

function App() {
  const [closets, setClosets] = useState([]);
  const [closet, setCloset] = useState({});
  const [coats, setCoats] = useState([]);
  const [closetsLoading, setClosetsLoading] = useState(true);
  const [closetsError, setClosetsError] = useState('');
  const [closetLoading, setClosetLoading] = useState(false);
  const [closetError, setClosetError] = useState('');

  const getClosets = async () => {
    setClosetsLoading(true);
    setClosetsError('');
    try {
      const response = await api.get('/api/v1/closets');
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
      setCoats(singleCloset?.coatsIds ?? []);
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

  return (
    <div className="App">
      <Header/>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route path="/" element={<Home closets={closets} loading={closetsLoading} error={closetsError} />} />
          <Route path="/browse" element={<Home closets={closets} loading={closetsLoading} error={closetsError} />} />
          <Route path='/trailer/:ytTrailerId' element={<Trailer/>} />
          <Route path='/Trailer/:ytTrailerId' element={<Trailer/>} />
          <Route path="/coats/:closetId" element={<Coats getClosetData={getClosetData} closet={closet} coats={coats} setCoats={setCoats} loading={closetLoading} error={closetError} />} />
          <Route path="/Coats/:closetId" element={<Coats getClosetData={getClosetData} closet={closet} coats={coats} setCoats={setCoats} loading={closetLoading} error={closetError} />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
