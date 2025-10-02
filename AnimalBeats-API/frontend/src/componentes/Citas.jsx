import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import OffcanvasMenu from "./menu";
import "../css/citas.css";
import { UserContext } from "../context/UserContext";

const GestionCitas = () => {
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [nuevaCita, setNuevaCita] = useState({
    id_mascota: "",
    id_cliente: "",
    id_servicio: "",
    id_veterinario: "",
    fecha: "",
    descripcion: "",
    estado: "Pendiente",
  });
  const [mascotasFiltradas, setMascotasFiltradas] = useState([]);
  const [fechaMinima, setFechaMinima] = useState("");

  const API_URL = "https://animalbeats-api.onrender.com";
  const { User } = useContext(UserContext);

  useEffect(() => {
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, "0");
    const day = String(ahora.getDate()).padStart(2, "0");
    const hours = String(ahora.getHours()).padStart(2, "0");
    const minutes = String(ahora.getMinutes()).padStart(2, "0");
    setFechaMinima(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);

  useEffect(() => {
    if (!User) {
      const usuarioStorage = localStorage.getItem("user");
      if (usuarioStorage) {
        const userParsed = JSON.parse(usuarioStorage);
        console.log("Usuario cargado desde localStorage:", userParsed);
      }
    } else {
      console.log("Rol recibido en Citas:", User.rol);
      console.log("Documento recibido en Citas:", User.n_documento);
    }
  }, [User]);

  useEffect(() => {
    fetchClientes();
    fetchServicios();
    fetchVeterinarios();
    fetchMascotas();
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    try {
      const res = await axios.get(`${API_URL}/Citas/Listado`);
      if (Array.isArray(res.data)) setCitas(res.data);
      else setCitas([]);
    } catch (err) {
      console.error("❌ Error al obtener citas:", err);
      setCitas([]);
    }
  };

  const fetchMascotas = async () => {
    try {
      const res = await axios.get(`${API_URL}/mascotas`);
      setMascotas(res.data || []);
    } catch (err) {
      console.error("❌ Error al obtener mascotas:", err);
      setMascotas([]);
    }
  };

  const fetchClientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/usuario/Listado`);
      const clientesRol2 = (res.data.Usuarios || []).filter((c) => c.id_rol === 2);
      setClientes(clientesRol2);
    } catch (err) {
      console.error("❌ Error al obtener clientes:", err);
      setClientes([]);
    }
  };

  const fetchServicios = async () => {
    try {
      const res = await axios.get(`${API_URL}/servicios/Listado`);
      setServicios(res.data || []);
    } catch (err) {
      console.error("❌ Error al obtener servicios:", err);
      setServicios([]);
    }
  };

  const fetchVeterinarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/veterinarios`);
      setVeterinarios(res.data || []);
    } catch (err) {
      console.error("❌ Error al obtener veterinarios:", err);
      setVeterinarios([]);
    }
  };

  const crearCita = async () => {
    try {
      await axios.post(`${API_URL}/Citas/Crear`, nuevaCita);
      alert("✅ Cita creada correctamente");
      fetchCitas();
      setNuevaCita({
        id_mascota: "",
        id_cliente: "",
        id_servicio: "",
        id_veterinario: "",
        fecha: "",
        descripcion: "",
        estado: "Pendiente",
      });
      setMascotasFiltradas([]);
    } catch (err) {
      console.error("❌ Error al crear cita:", err);
      alert("❌ No se pudo crear la cita.");
    }
  };

  const cambiarEstado = async (id, accion) => {
    try {
      await axios.put(`${API_URL}/Citas/${accion}/${id}`);
      alert(`✅ Cita ${accion} correctamente`);
      fetchCitas();
    } catch (err) {
      console.error(`❌ Error al ${accion} cita:`, err);
      alert(`❌ No se pudo ${accion} la cita.`);
    }
  };

  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    setNuevaCita({ ...nuevaCita, id_cliente: clienteId, id_mascota: "" });

    if (clienteId) {
      const mascotasCliente = mascotas.filter(
        (m) => String(m.id_cliente) === String(clienteId)
      );
      setMascotasFiltradas(mascotasCliente);
    } else {
      setMascotasFiltradas([]);
    }
  };

  const citasFiltradas = citas.filter((c) => {
    if (!User) return false;
    if (User.rol === 2) return String(c.id_cliente) === String(User.n_documento);
    return true;
  });

  return (
    <div className="gc2-container">
      <div className="gc2-menu">
        <OffcanvasMenu />
      </div>

      <div className="gc2-header">
        <h2 className="gc2-title">Gestión de Citas</h2>
        <p className="gc2-subtitle">Administra y controla todas las citas</p>
      </div>

      <form className="gc2-form">
        <div className="gc2-form-group">
          <label className="gc2-label">Tutor</label>
          <select
            className="gc2-select"
            value={nuevaCita.id_cliente}
            onChange={handleClienteChange}
            disabled={User?.rol === 2}
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map((c) => (
              <option key={c.n_documento} value={c.n_documento}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="gc2-form-group">
          <label className="gc2-label">Mascota</label>
          <select
            className="gc2-select"
            value={nuevaCita.id_mascota}
            onChange={(e) =>
              setNuevaCita({ ...nuevaCita, id_mascota: e.target.value })
            }
            disabled={User?.rol === 2}
          >
            <option value="">Seleccione una mascota</option>
            {mascotasFiltradas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="gc2-form-group">
          <label className="gc2-label">Servicio</label>
          <select
            className="gc2-select"
            value={nuevaCita.id_servicio}
            onChange={(e) =>
              setNuevaCita({ ...nuevaCita, id_servicio: e.target.value })
            }
            disabled={User?.rol === 2}
          >
            <option value="">Seleccione un servicio</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.servicio}
              </option>
            ))}
          </select>
        </div>

        <div className="gc2-form-group">
          <label className="gc2-label">Veterinario</label>
          <select
            className="gc2-select"
            value={nuevaCita.id_veterinario}
            onChange={(e) =>
              setNuevaCita({ ...nuevaCita, id_veterinario: e.target.value })
            }
            disabled={User?.rol === 2}
          >
            <option value="">Seleccione un veterinario</option>
            {veterinarios.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nombre_completo}
              </option>
            ))}
          </select>
        </div>

        <div className="gc2-form-group">
          <label className="gc2-label">Fecha</label>
          <input
            type="datetime-local"
            className="gc2-input"
            value={nuevaCita.fecha}
            onChange={(e) =>
              setNuevaCita({ ...nuevaCita, fecha: e.target.value })
            }
            min={fechaMinima}
            disabled={User?.rol === 2}
          />
        </div>

        <div className="gc2-form-group gc2-form-textarea">
          <label className="gc2-label">Descripción</label>
          <textarea
            className="gc2-textarea"
            value={nuevaCita.descripcion}
            onChange={(e) =>
              setNuevaCita({ ...nuevaCita, descripcion: e.target.value })
            }
            disabled={User?.rol === 2}
          />
        </div>

        {User?.rol !== 2 && (
          <div className="gc2-actions">
            <button type="button" className="gc2-btn-save" onClick={crearCita}>
              Crear Cita
            </button>
            <button type="reset" className="gc2-btn-cancel">
              Cancelar
            </button>
          </div>
        )}
      </form>

      <div className="gc2-listado">
        <h4 className="gc2-listado-titulo">Listado de Citas</h4>
        {citasFiltradas.length > 0 ? (
          <ul className="gc2-list">
            {citasFiltradas.map((c) => (
              <li key={c.id} className="gc2-item">
                <div className="gc2-item-info">
                  <span>Mascota: {c.mascota?.nombre || `ID ${c.id_mascota}`}</span>
                  <span>Servicio: {c.servicios?.servicio || `ID ${c.id_servicio}`}</span>
                  <span>Veterinario: {c.veterinarios?.nombre_completo || `ID ${c.id_veterinario}`}</span>
                  <span>Tutor: {c.usuarios?.nombre || `ID ${c.id_cliente}`}</span>
                  <span>Fecha: {c.fecha}</span>
                  <span
                    className={`gc2-badge ${
                      c.estado === "Pendiente"
                        ? "gc2-warning"
                        : c.estado === "Confirmado"
                        ? "gc2-success"
                        : c.estado === "Cancelado"
                        ? "gc2-danger"
                        : "gc2-secondary"
                    }`}
                  >
                    {c.estado}
                  </span>
                </div>

                {User && User.rol !== 2 && (
                  <div className="gc2-actions gc2-btn-group">
                    {c.estado === "Pendiente" && User?.rol === 1 && (
                      <button
                        className="gc2-btn-eliminar"
                        onClick={() => cambiarEstado(c.id, "Cancelar")}
                      >
                        Eliminar
                      </button>
                    )}
                    {c.estado === "Solicitud" && (User?.rol === 1 || User?.rol === 3) && (
                      <button
                        className="gc2-btn-save"
                        onClick={() => cambiarEstado(c.id, "Confirmar")}
                      >
                        Confirmar
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="gc2-alert">No hay citas registradas.</div>
        )}
      </div>
    </div>
  );
};

export default GestionCitas;
