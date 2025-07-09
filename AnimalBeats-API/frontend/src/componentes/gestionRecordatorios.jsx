import { useEffect, useState } from 'react';
import axios from 'axios';
import OffcanvasMenu from './menu';

function GestionRecordatorios() {
  const [recordatorio, setRecordatorio] = useState([]);
  const [form, setForm] = useState({ cliente: '', mascota: '', fecha: '', descripcion: '' });

  // Obtener todos los recordatorios
  const fetchRecordatorios = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/gestionRecordatorios');
      setRecordatorio(res.data);
    } catch (error) {
      console.error('Error al obtener recordatorios:', error);
    }
  };

  // Guardar nuevo recordatorio
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/recordatorios/guardar', form);
      fetchRecordatorios();
      setForm({ cliente: '', mascota: '', fecha: '', descripcion: '' });
    } catch (error) {
      console.error('Error al guardar recordatorio:', error);
    }
  };

  // Eliminar recordatorio
  const eliminarRecordatorio = async (id) => {
    const confirmacion = window.confirm('¿Estás seguro de que quieres eliminar este recordatorio?');
    if (!confirmacion) return;

    try {
      await axios.delete(`http://localhost:3000/api/recordatorios/eliminar/${id}`);
      fetchRecordatorios();
    } catch (error) {
      console.error('Error al eliminar recordatorio:', error);
    }
  };

  useEffect(() => {
    fetchRecordatorios();
  }, []);

  return (
    <div className="recordatorios-container">
      {/* Asegúrate que el componente <OffcanvasMenu /> esté definido */}
      <OffcanvasMenu />

      <h4 className="recordatorios-title">Gestión de Recordatorios</h4>

      <table className="recordatorios-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Mascota</th>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {recordatorio.map(r => (
            <tr key={r.id}>
              <td>{r.id_cliente}</td>
              <td>{r.id_Mascota}</td>
              <td>{new Date(r.Fecha).toLocaleDateString()}</td>
              <td>{r.descripcion}</td>
              <td>
                <button
                  onClick={() => eliminarRecordatorio(r.id)}
                  className="btn-eliminar"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h5 className="form-title">Crear nuevo Recordatorio</h5>
      <form onSubmit={handleSubmit} className="recordatorio-form">
        <div className="form-row">
          <div className="form-group">
            <label>N° Documento del Cliente</label>
            <input
              type="text"
              value={form.cliente}
              onChange={e => setForm({ ...form, cliente: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>ID Mascota</label>
            <input
              type="number"
              value={form.mascota}
              onChange={e => setForm({ ...form, mascota: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={form.fecha}
              onChange={e => setForm({ ...form, fecha: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <input
            type="text"
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn-guardar">Guardar Recordatorio</button>
      </form>
    </div>
  );
}

export default GestionRecordatorios;
