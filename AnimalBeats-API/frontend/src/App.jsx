import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './componentes/Home';
import Login from './componentes/login';
import Register from './componentes/register';
import Recordatorios from './componentes/gestionRecordatorios';
import Enfermedades from './componentes/gestionEnfermedades'
import GestionUsuarios from './componentes/gestionUsuarios';  
import ConsultarU from './componentes/ConsultarU';
import CrearUsuario from './componentes/CrearUsuario';
import ModificarUsuarioPage from './componentes/ModificarUsuarioPage';
import Admin from './componentes/admin';
import './App.css'

function App() {
  const [User, setUser] = useState(null)

  return (
    <>
      <BrowserRouter>
        <Routes>
           <Route path="/" element={!User ? (<Home />) : (
    User.rol === '1' ? <Navigate to="/admin" /> :
    User.rol === '2' ? <Navigate to="/cliente" /> :
    User.rol === '3' ? <Navigate to="/veterinario" /> :
    <Navigate to="/" />
  )} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path='/registro' element={<Register setUser={setUser} />} />
          <Route path='/admin' element={User?.rol == 1 ? <Admin /> : <Navigate to="/" /> }/> 
          <Route path="/gestionusuarios" element={User?.rol == 1 ? <GestionUsuarios /> : <Navigate to="/" />} />
          <Route path="/usuarios/:n_documento/consultar" element={User?.rol == 1 ? <ConsultarU /> : <Navigate to="/" />}/>
          <Route path="/usuarios/crear" element={User?.rol === 1 ? <CrearUsuario /> : <Navigate to="/" />}/>
       <Route path="/usuario/Actualizar/:n_documento" element={User?.rol === 1 ? <ModificarUsuarioPage /> : <Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
