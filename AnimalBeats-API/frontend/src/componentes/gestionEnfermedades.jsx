import { useEffect, useState } from 'react';
import axios from 'axios';

function GestionEnfermedades() {
  const [enfermedades, setEnfermedades] = useState([]);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [nombreOriginal, setNombreOriginal] = useState('');

  const fetchEnfermedades = async () => {
    try {
      const res = await axios.get('http://localhost:3000/Enfermedades/Listado');
      setEnfermedades(res.data);
    } catch (err) {
      console.error('Error al cargar enfermedades', err);
    }
  };

  useEffect(() => {
    fetchEnfermedades();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async () => {
    try {
      await axios.post('http://localhost:3000/Enfermedades/Registrar', form);
      fetchEnfermedades();
      setForm({ nombre: '', descripcion: '' });
    } catch (err) {
      console.error('Error al registrar enfermedad', err);
    }
  };

  const editar = (enfermedad) => {
    setModoEdicion(true);
    setNombreOriginal(enfermedad.nombre);
    setForm({ nombre: enfermedad.nombre, descripcion: enfermedad.descripcion });
  };

  const guardarEdicion = async () => {
    try {
      await axios.put(`http://localhost:3000/Enfermedades/Actualizar/${nombreOriginal}`, {
        descripcion: form.descripcion,
      });
      fetchEnfermedades();
      setModoEdicion(false);
      setForm({ nombre: '', descripcion: '' });
    } catch (err) {
      console.error('Error al actualizar enfermedad', err);
    }
  };

  const eliminar = async (nombre) => {
    const confirm = window.confirm('¿Deseas eliminar esta enfermedad?');
    if (!confirm) return;
    try {
      await axios.delete(`http://localhost:3000/Enfermedades/Eliminar/${nombre}`);
      fetchEnfermedades();
    } catch (err) {
      console.error('Error al eliminar enfermedad', err);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Gestión de Enfermedades</h2>
      <div className="row">
        {enfermedades.map((enfermedad) => (
          <div className="col-md-6 mb-3" key={enfermedad.nombre}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{enfermedad.nombre}</h5>
                <p className="card-text">{enfermedad.descripcion}</p>
                <button className="btn btn-warning me-2" onClick={() => editar(enfermedad)}>Modificar</button>
                <button className="btn btn-danger" onClick={() => eliminar(enfermedad.nombre)}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <h4>{modoEdicion ? 'Editar Enfermedad' : 'Registrar Nueva Enfermedad'}</h4>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            name="nombre"
            className="form-control"
            value={form.nombre}
            onChange={handleChange}
            disabled={modoEdicion}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea
            name="descripcion"
            className="form-control"
            value={form.descripcion}
            onChange={handleChange}
          ></textarea>
        </div>
        <button className="btn btn-success" onClick={modoEdicion ? guardarEdicion : guardar}>
          {modoEdicion ? 'Guardar Cambios' : 'Registrar'}
        </button>
      </div>
    </div>
  );
}

export default GestionEnfermedades;
