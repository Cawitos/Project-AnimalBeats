import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './componentes/Home';
import Login from './componentes/login';
import Register from './componentes/register';
import Recordatorios from './componentes/gestionRecordatorios';
import Enfermedades from './componentes/gestionEnfermedades'
import GestionMascotas from './componentes/gestionMascotas'
import GestionEspecies from './componentes/gestionEspecies'
import GestionUsuarios from './componentes/gestionUsuarios';  
import ConsultarU from './componentes/ConsultarU';
import CrearUsuario from './componentes/CrearUsuario';
import ModificarUsuarioPage from './componentes/ModificarUsuarioPage';
import EstadoRoles from './componentes/Estados-Roles';
import Admin from './componentes/admin';
import './App.css'
import GestionEnfermedades from './componentes/gestionEnfermedades';
import GestionCitas from './componentes/Citas';
import CrearEspecie from './componentes/CrearEspecie';
import ModificarEspecie from './componentes/ModificarEspecie';
import GestionRazas from './componentes/gestionRazas';
import CrearRaza from './componentes/CrearRaza';
import CrearMascota from './componentes/CrearMascota';
import ModificarMascota from './componentes/ModificarMascota';
import ModificarRaza from './componentes/ModificarRaza';

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
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
