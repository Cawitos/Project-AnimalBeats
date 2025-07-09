import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './componentes/Home';
import Login from './componentes/login';
import Register from './componentes/register';
import Recordatorios from './componentes/gestionRecordatorios';
import GestionMascotas from './componentes/gestionMascotas';
import GestionEspecies from './componentes/gestionEspecies';
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

import { UserContext } from './context/UserContext'; 

function App() {
  const [User, setUser] = useState(null)

  return (
    <>
      <UserContext.Provider value={{ User, setUser }}>
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
          <Route path='/admin' element={User?.rol == 1 ? <Admin /> : <Navigate to="/" />} />
          <Route path="/gestionusuarios" element={User?.rol == 1 ? <GestionUsuarios /> : <Navigate to="/" />} />
          <Route path="/usuarios/:n_documento/consultar" element={User?.rol == 1 ? <ConsultarU /> : <Navigate to="/" />} />
          <Route path="/usuarios/crear" element={User?.rol === 1 ? <CrearUsuario /> : <Navigate to="/" />} />
          <Route path="/usuario/Actualizar/:n_documento" element={User?.rol === 1 ? <ModificarUsuarioPage /> : <Navigate to="/" />} />
          <Route path="/estados-roles" element={User?.rol === 1 ? <EstadoRoles /> : <Navigate to="/" />} />

          {/* Rutas recordatorios */}
          <Route path="/recordatorios" element={User?.rol === 1 ? <Recordatorios /> : <Navigate to="/" />} />

          {/* Rutas gestion de Mascotas */}
          <Route path='/Mascotas' element={!User ? <Navigate to="/" /> : <GestionMascotas />} />
          <Route path='/Mascotas/crear' element={!User ? <Navigate to="/" /> : <CrearMascota />} />
          <Route path='/Mascotas/modificar/:id' element={!User ? <Navigate to="/" /> : <ModificarMascota />} />
          <Route path='/Especies' element={!User ? <Navigate to="/" /> : <GestionEspecies />} />
          <Route path='/Especies/crear' element={!User ? <Navigate to="/" /> : < CrearEspecie />} />
          <Route path='/Especies/modificar/:id' element={!User ? <Navigate to="/" /> : < ModificarEspecie />} />
          <Route path='/Razas/:id' element={!User ? <Navigate to="/" /> : <GestionRazas />} />
          <Route path="/Razas/crear/:id" element={!User ? <Navigate to="/" /> : <CrearRaza />} />
          <Route path='/Razas/modificar/:id_especie/:id_raza' element={!User ? <Navigate to="/" /> : <ModificarRaza />} />
          <Route path="/gestion_enfermedades" element={!User ? <Navigate to="/" /> : <GestionEnfermedades />} />
          <Route path="/gestion_citas" element={!User ? <Navigate to="/" /> : <GestionCitas />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
    </>
  )
}

export default App
