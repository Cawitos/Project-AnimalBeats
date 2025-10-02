import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from "sweetalert2";
import OffcanvasMenu from './menu';
import '../css/GestionRecordatorios.css';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";

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

  // Fecha mínima para input
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setMinFecha(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);

  // Obtener recordatorios
  const fetchRecordatorios = async () => {
    try {
      const res = await axios.get('https://animalbeats-api.onrender.com/recordatorios');
      setRecordatorio(res.data);
    } catch (error) {
      console.error('Error al obtener recordatorios:', error);
    }
  };

  // Cambiar cliente y cargar todas las mascotas del cliente
  const handleClienteChange = async (e) => {
    const clienteId = e.target.value;
    setForm(prev => ({ ...prev, cliente: clienteId, mascota: '' }));

    if (!clienteId || clienteId.length < 10) {
      setMascotasCliente([]);
      return;
    }

    try {
      const res = await axios.get(`https://animalbeats-api.onrender.com/mascotas`);
      if (Array.isArray(res.data)) {
        // Filtrar solo las mascotas del cliente seleccionado
        const mascotasFiltradas = res.data.filter(m => m.id_cliente === clienteId);
        setMascotasCliente(mascotasFiltradas);
      } else {
        setMascotasCliente([]);
      }
    } catch (error) {
      setMascotasCliente([]);
      console.error('Error al obtener mascotas:', error);
      Swal.fire('Error', 'No se pudieron cargar las mascotas del cliente.', 'error');
    }
  };

  // Cambiar mascota
  const handleMascotaChange = (e) => {
    const mascotaId = e.target.value;
    setForm(prev => ({ ...prev, mascota: mascotaId }));
  };

  // Guardar o modificar
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
      const dataToSend = { ...form, fecha: form.fecha };

      if (modoEditar) {
        await axios.put(`https://animalbeats-api.onrender.com/recordatorios/modificar/${idEditar}`, dataToSend);
        Swal.fire('Actualizado', 'El recordatorio ha sido actualizado correctamente.', 'success');
      } else {
        await axios.post('https://animalbeats-api.onrender.com/recordatorios/guardar', dataToSend);
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

  // Eliminar recordatorio
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
          await axios.delete(`https://animalbeats-api.onrender.com/recordatorios/eliminar/${id}`);
          fetchRecordatorios();
          Swal.fire('¡Eliminado!', 'El recordatorio ha sido eliminado.', 'success');
        } catch (error) {
          console.error('Error al eliminar recordatorio:', error);
          Swal.fire('Error', 'No se pudo eliminar el recordatorio. Intenta nuevamente.', 'error');
        }
      }
    });
  };

  // Cargar recordatorio para editar
  const cargarParaEditar = async (r) => {
    setForm({
      cliente: r.id_cliente,
      mascota: r.mascota?.id || '',
      fecha: formatDateLocalForInput(r.fecha),
      descripcion: r.descripcion,
    });
    setModoEditar(true);
    setIdEditar(r.id);

    if (r.id_cliente) {
      try {
        const res = await axios.get(`https://animalbeats-api.onrender.com/mascotas`);
        if (Array.isArray(res.data)) {
          const mascotasFiltradas = res.data.filter(m => m.id_cliente === r.id_cliente);
          setMascotasCliente(mascotasFiltradas);
        } else {
          setMascotasCliente([]);
        }
      } catch {
        setMascotasCliente([]);
      }
    } else {
      setMascotasCliente([]);
    }
  };

  // Descargar PDF de todos los recordatorios
  const descargarTodosPDF = () => {
    try {
      const doc = new jsPDF();
      doc.addImage(logo, "PNG", 15, 10, 25, 25);
      const fechaHora = new Date().toLocaleString();
      doc.setFontSize(18);
      doc.text("Reporte de Recordatorios (Activos)", 50, 20);
      doc.setFontSize(11);
      doc.text(`Fecha y Hora: ${fechaHora}`, 50, 30);

      let startY = 40;
      const data = recordatorio.map(r => [
        r.id_cliente || "-",
        r.mascota?.nombre || "-",
        r.fecha ? new Date(r.fecha).toLocaleString() : "-",
        r.descripcion || "-"
      ]);

      autoTable(doc, {
        startY,
        head: [["Cliente", "Mascota", "Fecha", "Descripción"]],
        body: data,
        theme: "grid",
        styles: { lineColor: [223, 41, 53], lineWidth: 0.5, fontSize: 10 },
        headStyles: { fillColor: [223, 41, 53], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      doc.save("recordatorios_todos.pdf");
    } catch (error) {
      console.error("Error al generar PDF de recordatorios:", error);
    }
  };

  // Descargar PDF individual
  const descargarUnoPDF = (r) => {
    try {
      const doc = new jsPDF();
      doc.addImage(logo, "PNG", 15, 10, 25, 25);
      const fechaHora = new Date().toLocaleString();
      doc.setFontSize(18);
      doc.text("Reporte de Recordatorio", 50, 20);
      doc.setFontSize(11);
      doc.text(`Fecha y Hora: ${fechaHora}`, 50, 30);

      let startY = 40;
      autoTable(doc, {
        startY,
        body: [
          ["Cliente", r.id_cliente || "-"],
          ["Mascota", r.mascota?.nombre || "-"],
          ["Fecha", r.fecha ? new Date(r.fecha).toLocaleString() : "-"],
          ["Descripción", r.descripcion || "-"]
        ],
        theme: "grid",
        styles: { lineColor: [223, 41, 53], lineWidth: 0.5, fontSize: 11 },
        headStyles: { fillColor: [223, 41, 53], textColor: 255 }
      });

      doc.save(`recordatorio_${r.id}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF individual:", error);
    }
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
      <div className="gestion-recordatorios-btn-container">
        <button 
          onClick={descargarTodosPDF} 
          className="gestion-recordatorios-btn-pdf"
        >
          Descargar todos en PDF
        </button>
      </div>

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
              <td>{r.mascota?.nombre || "-"}</td>
              <td>{r.fecha ? new Date(r.fecha).toLocaleString() : "-"}</td>
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
                <button
                  onClick={() => descargarUnoPDF(r)}
                  className="gestion-recordatorios-btn-pdf"
                >
                  PDF
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
                  {mascota.nombre} ({mascota.especie?.especie || '-'}, {mascota.raza?.raza || '-'})
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
