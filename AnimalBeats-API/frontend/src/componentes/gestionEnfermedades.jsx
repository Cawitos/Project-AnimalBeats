import { useEffect, useState, useContext } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import OffcanvasMenu from './menu';
import '../css/enfermedades.css';
import { UserContext } from '../context/UserContext';

function GestionEnfermedades() {
    const [enfermedades, setEnfermedades] = useState([]);
    const [enfermedadesFiltradas, setEnfermedadesFiltradas] = useState([]);
    const [form, setForm] = useState({ nombre: '', descripcion: '' });
    const [modoEdicion, setModoEdicion] = useState(false);
    const [nombreOriginal, setNombreOriginal] = useState('');
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [enfermedadSeleccionada, setEnfermedadSeleccionada] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    
    // Obtener usuario del contexto
    const { User } = useContext(UserContext);
    
    // Determinar si el usuario tiene permisos de edición
    const puedeEditar = User.rol === 1 || User.rol === 3; // 1 = admin, 3 = veterinario

    // Cargar listado de enfermedades
    const fetchEnfermedades = async () => {
        try {
            const res = await axios.get('https://animalbeats-backend-production.up.railway.app/Enfermedades/Listado');
            setEnfermedades(res.data);
            setEnfermedadesFiltradas(res.data);
        } catch (err) {
            console.error('Error al cargar enfermedades', err);
        }
    };

    useEffect(() => {
        fetchEnfermedades();
    }, []);

    // Filtrar enfermedades según término de búsqueda
    useEffect(() => {
        if (terminoBusqueda.trim() === '') {
            setEnfermedadesFiltradas(enfermedades);
        } else {
            const filtradas = enfermedades.filter(enfermedad =>
                enfermedad.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
                enfermedad.descripcion.toLowerCase().includes(terminoBusqueda.toLowerCase())
            );
            setEnfermedadesFiltradas(filtradas);
        }
    }, [terminoBusqueda, enfermedades]);

    // Manejo de inputs
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Registrar nueva enfermedad
    const guardar = async () => {
        if (form.nombre.trim() === '' || form.descripcion.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Campos vacíos',
                text: 'Por favor, completa todos los campos.',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        try {
            await axios.post('https://animalbeats-backend-production.up.railway.app/Enfermedades/Registrar', form);
            fetchEnfermedades();
            setForm({ nombre: '', descripcion: '' });
            Swal.fire({
                icon: 'success',
                title: 'Registrado',
                text: 'La enfermedad fue registrada correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Error al registrar enfermedad', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al registrar la enfermedad.',
            });
        }
    };

    // Cargar datos para edición
    const editar = (enfermedad) => {
        setModoEdicion(true);
        setNombreOriginal(enfermedad.nombre);
        setForm({ nombre: enfermedad.nombre, descripcion: enfermedad.descripcion });
    };

    // Cancelar edición
    const cancelarEdicion = () => {
        setModoEdicion(false);
        setForm({ nombre: '', descripcion: '' });
    };

    // Guardar cambios en edición
    const guardarEdicion = async () => {
        if (form.descripcion.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: 'La descripción no puede estar vacía.',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        try {
            await axios.put(`https://animalbeats-backend-production.up.railway.app/Enfermedades/Actualizar/${nombreOriginal}`, {
                descripcion: form.descripcion,
            });
            fetchEnfermedades();
            setModoEdicion(false);
            setForm({ nombre: '', descripcion: '' });
            Swal.fire({
                icon: 'success',
                title: 'Actualizado',
                text: 'La enfermedad fue actualizada correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Error al actualizar enfermedad', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al actualizar la enfermedad.',
            });
        }
    };

    // Eliminar enfermedad
    const eliminar = async (nombre) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará la enfermedad permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`https://animalbeats-backend-production.up.railway.app/Enfermedades/Eliminar/${nombre}`);
            fetchEnfermedades();
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'La enfermedad fue eliminada correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Error al eliminar enfermedad', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar la enfermedad.',
            });
        }
    };

    // Ver detalles de la enfermedad
    const verDetalles = (enfermedad) => {
        setEnfermedadSeleccionada(enfermedad);
        setMostrarModal(true);
    };

    // Cerrar modal de detalles
    const cerrarModal = () => {
        setMostrarModal(false);
        setEnfermedadSeleccionada(null);
    };

    return (
        <div className="ge-container py-5">
            <div className="gestion-enfermedades-menu-lateral">
                <OffcanvasMenu />
            </div>

            <div className="ge-header text-center mb-4">
                <h2 className="ge-title fw-bold">Gestión de Enfermedades</h2>
                
                {puedeEditar && (
                    <h5 className="ge-subtitle text-muted mt-2">
                        {modoEdicion ? 'Editar Enfermedad' : 'Registrar Nueva Enfermedad'}
                    </h5>
                )}
            </div>

            {/* Barra de búsqueda para todos los usuarios */}
            <div className="row mb-4">
                <div className="col-md-6 offset-md-3">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="fas fa-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar enfermedades por nombre o descripción..."
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* CRUD solo para ADMIN y VETERINARIO */}
            {puedeEditar && (
                <>
                    <div className="ge-form row g-3 mb-4">
                        <div className="ge-input-col col-md-6">
                            <label className="ge-label form-label">Nombre</label>
                            <input
                                type="text"
                                name="nombre"
                                className="ge-input form-control"
                                value={form.nombre}
                                onChange={handleChange}
                                disabled={modoEdicion}
                                placeholder="Ingrese el nombre de la enfermedad"
                            />
                        </div>

                        <div className="ge-textarea-col col-md-6">
                            <label className="ge-label form-label">Descripción</label>
                            <textarea
                                name="descripcion"
                                className="ge-textarea form-control"
                                style={{ height: '100px' }}
                                rows="1"
                                value={form.descripcion}
                                onChange={handleChange}
                                placeholder="Ingrese una breve descripción"
                            />
                        </div>
                    </div>

                    <div className="ge-btns text-center mb-5">
                        {modoEdicion ? (
                            <div className="ge-edit-group btn-group">
                                <button className="ge-btn-save btn btn-outline-success px-4" onClick={guardarEdicion}>
                                    Guardar Cambios
                                </button>
                                <button className="ge-btn-cancel btn btn-outline-secondary px-4" onClick={cancelarEdicion}>
                                    Cancelar Edición
                                </button>
                            </div>
                        ) : (
                            <button className="ge-btn-register btn btn-success px-5" onClick={guardar}>
                                Registrar
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* Listado visible para TODOS */}
            <div className="ge-listado">
                <h4 className="ge-list-title mb-3">Listado de Enfermedades</h4>
                {enfermedadesFiltradas.length > 0 ? (
                    <div className="row">
                        {enfermedadesFiltradas.map((enfermedad) => (
                            <div key={enfermedad.nombre} className="col-md-4 mb-3">
                                <div 
                                    className="card shadow-sm h-100 enfermedad-card"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => verDetalles(enfermedad)}
                                >
                                    <div className="card-body">
                                        <h5 className="card-title">{enfermedad.nombre}</h5>
                                        <p className="card-text text-muted">
                                            {enfermedad.descripcion.length > 100 
                                                ? `${enfermedad.descripcion.substring(0, 100)}...` 
                                                : enfermedad.descripcion
                                            }
                                        </p>
                                        {enfermedad.descripcion.length > 100 && (
                                            <small className="text-primary">Haz clic para ver más</small>
                                        )}

                                        {/* Solo ADMIN y VETERINARIO pueden modificar/eliminar */}
                                        {puedeEditar && (
                                            <div className="btn-group mt-2" onClick={(e) => e.stopPropagation()}>
                                                <button className="btn btn-outline-info btn-sm" onClick={() => editar(enfermedad)}>Modificar</button>
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => eliminar(enfermedad.nombre)}>Eliminar</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="ge-alert alert alert-info" role="alert">
                        <strong>Información:</strong> {terminoBusqueda ? 'No se encontraron enfermedades que coincidan con tu búsqueda.' : 'Actualmente no hay enfermedades registradas.'}
                    </div>
                )}
            </div>

            {/* Modal para ver detalles de la enfermedad */}
            {mostrarModal && enfermedadSeleccionada && (
                <div className="modal-backdrop show" onClick={cerrarModal}>
                    <div className="modal d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h5 className="modal-title">{enfermedadSeleccionada.nombre}</h5>
                                    <button type="button" className="btn-close" onClick={cerrarModal}></button>
                                </div>
                                <div className="modal-body">
                                    <p>{enfermedadSeleccionada.descripcion}</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                                        Cerrar
                                    </button>
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