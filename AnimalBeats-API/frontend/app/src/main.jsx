import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/css/styles.css';
import './assets/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Register from './components/register.jsx';
import Login from './components/login.jsx';
import Admin from './pages/admin.jsx'
import GestionUsuarios from './pages/gestionUsuarios.jsx'
import ConsultarU from './pages/ConsultarU.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>

      <Route path="/" element={<App />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/gestionusuarios" element={<GestionUsuarios />} />
      <Route path="/usuarios/:n_documento/consultar" element={<ConsultarU />} />

    </Routes>
  </BrowserRouter>
);
