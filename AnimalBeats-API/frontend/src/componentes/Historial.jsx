import React, { useEffect, useState } from "react";
import axios from "axios";
import OffcanvasMenu from "../componentes/menu";
import { Link, useParams } from "react-router-dom";
import '../css/historial.css';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";

const Historial = () => {
  const { id } = useParams();

  const [mascotaInfo, setMascotaInfo] = useState({});
  const [historialMedico, setHistorialMedico] = useState([]);
  const [citasInfo, setCitasInfo] = useState([]);

  const [errorMascota, setErrorMascota] = useState(null);
  const [errorCita, setErrorCita] = useState(null);
  const [errorHistorial, setErrorHistorial] = useState(null);

  // Fecha y hora actual para mostrar en el PDF
  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, '0');
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const anio = ahora.getFullYear();
  const hora = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');
  const fechaHoraFormateada = `${dia}/${mes}/${anio} ${hora}:${minutos}:${segundos}`;

  // Helper para formatear fecha (solo fecha)
  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    try {
      return new Date(fecha).toLocaleDateString();
    } catch {
      return fecha;
    }
  };

  // Helper para formatear hora a HH:mm
  const formatHora = (fecha) => {
    if (!fecha) return "-";
    try {
      return new Date(fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "-";
    }
  };

  // Obtener datos de la mascota
  useEffect(() => {
    const obtenerDatosMascota = async () => {
      try {
        const { data } = await axios.get(`https://animalbeats-api.onrender.com/Mascotas/${id}`);

        if (data?.mensaje) {
          setMascotaInfo({});
          setErrorMascota(data.mensaje);
        } else if (typeof data === "string") {
          setMascotaInfo({});
          setErrorMascota(data);
        } else if (data && typeof data === "object") {
          setMascotaInfo({
            id: data.id,
            nombre: data.nombre,
            fecha_nacimiento: data.fecha_nacimiento,
            especie: data.especie,
            raza: data.raza,
            cliente: data.cliente,
          });
          setErrorMascota(null);
        } else {
          setMascotaInfo({});
          setErrorMascota("No se encontró información de la mascota");
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setMascotaInfo({});
          setErrorMascota("No hay mascota registrada con ese ID");
        } else {
          setMascotaInfo({});
          setErrorMascota("Error al conectar con el servidor");
        }
        console.error(err);
      }
    };

    if (id) obtenerDatosMascota();
  }, [id]);

  // Obtener citas (todas)
  useEffect(() => {
    const obtenerDatosCitas = async () => {
      try {
        const { data } = await axios.get(`https://animalbeats-api.onrender.com/Citas/mascota/${id}`);

        if (data?.mensaje) {
          setCitasInfo([]);
          setErrorCita(data.mensaje);
        } else if (Array.isArray(data)) {
          setCitasInfo(data);
          if (data.length === 0) setErrorCita("No hay citas registradas para esta mascota");
          else setErrorCita(null);
        } else {
          setCitasInfo([]);
          setErrorCita("No se encontró información de citas");
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setCitasInfo([]);
          setErrorCita("No hay citas registradas para esta mascota");
        } else {
          setCitasInfo([]);
          setErrorCita("Error al conectar con el servidor");
        }
        console.error(err);
      }
    };

    if (id) obtenerDatosCitas();
  }, [id]);

  // Obtener historial médico (recordatorios)
  useEffect(() => {
    const obtenerHistorialMedico = async () => {
      try {
        const { data } = await axios.get(`https://animalbeats-api.onrender.com/recordatorio/mascota/${id}`);

        if (Array.isArray(data) && data.length > 0) {
          setHistorialMedico(
            data.map((item) => ({
              fecha: item.fecha,
              descripcion: item.descripcion,
            }))
          );
          setErrorHistorial(null);
        } else if (Array.isArray(data) && data.length === 0) {
          setHistorialMedico([]);
          setErrorHistorial("No hay recordatorios registrados para esta mascota");
        } else if (data?.mensaje) {
          setHistorialMedico([]);
          setErrorHistorial(data.mensaje);
        } else {
          setHistorialMedico([]);
          setErrorHistorial("No se encontró historial médico");
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setHistorialMedico([]);
          setErrorHistorial("No hay recordatorios registrados para esta mascota");
        } else {
          setHistorialMedico([]);
          setErrorHistorial("Error al conectar con el servidor");
        }
        console.error(err);
      }
    };

    if (id) obtenerHistorialMedico();
  }, [id]);

  const descargarHistorial = () => {
    try {
      const doc = new jsPDF();

      // Logo
      doc.addImage(logo, "PNG", 15, 10, 25, 25);

      // Título y fecha/hora actual
      doc.setFontSize(18);
      doc.text(`Historial Médico - ${mascotaInfo.nombre || "Mascota"}`, 50, 20);
      doc.text(`Fecha y Hora: ${fechaHoraFormateada}`, 50, 30);

      let startY = 40;

      // Tabla Información Mascota
      if (mascotaInfo && Object.keys(mascotaInfo).length > 0) {
        autoTable(doc, {
          startY,
          head: [["ID", "Nombre", "Fecha de nacimiento", "Especie", "Raza", "Dueño"]],
          body: [
            [
              mascotaInfo.id || "-",
              mascotaInfo.nombre || "-",
              formatFecha(mascotaInfo.fecha_nacimiento) || "-",
              mascotaInfo.especie || "-",
              mascotaInfo.raza || "-",
              mascotaInfo.cliente || "-"
            ]
          ],
          theme: "grid",
          styles: {
            lineColor: [223, 41, 53], // Rojo
            lineWidth: 0.5,
          },
          headStyles: {
            fillColor: [223, 41, 53], // Fondo rojo
            textColor: 255, // Texto blanco
          }
        });
        startY = doc.lastAutoTable.finalY + 15;
      } else {
        doc.text(`Información de la mascota: ${errorMascota || "No disponible"}`, 10, startY);
        startY += 10;
      }

      // Tabla Recordatorios
      doc.setFontSize(14);
      doc.text("Recordatorios", 20, startY);
      startY += 5;

      if (historialMedico.length > 0) {
        autoTable(doc, {
          startY,
          head: [["Fecha", "Hora", "Descripción"]],
          body: historialMedico.map((r) => [
            formatFecha(r.fecha),
            formatHora(r.fecha),
            r.descripcion || "-"
          ]),
          theme: "grid",
          styles: {
            lineColor: [223, 41, 53],
            lineWidth: 0.5
          },
          headStyles: {
            fillColor: [223, 41, 53],
            textColor: 255
          }
        });
        startY = doc.lastAutoTable.finalY + 15;
      } else {
        doc.text(errorHistorial || "No hay recordatorios", 20, startY);
        startY += 10;
      }

      // Tabla Citas
      doc.setFontSize(14);
      doc.text("Citas", 20, startY);
      startY += 5;

      if (citasInfo.length > 0) {
        autoTable(doc, {
          startY,
          head: [["Fecha", "Hora", "Servicio"]],
          body: citasInfo.map(cita => ([
            formatFecha(cita.fecha),
            formatHora(cita.fecha),
            cita.servicio || "-"
          ])),
          theme: "grid",
          styles: {
            lineColor: [223, 41, 53],
            lineWidth: 0.5
          },
          headStyles: {
            fillColor: [223, 41, 53],
            textColor: 255
          }
        });
      } else {
        doc.text(errorCita || "No hay citas", 20, startY);
      }

      // Descargar PDF
      doc.save(`historial_mascota_${mascotaInfo.nombre || id}.pdf`);

    } catch (error) {
      console.error("Error al generar PDF:", error);
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

        {/* Información de la Mascota */}
        <div className="row">
          <div className="col-md-6 historial-seccion">
            <h3 className="historial-subtitulo">Información de la Mascota</h3>
            {errorMascota ? (
              <p className="historial-error">{errorMascota}</p>
            ) : mascotaInfo && Object.keys(mascotaInfo).length > 0 ? (
              <div className="historial-tabla-contenedor">
                <table className="historial-tabla">
                  <tbody>
                    <tr>
                      <th>ID</th>
                      <td>{mascotaInfo.id}</td>
                    </tr>
                    <tr>
                      <th>Nombre</th>
                      <td>{mascotaInfo.nombre}</td>
                    </tr>
                    <tr>
                      <th>Fecha de Nacimiento</th>
                      <td>{formatFecha(mascotaInfo.fecha_nacimiento)}</td>
                    </tr>
                    <tr>
                      <th>Especie</th>
                      <td>{mascotaInfo.especie}</td>
                    </tr>
                    <tr>
                      <th>Raza</th>
                      <td>{mascotaInfo.raza}</td>
                    </tr>
                    <tr>
                      <th>tutor</th>
                      <td>{mascotaInfo.cliente}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="historial-mensaje-vacio">No hay información de la mascota.</p>
            )}
          </div>

          {/* Recordatorios */}
          <div className="col-md-6 historial-seccion">
            <h3 className="historial-subtitulo">Recordatorios</h3>
            {errorHistorial ? (
              <p className="historial-error">{errorHistorial}</p>
            ) : historialMedico.length > 0 ? (
              <div className="historial-tabla-contenedor">
                <table className="historial-tabla historial-tabla-striped">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialMedico.map((item, index) => (
                      <tr key={index}>
                        <td>{formatFecha(item.fecha)}</td>
                        <td>{formatHora(item.fecha)}</td>
                        <td>{item.descripcion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="historial-mensaje-vacio">No hay recordatorios registrados.</p>
            )}
          </div>

          {/* Citas */}
          <div className="col-md-6 mt-4 historial-seccion">
            <h3 className="historial-subtitulo">Citas para la Mascota</h3>
            {errorCita ? (
              <p className="historial-error">{errorCita}</p>
            ) : citasInfo.length > 0 ? (
              <div className="historial-tabla-contenedor">
                <table className="historial-tabla historial-tabla-striped">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Servicio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citasInfo.map((cita, index) => (
                      <tr key={index}>
                        <td>{formatFecha(cita.fecha)}</td>
                        <td>{formatHora(cita.fecha)}</td>
                        <td>{cita.servicio || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="historial-mensaje-vacio">No hay citas registradas.</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="historial-botones">
          <Link to="/Mascotas" className="btn btn-secondary">Volver</Link>
          <button onClick={descargarHistorial} className="btn btn-primary" title="Descargar historial en PDF">
            <i className="fa-solid fa-file-arrow-down" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Historial;

