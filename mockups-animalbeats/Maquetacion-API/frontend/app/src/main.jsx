import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/css/styles.css';
import './assets/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Register from './components/register.jsx';
// Si luego tienes un componente Login, también lo importas aquí:
// import Login from './components/login.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/register" element={<Register />} />
      {/* <Route path="/login" element={<Login />} /> */}
    </Routes>
  </BrowserRouter>
);
