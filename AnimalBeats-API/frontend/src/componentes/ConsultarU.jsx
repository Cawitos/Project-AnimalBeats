import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";

function ConsultarU() {
  const { n_documento } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`https://animalbeats-api.onrender.com/usuario/${n_documento}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.n_documento) {
          setUsuario(data);
        } else if (typeof data === "string" && data === "Usuario no encontrado") {
          setError("Usuario no encontrado.");
        } else {
          setError("Formato inesperado en la respuesta");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener usuario:", err);
        setError("Error al obtener usuario");
        setLoading(false);
      });
  }, [n_documento]);

  const volver = () => navigate(-1);

  const descargarPDF = () => {
    if (!usuario) return;

    try {
      const doc = new jsPDF();

      // Logo
      doc.addImage(logo, "PNG", 15, 10, 25, 25);

      // Título y fecha/hora
      const fechaHora = new Date().toLocaleString();
      doc.setFontSize(18);
      doc.text("Reporte de Usuario", 50, 20);
      doc.setFontSize(11);
      doc.text(`Fecha y Hora: ${fechaHora}`, 50, 30);

      let startY = 40;

      // Tabla con la info del usuario
      autoTable(doc, {
        startY,
        body: [
          ["Nombre", usuario.nombre || "-"],
          ["Documento", `${usuario.tipo_documento} - ${usuario.n_documento}`],
          ["Correo", usuario.correoelectronico || "-"],
        ],
        theme: "grid",
        styles: {
          lineColor: [223, 41, 53], // Rojo AnimalBeats
          lineWidth: 0.5,
          fontSize: 11,
        },
        headStyles: {
          fillColor: [223, 41, 53],
          textColor: 255,
        },
      });

      doc.save(`usuario_${usuario.n_documento}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF de usuario:", error);
    }
  };

  const ponerPendiente = () => {
    Swal.fire({
      title: "¿Poner usuario en pendiente?",
      text: "El estado del usuario cambiará a Pendiente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(
          `https://animalbeats-api.onrender.com/usuario/Pendiente/${usuario.n_documento}`,
          { method: "PUT" }
        )
          .then((res) => res.json())
          .then((data) => {
            Swal.fire("✅ Éxito", data.mensaje || "Usuario puesto en pendiente", "success");
          })
          .catch(() => {
            Swal.fire("❌ Error", "No se pudo cambiar a pendiente", "error");
          });
      }
    });
  };

  if (loading) return <p className="text-center mt-5">Cargando usuario...</p>;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="card shadow p-4" style={{ width: "28rem", borderRadius: "15px" }}>
        <h3 className="text-center mb-4 text-danger fw-bold">
          Usuario {usuario.n_documento}
        </h3>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <b>📛 Nombre:</b> {usuario.nombre}
          </li>
          <li className="list-group-item">
            <b>🆔 Documento:</b> {usuario.tipo_documento} - {usuario.n_documento}
          </li>
          <li className="list-group-item">
            <b>📧 Correo:</b> {usuario.correoelectronico}
          </li>
        </ul>

        <div className="mt-4 text-center d-flex flex-column gap-2">
          <button className="btn btn-warning" onClick={ponerPendiente}>
            Poner en Pendiente
          </button>

          <button className="btn btn-outline-danger" onClick={descargarPDF}>
            Descargar PDF
          </button>

          <button className="btn btn-danger" onClick={volver}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConsultarU;
