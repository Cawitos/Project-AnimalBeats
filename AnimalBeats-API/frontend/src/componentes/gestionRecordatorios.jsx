import { useEffect, useState } from 'react';
import axios from 'axios';

function GestionReportes() {
  const [recordatorio, setRecordatorio] = useState([]);
  const [form, setForm] = useState({ cliente: '', mascota: '', fecha: '', descripcion: '' });

  const fetchRecordatorios = async () => {
    const res = await axios.get('http://localhost:3000/api/gestionRecordatorios');
    setRecordatorios(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:3000/api/recordatorios/guardar', form);
    fetchRecordatorio(); // Actualizar (por probar)
    setForm({ cliente: '', mascota: '', fecha: '', descripcion: '' });
  };

  const eliminarRecordatorio = async (id) => {
    const confirm = window.confirm('¿Estás seguro de que quieres eliminar este recordatorio?');
    if (!confirm) return;
    await axios.delete(`http://localhost:3000/api/recordatorios/eliminar/${id}`);
    fetchRecordatorios();
  };

  useEffect(() => {
    fetchRecordatorios();
  }, []);

  return (
    <div className="contenedor-dashboard container mt-5">
      <OffcanvasMenu />
      <h4 className="mb-4">Gestión de Recordatorios</h4>
      <table className="table table-striped-columns">
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
          {Recordatorios.map(recordatorio => (
            <tr key={Recordatorios.id}>
              <td>{Recordatorios.id_cliente}</td>
              <td>{Recordatorios.id_Mascota}</td>
              <td>{new Date(Recordatorios.Fecha).toLocaleDateString()}</td>
              <td>{Recordatorios.descripcion}</td>
              <td>
                {/* Botón eliminar */}
                <button onClick={() => eliminarRecordatorio(Recordatorios.id)} className="btn btn-sm btn-danger me-2">
                  Eliminar
                </button>
                {/* falta boton de modificar */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h5 className="mt-4">Crear nuevo Recordatorio</h5>
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">N° Documento del Cliente</label>
            <input
              type="text"
              className="form-control"
              value={form.cliente}
              onChange={e => setForm({ ...form, cliente: e.target.value })}
              required
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">ID Mascota</label>
            <input
              type="number"
              className="form-control"
              value={form.mascota}
              onChange={e => setForm({ ...form, mascota: e.target.value })}
              required
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-control"
              value={form.fecha}
              onChange={e => setForm({ ...form, fecha: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <input
            type="text"
            className="form-control"
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-success">Guardar Recordatorio</button>
      </form>
    </div>
  );
}

export default GestionReportes;
