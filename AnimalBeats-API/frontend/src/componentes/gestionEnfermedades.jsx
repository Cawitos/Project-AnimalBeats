import { useEffect, useState, useContext } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import OffcanvasMenu from './menu';
import '../css/enfermedades.css';
import { UserContext } from '../context/UserContext';

function GestionEnfermedades() {
  const { User } = useContext(UserContext);
  const puedeEditar = User?.rol === 1 || User?.rol === 3;

  const API = 'https://animalbeats-api.onrender.com/Enfermedades';

  const [enfermedades, setEnfermedades] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalEnfermedad, setModalEnfermedad] = useState(null);

  // Formulario dinámico (registro/edición)
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);

  // ======================
  // Cargar enfermedades
  // ======================
  const cargarEnfermedades = async () => {
    try {
      const res = await axios.get(`${API}/Listado`);
      if (Array.isArray(res.data)) setEnfermedades(res.data);
      else setEnfermedades([]);
    } catch (err) {
      console.error('Error al cargar enfermedades:', err);
      Swal.fire('Error', 'No se pudieron cargar las enfermedades.', 'error');
    }
  };

  useEffect(() => { cargarEnfermedades(); }, []);

  // ======================
  // Filtrado
  // ======================
  const enfermedadesFiltradas = enfermedades.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ======================
  // Manejo de formulario
  // ======================
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const abrirEdicion = enfermedad => {
    setModoEdicion(true);
    setIdEdicion(enfermedad.id);
    setForm({ nombre: enfermedad.nombre, descripcion: enfermedad.descripcion });
  };

  const resetForm = () => {
    setForm({ nombre: '', descripcion: '' });
    setModoEdicion(false);
    setIdEdicion(null);
  };

  const guardarFormulario = async () => {
    if (!form.nombre.trim() || !form.descripcion.trim()) {
      Swal.fire('Atención', 'Nombre y descripción son obligatorios', 'warning');
      return;
    }

    try {
      if (modoEdicion) {
        // Editar
        const res = await axios.put(`${API}/Actualizar/${idEdicion}`, form);
        if (res.data.resultado?.length > 0) {
          await cargarEnfermedades();
          resetForm();
          Swal.fire('Actualizado', 'La enfermedad se actualizó correctamente', 'success');
        } else {
          Swal.fire('No encontrado', 'No se encontró la enfermedad para actualizar', 'warning');
        }
      } else {
        // Registrar
        await axios.post(`${API}/Registrar`, form);
        await cargarEnfermedades();
        resetForm();
        Swal.fire('Registrado', 'La enfermedad se registró correctamente', 'success');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Ocurrió un error al guardar la enfermedad', 'error');
    }
  };

  const eliminarEnfermedad = async id => {
    const confirm = await Swal.fire({
      title: '¿Eliminar enfermedad?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(`${API}/Eliminar/${id}`);
      if (res.data.resultado?.length > 0) {
        await cargarEnfermedades();
        Swal.fire('Eliminado', 'La enfermedad fue eliminada', 'success');
      } else {
        Swal.fire('No encontrado', 'No se encontró la enfermedad para eliminar', 'warning');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo eliminar la enfermedad', 'error');
    }
  };

  const abrirModal = enfermedad => setModalEnfermedad(enfermedad);
  const cerrarModal = () => setModalEnfermedad(null);

  // ======================
  // Render
  // ======================
  return (
    <div className="ge-container py-5">
      <div className="gestion-enfermedades-menu-lateral"><OffcanvasMenu /></div>

      <div className="ge-header text-center mb-4">
        <h2 className="ge-title fw-bold">Gestión de Enfermedades</h2>
        {puedeEditar && <h5 className="ge-subtitle text-muted mt-2">{modoEdicion ? 'Editar Enfermedad' : 'Registrar Nueva Enfermedad'}</h5>}
      </div>

      <div className="row mb-4">
        <div className="col-md-6 offset-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar enfermedades..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {puedeEditar && (
        <div className="ge-form row g-3 mb-4">
          <div className="col-md-6">
            <label>Nombre</label>
            <input type="text" name="nombre" className="form-control" value={form.nombre} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label>Descripción</label>
            <textarea name="descripcion" className="form-control" rows="3" value={form.descripcion} onChange={handleChange}></textarea>
          </div>
          <div className="col-12 text-center mt-3">
            <button className={`btn ${modoEdicion ? 'btn-success' : 'btn-primary'} me-2`} onClick={guardarFormulario}>
              {modoEdicion ? 'Guardar cambios' : 'Registrar'}
            </button>
            {modoEdicion && <button className="btn btn-secondary" onClick={resetForm}>Cancelar</button>}
          </div>
        </div>
      )}

      <div className="ge-listado">
        <h4>Listado de Enfermedades</h4>
        {enfermedadesFiltradas.length > 0 ? (
          <div className="row">
            {enfermedadesFiltradas.map(e => (
              <div key={e.id} className="col-md-4 mb-3">
                <div className="card h-100" style={{ cursor: 'pointer' }} onClick={() => abrirModal(e)}>
                  <div className="card-body">
                    <h5>{e.nombre} <small className="text-muted">(ID: {e.id})</small></h5>
                    <p>{e.descripcion.length > 100 ? e.descripcion.substring(0, 100) + '...' : e.descripcion}</p>
                    {puedeEditar && (
                      <div className="btn-group mt-2" onClick={ev => ev.stopPropagation()}>
                        <button className="btn btn-outline-info btn-sm me-1" onClick={() => abrirEdicion(e)}>Editar</button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarEnfermedad(e.id)}>Eliminar</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">No hay enfermedades registradas</p>
        )}
      </div>

      {modalEnfermedad && (
        <div className="modal-backdrop show" onClick={cerrarModal}>
          <div className="modal d-block" tabIndex="-1" onClick={e => e.stopPropagation()}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{modalEnfermedad.nombre} (ID: {modalEnfermedad.id})</h5>
                  <button type="button" className="btn-close" onClick={cerrarModal}></button>
                </div>
                <div className="modal-body">
                  <p>{modalEnfermedad.descripcion}</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={cerrarModal}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionEnfermedades;
