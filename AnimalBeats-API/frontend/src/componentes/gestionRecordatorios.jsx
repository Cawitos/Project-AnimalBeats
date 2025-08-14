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
  const [mascotasCliente, setMascotasCliente] = useState([]);

  // Formatear fecha UTC a local compatible con input datetime-local
  const formatDateLocalForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  // Calcular fecha y hora mínima al cargar (para limitar input datetime-local)
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setMinFecha(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);

  // Obtener todos los recordatorios
  const fetchRecordatorios = async () => {
    try {
      const res = await axios.get('http://localhost:3000/recordatorios');
      setRecordatorio(res.data);
    } catch (error) {
      console.error('Error al obtener recordatorios:', error);
    }
  };

  // Cambia cliente y carga sus mascotas
  const handleClienteChange = async (e) => {
    const clienteId = e.target.value;
    setForm(prev => ({ ...prev, cliente: clienteId, mascota: '' })); // limpiar mascota al cambiar cliente

    if (clienteId.trim().length < 10) {
      setMascotasCliente([]);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:3000/Mascota/recordatorio/${clienteId}`);
      if (Array.isArray(res.data)) {
        setMascotasCliente(res.data);
      } else {
        setMascotasCliente(res.data ? [res.data] : []);
      }
    } catch (error) {
      setMascotasCliente([]);
      console.error('Error al obtener mascotas para cliente:', error);
      Swal.fire('Error', 'No se pudieron cargar las mascotas del cliente.', 'error');
    }
  };

  // Cambia mascota seleccionada
  const handleMascotaChange = (e) => {
    setForm(prev => ({ ...prev, mascota: e.target.value }));
  };

  // Guardar o modificar recordatorio
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.mascota) {
      Swal.fire('Mascota no seleccionada', 'Por favor, selecciona una mascota para continuar.', 'warning');
      return;
    }

    if (new Date(form.fecha) < new Date(minFecha)) {
      Swal.fire('Fecha inválida', 'La fecha y hora no pueden ser anteriores a la actual.', 'error');
      return;
    }

    try {
      // Enviar la fecha tal cual viene del input datetime-local
      const dataToSend = { ...form, fecha: form.fecha };

      if (modoEditar) {
        await axios.put(`http://localhost:3000/recordatorios/modificar/${idEditar}`, dataToSend);
        Swal.fire('Actualizado', 'El recordatorio ha sido actualizado correctamente.', 'success');
      } else {
        await axios.post('http://localhost:3000/recordatorios/guardar', dataToSend);
        Swal.fire('Guardado', 'El recordatorio ha sido guardado correctamente.', 'success');
      }
      fetchRecordatorios();
      setForm({ cliente: '', mascota: '', fecha: '', descripcion: '' });
      setMascotasCliente([]);
      setModoEditar(false);
      setIdEditar(null);
    } catch (error) {
      console.error('Error al guardar/modificar recordatorio:', error);
      Swal.fire('Error', 'No se pudo guardar el recordatorio. Intenta nuevamente.', 'error');
    }
  };

  // Eliminar recordatorio con confirmación
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

  // Cargar datos para editar un recordatorio
  const cargarParaEditar = async (r) => {
    setForm({
      cliente: r.id_cliente,
      mascota: r.id_Mascota,
      fecha: formatDateLocalForInput(r.Fecha), // fecha formateada localmente para input
      descripcion: r.descripcion,
    });
    setModoEditar(true);
    setIdEditar(r.id);

    // Cargar mascotas del cliente para el select
    if (r.id_cliente) {
      try {
        const res = await axios.get(`http://localhost:3000/Mascota/recordatorio/${r.id_cliente}`);
        if (Array.isArray(res.data)) {
          setMascotasCliente(res.data);
        } else {
          setMascotasCliente(res.data ? [res.data] : []);
        }
      } catch {
        setMascotasCliente([]);
      }
    } else {
      setMascotasCliente([]);
    }
  };

  // Al cargar el componente, obtener recordatorios
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
              onChange={handleClienteChange}
              required
            />
          </div>

          <div className="gestion-recordatorios-form-group">
            <label>Seleccione Mascota</label>
            <select
              value={form.mascota}
              onChange={handleMascotaChange}
              required
              disabled={mascotasCliente.length === 0}
            >
              <option value="" disabled>
                {mascotasCliente.length === 0 ? 'No hay mascotas disponibles' : 'Seleccione una mascota'}
              </option>
              {mascotasCliente.map(mascota => (
                <option key={mascota.id} value={mascota.id}>
                  {mascota.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="gestion-recordatorios-form-group">
            <label>Fecha</label>
            <input
              type="datetime-local"
              min={minFecha}
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
