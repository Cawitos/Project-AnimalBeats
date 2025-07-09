import { useEffect, useState } from 'react';
import OffcanvasMenu from './menu';
import '../css/estado-rol.css'

export default function EstadoRoles() {
  const [roles, setRoles] = useState([]);
  const [estados, setEstados] = useState(['Activo', 'Suspendido']);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [nuevoRol, setNuevoRol] = useState('');

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = () => {
    fetch('http://localhost:3000/roles/Listado')
      .then(res => res.json())
      .then(data => setRoles(data.roles))
      .catch(err => console.error('Error al obtener roles:', err));
  };

  const agregarEstado = () => {
    if (nuevoEstado.trim() !== '') {
      setEstados([...estados, nuevoEstado.trim()]);
      setNuevoEstado('');
    }
  };

  const agregarRol = () => {
    if (nuevoRol.trim() === '') return;
    fetch('http://localhost:3000/roles/Crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol: nuevoRol.trim() })
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        setNuevoRol('');
        cargarRoles();
      })
      .catch(err => console.error('Error al agregar rol:', err));
  };

  return (
    <div className="estado-roles-container p-4">
      <nav className="estado-roles-menu-lateral">
              <OffcanvasMenu />
      </nav>
      <h2 className="estado-roles-title text-xl font-bold mb-2">Tabla de Roles</h2>
      <table className="estado-roles-tabla border w-full mb-12">
        <thead>
          <tr>
            <th className="estado-roles-th border px-2 py-1">ID</th>
            <th className="estado-roles-th border px-2 py-1">Rol</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(rol => (
            <tr key={rol.id}>
              <td className="estado-roles-td border px-2 py-1">{rol.id}</td>
              <td className="estado-roles-td border px-2 py-1">{rol.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="estado-roles-agregar-rol d-flex mb-4">
        <input
          type="text"
          className="estado-roles-input border px-2 py-1 flex-grow bg-white text-dark"
          value={nuevoRol}
          onChange={e => setNuevoRol(e.target.value)}
          placeholder="Nuevo rol"
        />
        <button
          className="estado-roles-btn btn btn-danger ms-2"
          onClick={agregarRol}
        >
          Agregar rol
        </button>
      </div>

      <h2 className="estado-roles-title text-xl font-bold mb-2">Tabla de Estados (Frontend)</h2>
      <table className="estado-roles-tabla border w-full mb-2">
        <thead>
          <tr>
            <th className="estado-roles-th border px-2 py-1">Estado</th>
          </tr>
        </thead>
        <tbody>
          {estados.map((estado, index) => (
            <tr key={index}>
              <td className="estado-roles-td border px-2 py-1">{estado}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="estado-roles-agregar-estado d-flex mt-2">
        <input
          type="text"
          className="estado-roles-input border px-2 py-1 flex-grow bg-white text-dark"
          value={nuevoEstado}
          onChange={e => setNuevoEstado(e.target.value)}
          placeholder="Nuevo estado"
        />
        <button
          className="estado-roles-btn btn btn-danger"
          onClick={agregarEstado}
        >
          Agregar estado
        </button>
      </div>
    </div>
  );
}
