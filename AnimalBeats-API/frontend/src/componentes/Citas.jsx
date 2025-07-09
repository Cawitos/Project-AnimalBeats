import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import OffcanvasMenu from './menu';
import '../css/citas.css'

function GestionCitas() {
    const [citas, setCitas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [form, setForm] = useState({
        id: '',
        id_Mascota: '',
        id_cliente: '',
        id_Servicio: '',
        fecha: '',
        Descripcion: ''
    });
    const [modoEdicion, setModoEdicion] = useState(false);
    const fetchUsuarios = async () => {
        try {
            const res = await axios.get('http://localhost:3000/usuario/Listado');
            const users = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.usuarios)
                    ? res.data.usuarios
                    : [];
            setUsuarios(users);
        } catch (err) {
            console.error('Error al cargar usuarios', err);
            setUsuarios([]);
        }
    };

    const fetchMascotas = async () => {
        try {
            const res = await axios.get('http://localhost:3000/mascotas');
            const pets = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.mascotas)
                    ? res.data.mascotas
                    : [];
            setMascotas(pets);
        } catch (err) {
            console.error('Error al cargar mascotas', err);
            setMascotas([]);
        }
    };

    const fetchServicios = async () => {
        try {
            const res = await axios.get('http://localhost:3000/servicios/Listado');
            const servs = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.servicios)
                    ? res.data.servicios
                    : [];
            setServicios(servs);
        } catch (err) {
            console.error('Error al cargar servicios', err);
            setServicios([]);
        }
    };

    const fetchCitas = async () => {
        try {
            const res = await axios.get('http://localhost:3000/Citas/Listado');
            const data = Array.isArray(res.data)
                ? res.data.map((cita) => ({
                    ...cita,
                    fecha: new Date(cita.fecha).toISOString().slice(0, 16) // para datetime-local
                }))
                : [];
            setCitas(data);
        } catch (err) {
            console.error('Error al cargar citas', err);
            setCitas([]);
        }
    };

    useEffect(() => {
        fetchUsuarios();
        fetchMascotas();
        fetchServicios();
        fetchCitas();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'id_Mascota') {
            // Al seleccionar mascota, asignar cliente automáticamente
            const pet = mascotas.find((m) => String(m.id) === value);
            setForm((prev) => ({
                ...prev,
                id_Mascota: value,
                id_cliente: pet ? pet.id_cliente : ''
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const guardar = async () => {
        const { id_Mascota, id_cliente, id_Servicio, fecha } = form;
        if (!id_Mascota || !id_cliente || !id_Servicio || !fecha) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos obligatorios vacíos',
                text: 'Por favor, completa todos los campos obligatorios.'
            });
            return;
        }
        try {
            await axios.post('http://localhost:3000/Citas/Registrar', form);
            fetchCitas();
            setForm({ id: '', id_Mascota: '', id_cliente: '', id_Servicio: '', fecha: '', Descripcion: '' });
            Swal.fire({
                icon: 'success',
                title: 'Registrado',
                text: 'La cita fue registrada correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Error al registrar cita', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al registrar la cita.'
            });
        }
    };

    const editar = (cita) => {
        setModoEdicion(true);
        setForm(cita);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setForm({ id: '', id_Mascota: '', id_cliente: '', id_Servicio: '', fecha: '', Descripcion: '' });
    };

    const guardarEdicion = async () => {
        const { id, id_Mascota, id_cliente, id_Servicio, fecha } = form;
        if (!id_Mascota || !id_cliente || !id_Servicio || !fecha) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos obligatorios vacíos',
                text: 'Por favor, completa todos los campos obligatorios.'
            });
            return;
        }
        try {
            await axios.put(`http://localhost:3000/Citas/Actualizar/${id}`, form);
            fetchCitas();
            cancelarEdicion();
            Swal.fire({
                icon: 'success',
                title: 'Actualizada',
                text: 'La cita fue actualizada correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Error al actualizar cita', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar la cita.'
            });
        }
    };

    const eliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará la cita permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (!result.isConfirmed) return;
        try {
            await axios.delete(`http://localhost:3000/Citas/Eliminar/${id}`);
            fetchCitas();
            Swal.fire({
                icon: 'success',
                title: 'Eliminada',
                text: 'La cita fue eliminada correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Error al eliminar cita', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar la cita.'
            });
        }
    };

    return (
        <div className="citas-container py-5">
            <div className="citas-menu">
                <OffcanvasMenu />
            </div>
            <div className="citas-header mb-4 text-center">
                <h2 className="citas-title fw-bold">Gestión de Citas</h2>
                <h5 className="citas-subtitle text-muted">
                    {modoEdicion ? 'Editar Cita' : 'Registrar Nueva Cita'}
                </h5>
            </div>
            <div className="citas-form row g-3 mb-4">
                <div className="citas-form-group col-md-4">
                    <label className="citas-label form-label">Mascota</label>
                    <select
                        className="citas-select form-select"
                        name="id_Mascota"
                        value={form.id_Mascota}
                        onChange={handleChange}
                    >
                        <option value="">Seleccione una mascota</option>
                        {mascotas.map((m) => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="citas-form-group col-md-4">
                    <label className="citas-label form-label">Servicio</label>
                    <select
                        className="citas-select form-select"
                        name="id_Servicio"
                        value={form.id_Servicio}
                        onChange={handleChange}
                    >
                        <option value="">Seleccione un servicio</option>
                        {servicios.map((s) => (
                            <option key={s.id} value={s.id}>{s.servicio}</option>
                        ))}
                    </select>
                </div>
                <div className="citas-form-group col-md-4">
                    <label className="citas-label form-label">Fecha</label>
                    <input
                    type="datetime-local"
                    className="citas-input form-control"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    required
                    />
                </div>
                <div className="citas-form-group col-md-12">
                    <label className="citas-label form-label">Descripción</label>
                    <textarea
                        className="citas-textarea form-control"
                        rows="1"
                        name="Descripcion"
                        value={form.Descripcion}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="citas-actions text-center mb-5">
                {modoEdicion ? (
                    <div className="citas-btn-group btn-group">
                        <button className="citas-btn-save btn btn-outline-success" onClick={guardarEdicion}>Guardar Cambios</button>
                        <button className="citas-btn-cancel btn btn-outline-secondary" onClick={cancelarEdicion}>Cancelar</button>
                    </div>
                ) : (
                    <button className="citas-btn-register btn btn-success px-4" onClick={guardar}>Registrar</button>
                )}
            </div>
            <div className="citas-listado">
                <h4 className="citas-listado-titulo mb-3">Listado de Citas</h4>
                {citas.length > 0 ? (
                    <div className="citas-list list-group">
                        <p className="citas-total text-muted">Total de Citas: {citas.length}</p>
                        {citas.map((cita) => (
                            <div
                                key={cita.id_Mascota}
                                className="citas-item list-group-item mb-3 rounded shadow-sm border d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 p-3"
                            >
                                <div className="citas-item-info d-flex flex-column flex-md-row flex-wrap gap-3">
                                    <span><strong>Mascota:</strong> {mascotas.find((m) => m.id === cita.id_Mascota)?.nombre || cita.id_Mascota}</span>
                                    <span><strong>Cliente:</strong> {usuarios.find(u => u.id === cita.id_cliente)?.nombre || cita.id_cliente}</span>
                                    <span><strong>Servicio:</strong> {servicios.find((s) => s.id === cita.id_Servicio)?.servicio || cita.id_Servicio}</span>
                                    <span><strong>Fecha:</strong> {cita.fecha}</span>
                                    <span><strong>Descripción:</strong> {cita.Descripcion}</span>
                                </div>
                                <div className="citas-item-btns btn-group">
                                    <button className="citas-btn-modificar btn btn-outline-info btn-sm" onClick={() => editar(cita)}>Modificar</button>
                                    <button className="citas-btn-eliminar btn btn-outline-danger btn-sm" onClick={() => eliminar(cita.id)}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="citas-alert alert alert-info">No hay citas registradas.</div>
                )}
            </div>
        </div>
    );
}

export default GestionCitas;
