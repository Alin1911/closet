import './App.css';
import api from './api/axiosConfig';
import { useState, useEffect } from 'react';

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

    </div>
  );
}

export default App;
