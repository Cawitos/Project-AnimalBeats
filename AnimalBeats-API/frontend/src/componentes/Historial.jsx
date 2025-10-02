import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import OffcanvasMenu from "../componentes/menu";
import { Link, useParams } from "react-router-dom";
import "../css/historial.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";
import { UserContext } from "../context/UserContext";
import Swal from "sweetalert2";

const Historial = () => {
  const { id } = useParams();
  const { User } = useContext(UserContext);

  const [mascotaInfo, setMascotaInfo] = useState({});
  const [historialMedico, setHistorialMedico] = useState([]);
  const [citasInfo, setCitasInfo] = useState([]);
  const [errorMascota, setErrorMascota] = useState(null);
  const [errorCita, setErrorCita] = useState(null);
  const [errorHistorial, setErrorHistorial] = useState(null);

  const [modalCitaVisible, setModalCitaVisible] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    try {
      return new Date(fecha).toLocaleDateString();
    } catch {
      return fecha;
    }
  };

  const formatHora = (fecha) => {
    if (!fecha) return "-";
    try {
      return new Date(fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "-";
    }
  };

  // --- Fetch Mascota ---
  useEffect(() => {
    const fetchMascota = async () => {
      try {
        const { data } = await axios.get(`https://animalbeats-api.onrender.com/Mascotas/${id}`);
        if (data?.mensaje || typeof data === "string") {
          setMascotaInfo({});
          setErrorMascota(data.mensaje || data);
        } else {
          setMascotaInfo(data);
          setErrorMascota(null);
        }
      } catch {
        setMascotaInfo({});
        setErrorMascota("Error al conectar con el servidor");
      }
    };
    if (id) fetchMascota();
  }, [id]);

  // --- Fetch Citas ---
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const { data } = await axios.get(`https://animalbeats-api.onrender.com/Citas/mascota/${id}`);
        if (Array.isArray(data)) {
          setCitasInfo(data);
          setErrorCita(data.length === 0 ? "No hay citas registradas para esta mascota" : null);
        } else if (data?.mensaje) {
          setCitasInfo([]);
          setErrorCita(data.mensaje);
        } else {
          setCitasInfo([]);
          setErrorCita("No se encontró información de citas");
        }
      } catch {
        setCitasInfo([]);
        setErrorCita("No hay recordatorios registrados");
      }
    };
    if (id) fetchCitas();
  }, [id]);

  // --- Fetch Historial ---
  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const { data } = await axios.get(`https://animalbeats-api.onrender.com/recordatorio/mascota/${id}`);
        if (Array.isArray(data)) {
          setHistorialMedico(data);
          setErrorHistorial(data.length === 0 ? "No hay recordatorios registrados" : null);
        } else if (data?.mensaje) {
          setHistorialMedico([]);
          setErrorHistorial(data.mensaje);
        } else {
          setHistorialMedico([]);
          setErrorHistorial("No se encontró historial médico");
        }
      } catch {
        setHistorialMedico([]);
        setErrorHistorial("No hay recordatorios registrados");
      }
    };
    if (id) fetchHistorial();
  }, [id]);

  // --- Modal ---
  const abrirModal = (cita) => {
    setCitaSeleccionada(cita);
    setNuevaDescripcion("");
    setModalCitaVisible(true);
  };

  const cerrarModal = () => {
    setModalCitaVisible(false);
    setCitaSeleccionada(null);
  };

  // --- Procesar Cita ---
  const procesarCita = async () => {
    if (!citaSeleccionada) return;

    const timestamp = new Date().toLocaleString();
    const descripcionAnterior = citaSeleccionada.descripcion || "";
    const descripcionActualizada = `${descripcionAnterior}\n\n--- Procesos de la cita ---\n[${timestamp}] ${nuevaDescripcion}`;

    try {
      await axios.put(`https://animalbeats-api.onrender.com/Citas/Actualizar/${citaSeleccionada.id}`, {
        ...citaSeleccionada,
        descripcion: descripcionActualizada,
        estado: "Completado",
      });

      Swal.fire("✅ Cita procesada", "La cita ha sido actualizada correctamente", "success");
      setCitasInfo(prev =>
        prev.map(c => c.id === citaSeleccionada.id
          ? { ...c, descripcion: descripcionActualizada, estado: "Completado" }
          : c
        )
      );
      cerrarModal();
    } catch {
      Swal.fire("Error", "No se pudo procesar la cita", "error");
    }
  };

  // --- Descargar PDF ---
  const descargarHistorial = () => {
    try {
      const doc = new jsPDF();
      const ahora = new Date();
      const fechaHora = ahora.toLocaleString();

      doc.addImage(logo, "PNG", 15, 10, 25, 25);
      doc.setFontSize(18);
      doc.text(`Historial Médico - ${mascotaInfo.nombre || "Mascota"}`, 50, 20);
      doc.setFontSize(12);
      doc.text(`Descargado el: ${fechaHora}`, 50, 30);

      let startY = 40;

      if (mascotaInfo && Object.keys(mascotaInfo).length > 0) {
        autoTable(doc, {
          startY,
          head: [["ID", "Nombre", "Nacimiento", "Especie", "Raza", "Tutor"]],
          body: [[
            mascotaInfo.id || "-",
            mascotaInfo.nombre || "-",
            formatFecha(mascotaInfo.fecha_nacimiento),
            mascotaInfo.especie?.especie || "-",
            mascotaInfo.raza?.raza || "-",
            mascotaInfo.usuarios?.nombre || "-"
          ]],
          theme: "grid",
          headStyles: { fillColor: [223, 41, 53], textColor: 255 },
        });
        startY = doc.lastAutoTable.finalY + 10;
      }

      doc.text("Recordatorios", 15, startY);
      startY += 5;
      if (historialMedico.length > 0) {
        autoTable(doc, {
          startY,
          head: [["Fecha", "Hora", "Descripción"]],
          body: historialMedico.map(r => [
            formatFecha(r.fecha),
            formatHora(r.fecha),
            r.descripcion || "-"
          ]),
          theme: "grid",
          headStyles: { fillColor: [223, 41, 53], textColor: 255 },
        });
        startY = doc.lastAutoTable.finalY + 10;
      }

      doc.text("Citas", 15, startY);
      startY += 5;
      if (citasInfo.length > 0) {
        autoTable(doc, {
          startY,
          head: [["Fecha", "Hora", "Servicio", "Estado"]],
          body: citasInfo.map(c => [
            formatFecha(c.fecha),
            formatHora(c.fecha),
            c.servicios?.servicio || "-",
            c.estado || "-"
          ]),
          theme: "grid",
          headStyles: { fillColor: [223, 41, 53], textColor: 255 },
        });
      }

      doc.save(`historial_mascota_${mascotaInfo.nombre || id}.pdf`);
    } catch {
      Swal.fire("Error", "No se pudo generar el PDF.", "error");
    }
  };

  return (
    <div className="historial-container container py-5 mt-5">
      <nav className="historial-menu-lateral">
        <OffcanvasMenu />
      </nav>

      <div className="historial-contenido-principal">
        <h1 className="historial-titulo-principal">Historial Médico de la Mascota</h1>

        <div className="historial-seccion">
          <h3 className="historial-subtitulo">Información de la Mascota</h3>
          {errorMascota ? (
            <p className="historial-error">{errorMascota}</p>
          ) : (
            <table className="historial-tabla">
              <tbody>
                <tr><th>ID</th><td>{mascotaInfo.id || "-"}</td></tr>
                <tr><th>Nombre</th><td>{mascotaInfo.nombre || "-"}</td></tr>
                <tr><th>Fecha Nacimiento</th><td>{formatFecha(mascotaInfo.fecha_nacimiento)}</td></tr>
                <tr><th>Especie</th><td>{mascotaInfo.especie?.especie || "-"}</td></tr>
                <tr><th>Raza</th><td>{mascotaInfo.raza?.raza || "-"}</td></tr>
                <tr><th>Tutor</th><td>{mascotaInfo.usuarios?.nombre || "-"}</td></tr>
              </tbody>
            </table>
          )}
        </div>

        <div className="historial-seccion mt-4">
          <h3 className="historial-subtitulo">Recordatorios</h3>
          {errorHistorial ? (
            <p className="historial-error">{errorHistorial}</p>
          ) : (
            <table className="historial-tabla">
              <thead>
                <tr><th>Fecha</th><th>Hora</th><th>Descripción</th></tr>
              </thead>
              <tbody>
                {historialMedico.map((item, index) => (
                  <tr key={index}>
                    <td>{formatFecha(item.fecha)}</td>
                    <td>{formatHora(item.fecha)}</td>
                    <td>{item.descripcion || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="historial-seccion mt-4">
          <h3 className="historial-subtitulo">Citas</h3>
          {errorCita ? (
            <p className="historial-error">{errorCita}</p>
          ) : (
            <table className="historial-tabla">
              <thead>
                <tr><th>Fecha</th><th>Hora</th><th>Servicio</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {citasInfo.map((cita, index) => (
                  <tr key={index}>
                    <td>{formatFecha(cita.fecha)}</td>
                    <td>{formatHora(cita.fecha)}</td>
                    <td>{cita.servicios?.servicio || "-"}</td>
                    <td>
                      {cita.estado.toLowerCase() === "pendiente" && (User?.rol === 1 || User?.rol === 3) ? (
                        <button className="historial-btn-procesar" onClick={() => abrirModal(cita)}>Procesar Cita</button>
                      ) : (
                        cita.estado || "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {modalCitaVisible && citaSeleccionada && (
          <div className="historial-modal-backdrop">
            <div className="historial-modal">
              <h3>Procesar Cita</h3>
              <p><strong>Mascota:</strong> {citaSeleccionada.nombre}</p>
              <p><strong>Servicio:</strong> {citaSeleccionada.servicios?.servicio || "-"}</p>
              <p><strong>Veterinario:</strong> {citaSeleccionada.nombre_veterinario}</p>
              <p><strong>Fecha:</strong> {formatFecha(citaSeleccionada.fecha)}</p>
              <p><strong>Hora:</strong> {formatHora(citaSeleccionada.fecha)}</p>
              <p><strong>Descripción actual:</strong></p>
              <pre className="historial-modal-descripcion">{citaSeleccionada.descripcion || "Sin descripción"}</pre>

              <textarea
                placeholder="Añadir procesos dentro de la cita..."
                value={nuevaDescripcion}
                onChange={(e) => setNuevaDescripcion(e.target.value)}
              />

              <div className="historial-modal-botones">
                <button className="historial-btn-cancelar" onClick={cerrarModal}>Cancelar</button>
                <button className="historial-btn-guardar" onClick={procesarCita}>Guardar</button>
              </div>
            </div>
          </div>
        )}

        <div className="historial-botones mt-4">
          <button className="btn btn-success me-2" onClick={descargarHistorial}>📄 Descargar PDF</button>
          <Link to="/Mascotas" className="btn btn-secondary">Volver</Link>
        </div>
      </div>
    </div>
  );
};

export default Historial;
