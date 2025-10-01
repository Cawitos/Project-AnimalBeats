import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [duenos, setDuenos] = useState([]);

  const [nuevaCita, setNuevaCita] = useState({
    id_cliente: "",
    id_mascota: "",
    id_servicio: "",
    id_veterinario: "",
    fecha: "",
    descripcion: "",
    estado: "Pendiente",
  });

  const API_URL = "http://localhost:3000"; // 🔹 Ajusta si es diferente
  const idRol = localStorage.getItem("id_rol"); // 🔹 Rol del usuario logueado

  // Cargar datos iniciales
  useEffect(() => {
    obtenerCitas();
    obtenerDuenos();
    obtenerServicios();
    obtenerVeterinarios();
  }, []);

  // Si cambia dueño, cargar mascotas
  useEffect(() => {
    if (nuevaCita.id_cliente) {
      obtenerMascotas(nuevaCita.id_cliente);
    }
  }, [nuevaCita.id_cliente]);

  const obtenerCitas = async () => {
    try {
      const res = await axios.get(`${API_URL}/citas/Listado`);
      setCitas(res.data);
    } catch (err) {
      console.error("Error al obtener citas:", err);
    }
  };

  const obtenerDuenos = async () => {
    try {
      const res = await axios.get(`${API_URL}/usuarios/Duenos`);
      setDuenos(res.data);
    } catch (err) {
      console.error("Error al obtener dueños:", err);
    }
  };

  const obtenerMascotas = async (id_cliente) => {
    try {
      const res = await axios.get(`${API_URL}/mascotas/PorDueno/${id_cliente}`);
      setMascotas(res.data);
    } catch (err) {
      console.error("Error al obtener mascotas:", err);
    }
  };

  const obtenerServicios = async () => {
    try {
      const res = await axios.get(`${API_URL}/servicios/Listado`);
      setServicios(res.data);
    } catch (err) {
      console.error("Error al obtener servicios:", err);
    }
  };

  const obtenerVeterinarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/veterinarios/Listado`);
      setVeterinarios(res.data);
    } catch (err) {
      console.error("Error al obtener veterinarios:", err);
    }
  };

  const handleChange = (e) => {
    setNuevaCita({ ...nuevaCita, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/citas/Crear`, nuevaCita);
      obtenerCitas();
      setNuevaCita({
        id_cliente: "",
        id_mascota: "",
        id_servicio: "",
        id_veterinario: "",
        fecha: "",
        descripcion: "",
        estado: "Pendiente",
      });
    } catch (err) {
      console.error("Error al crear cita:", err);
    }
  };

  const cambiarEstado = async (id, accion) => {
    try {
      await axios.put(`${API_URL}/citas/ActualizarEstado/${id}`, { accion });
      obtenerCitas();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Gestión de Citas</h2>

      {/* 📌 Formulario */}
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm mb-4">
        <h4 className="mb-3">Crear Nueva Cita</h4>

        {/* Seleccionar dueño */}
        <div className="mb-3">
          <label className="form-label">Dueño</label>
          <select
            className="form-select"
            name="id_cliente"
            value={nuevaCita.id_cliente}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione dueño</option>
            {duenos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.n_documento} - {d.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Seleccionar mascota */}
        <div className="mb-3">
          <label className="form-label">Mascota</label>
          <select
            className="form-select"
            name="id_mascota"
            value={nuevaCita.id_mascota}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione mascota</option>
            {mascotas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Servicio */}
        <div className="mb-3">
          <label className="form-label">Servicio</label>
          <select
            className="form-select"
            name="id_servicio"
            value={nuevaCita.id_servicio}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione servicio</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.servicio}
              </option>
            ))}
          </select>
        </div>

        {/* Veterinario */}
        <div className="mb-3">
          <label className="form-label">Veterinario</label>
          <select
            className="form-select"
            name="id_veterinario"
            value={nuevaCita.id_veterinario}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione veterinario</option>
            {veterinarios.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nombre_completo}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div className="mb-3">
          <label className="form-label">Fecha</label>
          <input
            type="datetime-local"
            className="form-control"
            name="fecha"
            value={nuevaCita.fecha}
            onChange={handleChange}
            required
          />
        </div>

        {/* Descripción */}
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea
            className="form-control"
            name="descripcion"
            value={nuevaCita.descripcion}
            onChange={handleChange}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary">
          Crear Cita
        </button>
      </form>

      {/* 📌 Listado de citas */}
      <div className="citas-listado">
        <h4 className="mb-3">Listado de Citas</h4>
        {citas.length > 0 ? (
          citas.map((c) => (
            <div
              key={c.id}
              className="list-group-item d-flex justify-content-between align-items-center mb-2 p-3 shadow-sm rounded"
            >
              <div>
                <strong>{c.mascota?.nombre || `Mascota ID ${c.id_mascota}`}</strong>{" "}
                - {c.servicios?.servicio || `Servicio ID ${c.id_servicio}`} -{" "}
                {c.veterinarios?.nombre_completo || `Veterinario ID ${c.id_veterinario}`}{" "}
                - {c.usuarios?.nombre || `Cliente ID ${c.id_cliente}`} - {c.fecha}
                <span
                  className={`badge ms-2 ${
                    c.estado === "Pendiente"
                      ? "bg-warning"
                      : c.estado === "Solicitud"
                      ? "bg-info"
                      : c.estado === "Completado"
                      ? "bg-success"
                      : c.estado === "Cancelado"
                      ? "bg-danger"
                      : "bg-secondary"
                  }`}
                >
                  {c.estado}
                </span>
              </div>

              {/* Botones dinámicos */}
              <div className="btn-group">
                {c.estado === "Pendiente" && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => cambiarEstado(c.id, "Cancelar")}
                  >
                    Eliminar
                  </button>
                )}

                {c.estado === "Solicitud" &&
                  (idRol === "1" || idRol === "3") && (
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => cambiarEstado(c.id, "Confirmar")}
                    >
                      Confirmar
                    </button>
                  )}
              </div>
            </div>
          ))
        ) : (
          <div className="alert alert-info">No hay citas registradas.</div>
        )}
      </div>
    </div>
  );
}
