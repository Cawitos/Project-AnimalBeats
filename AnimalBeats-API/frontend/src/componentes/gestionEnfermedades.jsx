import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import OffcanvasMenu from './menu';
import '../css/enfermedades.css'

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
            await axios.post('http://localhost:3000/Enfermedades/Registrar', form);
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

    const editar = (enfermedad) => {
        setModoEdicion(true);
        setNombreOriginal(enfermedad.nombre);
        setForm({ nombre: enfermedad.nombre, descripcion: enfermedad.descripcion });
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setForm({ nombre: '', descripcion: '' });
    };

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
            await axios.put(`http://localhost:3000/Enfermedades/Actualizar/${nombreOriginal}`, {
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
            await axios.delete(`http://localhost:3000/Enfermedades/Eliminar/${nombre}`);
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

    return (
        <div className="ge-container py-5">
            <div className="gestion-enfermedades-menu-lateral">
                <OffcanvasMenu />
            </div>

            <div className="ge-header text-center mb-4">
                <h2 className="ge-title fw-bold">Gestión de Enfermedades</h2>
                <h5 className="ge-subtitle text-muted">{modoEdicion ? 'Editar Enfermedad' : 'Registrar Nueva Enfermedad'}</h5>
            </div>

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

            <div className="ge-listado">
                <h4 className="ge-list-title mb-3">Listado de Enfermedades</h4>
                {enfermedades.length > 0 ? (
                    <>
                        <p className="ge-total text-muted">Total: {enfermedades.length}</p>
                        <div className="ge-list list-group">
                            {enfermedades.map((enfermedad) => (
                                <div
                                    key={enfermedad.nombre}
                                    className="ge-item list-group-item border rounded mb-3 shadow-sm p-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3"
                                >
                                    <div className="ge-info d-flex flex-column flex-md-row gap-4 flex-grow-1">
                                        <strong className="ge-name">{enfermedad.nombre}</strong>
                                        <span className="ge-description text-muted">{enfermedad.descripcion}</span>
                                    </div>
                                    <div className="ge-actions btn-group">
                                        <button className="ge-btn-edit btn btn-outline-info btn-sm" onClick={() => editar(enfermedad)}>Modificar</button>
                                        <button className="ge-btn-delete btn btn-outline-danger btn-sm" onClick={() => eliminar(enfermedad.nombre)}>Eliminar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="ge-alert alert alert-info" role="alert">
                        <strong>Información:</strong> Actualmente no hay enfermedades registradas.
                    </div>
                )}
            </div>
        </div>
    );
}

export default GestionEnfermedades;
