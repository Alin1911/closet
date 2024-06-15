import './App.css';
import api from './api/axiosConfig';
import { useState, useEffect } from 'react';
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

  const getClosets = async () => {
    try {
      const response = await api.get('/api/v1/closets');
      setClosets(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const getClosetData = async (closetId) => {
    try {
      const response = await api.get(`/api/v1/closets/imdb/${closetId}`);
      const singleCloset = response.data;
      setCloset(singleCloset);
      setCoats(singleCloset.reviewIds)
    } catch (error) {
      console.error(error);
    }
  
  }

  useEffect(() => {
    getClosets();
  }, []);

  return (
    <div className="App">
      <Header/>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route path="/" element={<Home closets={closets}/>} />
          <Route path='/Trailer/:ytTrailerId' element={<Trailer/>} />
          <Route path="/Coats/:closetId" element={<Coats getClosetData={getClosetData} closet={closet} coats={coats} setCoats={setCoats} />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
