import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './componentes/Home';
import Login from './componentes/login';
import Register from './componentes/register';
import GestionReportes from './componentes/gestionRecordatorios';
import Admin from './componentes/admin';
import './App.css'

function App() {
  const [User, setUser] = useState(null)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={!User ? (<Home />) : (<Navigate to={User.rol === '1' ? '/admin' : '/'} />)} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path='/registro' element={<Register setUser={setUser} />} />
          <Route path='/admin' element={User?.rol === 1 ? <Admin /> : <Navigate to="/" /> }/>         
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
