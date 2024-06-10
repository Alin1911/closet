import './App.css';
import api from './api/axiosConfig';
import { useState, useEffect } from 'react';
import Layout from './components/Layout.js';
import {Routes, Route} from 'react-router-dom';

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
      <Routes>
        <Route path="/" element={Layout}>
          
        </Route>
      </Routes>
    </div>
  );
}

export default App;
