import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from "sweetalert2";
import OffcanvasMenu from './menu';
import '../css/GestionRecordatorios.css';

function GestionRecordatorios() {
  const [recordatorio, setRecordatorio] = useState([]);
  const [form, setForm] = useState({ cliente: '', mascota: '', fecha: '', descripcion: '' });
  const [modoEditar, setModoEditar] = useState(false);
  const [idEditar, setIdEditar] = useState(null);
  const [minFecha, setMinFecha] = useState('');

  // Calcular fecha mínima al cargar
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setMinFecha(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);

  const fetchRecordatorios = async () => {
    try {
      const res = await axios.get('http://localhost:3000/recordatorios');
      setRecordatorio(res.data);
    } catch (error) {
      console.error('Error al obtener recordatorios:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que la fecha sea mayor o igual a la fecha mínima
    if (new Date(form.fecha) < new Date(minFecha)) {
      Swal.fire('Fecha inválida', 'La fecha y hora no pueden ser anteriores a la actual.', 'error');
      return;
    }

    try {
      if (modoEditar) {
        await axios.put(`http://localhost:3000/recordatorios/modificar/${idEditar}`, form);
      } else {
        await axios.post('http://localhost:3000/recordatorios/guardar', form);
      }
      fetchRecordatorios();
      setForm({ cliente: '', mascota: '', fecha: '', descripcion: '' });
      setModoEditar(false);
      setIdEditar(null);
    } catch (error) {
      console.error('Error al guardar/modificar recordatorio:', error);
    }
  };

  const eliminarRecordatorio = (id) => {
    Swal.fire({
      title: '¿Estás seguro de que quieres eliminar este recordatorio?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/recordatorios/eliminar/${id}`);
          fetchRecordatorios();
          Swal.fire('¡Eliminado!', 'El recordatorio ha sido eliminado.', 'success');
        } catch (error) {
          console.error('Error al eliminar recordatorio:', error);
          Swal.fire('Error', 'No se pudo eliminar el recordatorio. Intenta nuevamente.', 'error');
        }
      }
    });
  };

  const cargarParaEditar = (r) => {
    setForm({
      cliente: r.id_cliente,
      mascota: r.id_Mascota,
      fecha: new Date(r.Fecha).toISOString().slice(0, 16),
      descripcion: r.descripcion,
    });
    setModoEditar(true);
    setIdEditar(r.id);
  };

  useEffect(() => {
    fetchRecordatorios();
  }, []);

  return (
    <div className="gestion-recordatorios-container">
      <div className="gestion-recordatorio-menu-lateral">
        <OffcanvasMenu />
      </div>
      <h4 className="gestion-recordatorios-title">Gestión de Recordatorios</h4>

      <table className="gestion-recordatorios-table">
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
              <td>{new Date(r.Fecha).toLocaleString()}</td>
              <td>{r.descripcion}</td>
              <td>
                <button
                  onClick={() => cargarParaEditar(r)}
                  className="gestion-recordatorios-btn-editar"
                >
                  Modificar
                </button>
                <button
                  onClick={() => eliminarRecordatorio(r.id)}
                  className="gestion-recordatorios-btn-eliminar"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h5 className="gestion-recordatorios-form-title">
        {modoEditar ? 'Modificar Recordatorio' : 'Crear nuevo Recordatorio'}
      </h5>
      <form onSubmit={handleSubmit} className="gestion-recordatorios-form">
        <div className="gestion-recordatorios-form-row">
          <div className="gestion-recordatorios-form-group">
            <label>N° Documento del Cliente</label>
            <input
              type="text"
              value={form.cliente}
              onChange={e => setForm({ ...form, cliente: e.target.value })}
              required
            />
          </div>
          <div className="gestion-recordatorios-form-group">
            <label>ID Mascota</label>
            <input
              type="number"
              value={form.mascota}
              onChange={e => setForm({ ...form, mascota: e.target.value })}
              required
            />
          </div>
          <div className="gestion-recordatorios-form-group">
            <label>Fecha</label>
            <input
              type="datetime-local"
              min={minFecha} // restricción directa
              value={form.fecha}
              onChange={e => setForm({ ...form, fecha: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="gestion-recordatorios-form-group">
          <label>Descripción</label>
          <input
            type="text"
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="gestion-recordatorios-btn-guardar">
          {modoEditar ? 'Actualizar Recordatorio' : 'Guardar Recordatorio'}
        </button>
      </form>
    </div>
  );
}

export default GestionRecordatorios;
