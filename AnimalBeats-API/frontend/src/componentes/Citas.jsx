import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import OffcanvasMenu from "./menu";
import "../css/Citas_Mascotas.css";
import { UserContext } from "../context/UserContext";

const GestionCitasUnique = () => {
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
  const [fechaMinima, setFechaMinima] = useState("");
  const [pestañaActiva, setPestañaActiva] = useState("Pendiente"); // Controla la pestaña

  const API_URL = "https://animalbeats-api.onrender.com";
  const { User } = useContext(UserContext);

  const documentoUsuario = User?.n_documento || JSON.parse(localStorage.getItem("user") || "{}").n_documento;
  const rolActual = User?.rol || JSON.parse(localStorage.getItem("user") || "{}").rol;

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
    fetchClientes();
    fetchServicios();
    fetchVeterinarios();
    fetchMascotas();
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    try {
      const res = await axios.get(`${API_URL}/Citas/Listado`);
      setCitas(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCitas([]);
    }
  };

  const fetchMascotas = async () => {
    try {
      const res = await axios.get(`${API_URL}/mascotas`);
      let mascotasData = res.data || [];
      if (rolActual === 2) {
        mascotasData = mascotasData.filter(m => String(m.id_cliente) === String(documentoUsuario));
      }
      setMascotas(mascotasData);
    } catch {
      setMascotas([]);
    }
  };

  const fetchClientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/usuario/Listado`);
      setClientes((res.data.Usuarios || []).filter((c) => c.id_rol === 2));
    } catch {
      setClientes([]);
    }
  };

  const fetchServicios = async () => {
    try {
      const res = await axios.get(`${API_URL}/servicios/Listado`);
      setServicios(res.data || []);
    } catch {
      setServicios([]);
    }
  };

  const fetchVeterinarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/veterinarios`);
      setVeterinarios(res.data || []);
    } catch {
      setVeterinarios([]);
    }
  };

  const crearCita = async () => {
    try {
      await axios.post(`${API_URL}/Citas/Crear`, nuevaCita);
      alert("✅ Cita creada correctamente");
      fetchCitas();
      resetFormulario();
    } catch {
      alert("❌ No se pudo crear la cita.");
    }
  };

  const crearCitaConEstado = async (cita) => {
    try {
      await axios.post(`${API_URL}/Citas/Crear`, cita);
      alert("✅ Cita solicitada correctamente");
      fetchCitas();
      resetFormulario();
    } catch {
      alert("❌ No se pudo solicitar la cita.");
    }
  };

  const cambiarEstado = async (id, accion) => {
    try {
      await axios.put(`${API_URL}/Citas/${accion}/${id}`);
      fetchCitas();
    } catch {
      alert(`❌ No se pudo ${accion} la cita.`);
    }
  };

  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    setNuevaCita({ ...nuevaCita, id_cliente: clienteId, id_mascota: "" });
    if (rolActual !== 2) {
      setMascotas(mascotas.filter((m) => String(m.id_cliente) === String(clienteId)));
    }
  };

  const resetFormulario = () => {
    setNuevaCita({
      id_mascota: "",
      id_cliente: rolActual === 2 ? documentoUsuario : "",
      id_servicio: "",
      id_veterinario: "",
      fecha: "",
      descripcion: "",
      estado: "Pendiente",
    });
  };

  const citasFiltradas = citas.filter((c) => {
    if (!rolActual) return false;
    if (rolActual === 2) {
      return String(c.usuarios?.n_documento) === String(documentoUsuario);
    }
    return true;
  });

  // Filtrar por pestaña
  const citasPorPestaña = citasFiltradas.filter((c) => {
    if (pestañaActiva === "Pendiente") return c.estado === "Pendiente";
    if (pestañaActiva === "Solicitud") return c.estado === "Solicitud";
    if (pestañaActiva === "Completadas") return c.estado === "Completado" || c.estado === "Cancelado";
    return true;
  });

  return (
    <div className="citas-container">
      <div className="citas-menu">
        <OffcanvasMenu />
      </div>

      <div className="citas-header">
        <h2>Gestión de Citas 🐾</h2>
        <p>Administra y controla todas las citas de manera sencilla</p>
      </div>

      <form className="citas-form">
        {rolActual !== 2 && (
          <div className="citas-form-group">
            <label>Tutor</label>
            <select value={nuevaCita.id_cliente} onChange={handleClienteChange}>
              <option value="">Seleccione un cliente</option>
              {clientes.map((c) => (
                <option key={c.n_documento} value={c.n_documento}>{c.nombre}</option>
              ))}
            </select>
          </div>
        )}

        <div className="citas-form-group">
          <label>Mascota</label>
          <select value={nuevaCita.id_mascota} onChange={(e) => setNuevaCita({ ...nuevaCita, id_mascota: e.target.value })}>
            <option value="">Seleccione una mascota</option>
            {mascotas.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>

        <div className="citas-form-group">
          <label>Servicio</label>
          <select value={nuevaCita.id_servicio} onChange={(e) => setNuevaCita({ ...nuevaCita, id_servicio: e.target.value })}>
            <option value="">Seleccione un servicio</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>{s.servicio}</option>
            ))}
          </select>
        </div>

        <div className="citas-form-group">
          <label>Veterinario</label>
          <select value={nuevaCita.id_veterinario} onChange={(e) => setNuevaCita({ ...nuevaCita, id_veterinario: e.target.value })}>
            <option value="">Seleccione un veterinario</option>
            {veterinarios.map((v) => (
              <option key={v.id} value={v.id}>{v.nombre_completo}</option>
            ))}
          </select>
        </div>

        <div className="citas-form-group">
          <label>Fecha</label>
          <input type="datetime-local" value={nuevaCita.fecha} onChange={(e) => setNuevaCita({ ...nuevaCita, fecha: e.target.value })} min={fechaMinima}/>
        </div>

        <div className="citas-form-group citas-textarea">
          <label>Descripción</label>
          <textarea value={nuevaCita.descripcion} onChange={(e) => setNuevaCita({ ...nuevaCita, descripcion: e.target.value })}/>
        </div>

        {rolActual === 2 ? (
          <div className="citas-actions">
            <button type="button" onClick={() => crearCitaConEstado({ ...nuevaCita, id_cliente: documentoUsuario, estado: "Solicitud" })}>
              Solicitar Cita
            </button>
            <button type="reset" onClick={resetFormulario}>Cancelar</button>
          </div>
        ) : (
          <div className="citas-actions">
            <button type="button" onClick={crearCita}>Crear Cita</button>
            <button type="reset" onClick={resetFormulario}>Cancelar</button>
          </div>
        )}
      </form>

      {/* Pestañas */}
      <div className="citas-tabs">
        <button className={pestañaActiva === "Pendiente" ? "active" : ""} onClick={() => setPestañaActiva("Pendiente")}>Pendientes</button>
        <button className={pestañaActiva === "Solicitud" ? "active" : ""} onClick={() => setPestañaActiva("Solicitud")}>Solicitudes</button>
        <button className={pestañaActiva === "Completadas" ? "active" : ""} onClick={() => setPestañaActiva("Completadas")}>Completadas / Canceladas</button>
      </div>

      <div className="citas-listado">
        {citasPorPestaña.length === 0 ? (
          <p className="citas-empty">No hay citas en esta categoría</p>
        ) : (
          citasPorPestaña.map((c) => (
            <div key={c.id} className="citas-card">
              <div>
                <h3>{c.mascota?.nombre || `Mascota ID ${c.id_mascota}`}</h3>
                <p>Servicio: {c.servicios?.servicio || c.id_servicio}</p>
                <p>Veterinario: {c.veterinarios?.nombre_completo || c.id_veterinario}</p>
                <p>Tutor: {c.usuarios?.nombre || c.id_cliente}</p>
                <p>Fecha: {c.fecha}</p>
                <span className={`citas-badge ${c.estado.toLowerCase()}`}>{c.estado}</span>
              </div>
              {rolActual !== 2 && (
                <div className="citas-card-actions">
                  {c.estado === "Pendiente" && rolActual === 1 && <button className="delete" onClick={() => cambiarEstado(c.id, "Cancelar")}>Eliminar</button>}
                  {c.estado === "Solicitud" && (rolActual === 1 || rolActual === 3) && <button className="confirm" onClick={() => cambiarEstado(c.id, "Confirmar")}>Confirmar</button>}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GestionCitasUnique;
