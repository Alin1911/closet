import './App.css';
import api from './api/axiosConfig';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import {Routes, Route} from 'react-router-dom';
import Home from './components/home/Home'
import Header from './components/header/Header.js';
import { Trailer } from './components/trailer/Trailer.js';

function App() {
  const [closets, setClosets] = useState([]);

  const getClosets = async () => {
    try {
      const response = await api.get('/api/v1/closets');
      console.log(response.data);
      setClosets(response.data);
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
          <Route path="/" element={<Home closets={closets}/>} ></Route>
          <Route path='/Trailer/:ytTrailerId' element={<Trailer/>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
