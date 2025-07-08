import { useEffect, useState } from 'react';

export default function EstadoRoles() {
  const [roles, setRoles] = useState([]);
  const [estados, setEstados] = useState(['Activo', 'Suspendido']);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [nuevoRol, setNuevoRol] = useState('');

  // Obtener roles al cargar el componente
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
        cargarRoles(); // refresca la lista de roles
      })
      .catch(err => console.error('Error al agregar rol:', err));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Tabla de Roles</h2>
      <table className="border w-full mb-12"> {/* más espacio con mb-12 */}
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Rol</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(rol => (
            <tr key={rol.id}>
              <td className="border px-2 py-1">{rol.id}</td>
              <td className="border px-2 py-1">{rol.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex mb-4">
        <input
          type="text"
          className="border px-2 py-1 flex-grow bg-white text-dark"
          value={nuevoRol}
          onChange={e => setNuevoRol(e.target.value)}
          placeholder="Nuevo rol"
        />
        <button
          className="btn btn-danger ms-2"
          onClick={agregarRol}
        >
          Agregar rol
        </button>
      </div>

      <h2 className="text-xl font-bold mb-2">Tabla de Estados (Frontend)</h2>
      <table className="border w-full mb-2">
        <thead>
          <tr>
            <th className="border px-2 py-1">Estado</th>
          </tr>
        </thead>
        <tbody>
          {estados.map((estado, index) => (
            <tr key={index}>
              <td className="border px-2 py-1">{estado}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex mt-2">
        <input
          type="text"
          className="border px-2 py-1 flex-grow bg-white text-dark"
          value={nuevoEstado}
          onChange={e => setNuevoEstado(e.target.value)}
          placeholder="Nuevo estado"
        />
        <button
          className="btn btn-danger"
          onClick={agregarEstado}
        >
          Agregar estado
        </button>
      </div>
    </div>
  );
}
