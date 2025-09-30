import { useEffect, useState, useContext } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import OffcanvasMenu from './menu';
import '../css/citas.css';
import { UserContext } from '../context/UserContext';

function GestionCitas() {
    const [citas, setCitas] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [veterinarios, setVeterinarios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [minFecha, setMinFecha] = useState('');
    const [form, setForm] = useState({
        id_Mascota: '',
        id_cliente: '',
        id_Servicio: '',
        id_veterinario: '',
        fecha: '',
        Descripcion: '',
        estado: 'Pendiente'
    });

    const { User } = useContext(UserContext);
    const puedeGestionar = User.rol === 1 || User.rol === 3; // Admin (1) o Veterinario (3)

    // Cargar datos
    const fetchMascotas = async () => {
        try {
            const res = await axios.get('https://animalbeats-api.onrender.com/mascotas');
            setMascotas(res.data);
        } catch (err) {
            console.error('Error mascotas', err);
        }
    };

    const fetchServicios = async () => {
        try {
            const res = await axios.get('https://animalbeats-api.onrender.com/servicios/Listado');
            setServicios(res.data);
        } catch (err) {
            console.error('Error servicios', err);
        }
    };

    const fetchVeterinarios = async () => {
        try {
            const res = await axios.get('https://animalbeats-api.onrender.com/usuario/Listado');
            const vets = (res.data.usuarios || []).filter(u => Number(u.id_rol) === 3);
            setVeterinarios(vets);
        } catch (err) {
            console.error('Error veterinarios', err);
        }
    };

    const fetchClientes = async () => {
        try {
            const res = await axios.get('https://animalbeats-api.onrender.com/usuarios/Listado');
            const clientesFiltrados = (res.data.usuarios || []).filter(u => Number(u.id_rol) === 2);
            setClientes(clientesFiltrados);
        } catch (err) {
            console.error('Error clientes', err);
        }
    };

    const fetchCitas = async () => {
        try {
            const res = await axios.get('https://animalbeats-api.onrender.com/Citas/Listado');
            const data = Array.isArray(res.data) ? res.data : [];
            setCitas(data);
        } catch (err) {
            console.error('Error citas', err);
        }
    };

    // Fechas mínimas
    useEffect(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const h = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        setMinFecha(`${y}-${m}-${d}T${h}:${min}`);
    }, []);

    useEffect(() => {
        fetchMascotas();
        fetchServicios();
        fetchVeterinarios();
        fetchCitas();
        if (User.rol === 1) fetchClientes();
    }, []);

    // Inputs
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Cliente o Admin solicita cita
    const solicitarCita = async () => {
        if (!form.id_Mascota || !form.id_Servicio || !form.id_veterinario || !form.fecha) {
            Swal.fire('Campos vacíos', 'Completa todos los campos', 'warning');
            return;
        }

        const clienteId = User.rol === 1 ? form.id_cliente : User.id;

        if (User.rol === 1 && !clienteId) {
            Swal.fire('Error', 'Debes seleccionar un cliente', 'warning');
            return;
        }

        try {
            await axios.post('https://animalbeats-api.onrender.com/Citas/Registrar', {
                ...form,
                id_cliente: clienteId,
                estado: 'Pendiente'
            });
            fetchCitas();
            setForm({ id_Mascota: '', id_cliente: '', id_Servicio: '', id_veterinario: '', fecha: '', Descripcion: '', estado: 'Pendiente' });
            Swal.fire('Solicitud enviada', 'La cita está pendiente de aprobación', 'success');
        } catch (err) {
            console.error('Error registrar cita', err);
            Swal.fire('Error', 'No se pudo registrar la cita', 'error');
        }
    };

    // Admin/Vet aceptan/rechazan
    const cambiarEstado = async (id, nuevoEstado) => {
        try {
            await axios.put(`https://animalbeats-api.onrender.com/Citas/Actualizar/${id}`, { estado: nuevoEstado });
            fetchCitas();
            Swal.fire('Estado actualizado', `La cita fue ${nuevoEstado.toLowerCase()}`, 'success');
        } catch (err) {
            console.error('Error actualizar estado', err);
            Swal.fire('Error', 'No se pudo actualizar la cita', 'error');
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
                    {User.rol === 2 ? 'Solicitar Cita' : 'Administrar Citas'}
                </h5>
            </div>

            {/* Formulario visible para clientes y administradores */}
            {(User.rol === 2 || User.rol === 1) && (
                <div className="citas-form row g-3 mb-4">

                    {User.rol === 1 && (
                        <div className="col-md-6">
                            <label>Cliente</label>
                            <select className="form-select" name="id_cliente" value={form.id_cliente} onChange={handleChange}>
                                <option value="">Seleccione</option>
                                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="col-md-6">
                        <label>Mascota</label>
                        <select className="form-select" name="id_Mascota" value={form.id_Mascota} onChange={handleChange}>
                            <option value="">Seleccione</option>
                            {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label>Servicio</label>
                        <select className="form-select" name="id_Servicio" value={form.id_Servicio} onChange={handleChange}>
                            <option value="">Seleccione</option>
                            {servicios.map(s => <option key={s.id} value={s.id}>{s.servicio}</option>)}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label>Veterinario</label>
                        <select className="form-select" name="id_veterinario" value={form.id_veterinario} onChange={handleChange}>
                            <option value="">Seleccione</option>
                            {veterinarios.map(v => <option key={v.n_documento} value={v.n_documento}>{v.nombre}</option>)}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label>Fecha</label>
                        <input type="datetime-local" className="form-control" name="fecha" value={form.fecha} min={minFecha} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label>Descripción</label>
                        <textarea className="form-control" rows="1" name="Descripcion" value={form.Descripcion} onChange={handleChange} />
                    </div>
                    <div className="text-center mt-3">
                        <button className="btn btn-success" onClick={solicitarCita}>
                            {User.rol === 1 ? 'Crear Cita' : 'Solicitar Cita'}
                        </button>
                    </div>
                </div>
            )}

            {/* Listado de citas */}
            <div className="citas-listado">
                <h4>Listado de Citas</h4>
                {citas.length > 0 ? (
                    citas.map(c => (
                        <div key={c.id} className="list-group-item d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <strong>{mascotas.find(m => m.id === c.id_Mascota)?.nombre || c.id_Mascota}</strong> - {c.fecha}
                                <span className={`badge ms-2 ${c.estado === 'Pendiente' ? 'bg-warning' : c.estado === 'Aceptada' ? 'bg-success' : 'bg-danger'}`}>
                                    {c.estado}
                                </span>
                            </div>
                            {puedeGestionar && (
                                <div className="btn-group">
                                    {c.estado === 'Pendiente' && (
                                        <>
                                            <button className="btn btn-outline-success btn-sm" onClick={() => cambiarEstado(c.id, 'Aceptada')}>Aceptar</button>
                                            <button className="btn btn-outline-danger btn-sm" onClick={() => cambiarEstado(c.id, 'Rechazada')}>Rechazar</button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="alert alert-info">No hay citas registradas.</div>
                )}
            </div>
        </div>
    );
}

export default GestionCitas;
