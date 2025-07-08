import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom"; // Asegúrate de importar Link
import OffcanvasMenu from "./menu";
import "../css/gestionMascotas.css";

export default function GestionMascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/mascotas")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") {
          setMascotas([]);
          setError(data);
        } else {
          setMascotas(data);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("Error al cargar mascotas:", err);
        setError("Error al conectar con el servidor");
      });
  }, []);

  const suspenderMascota = (id, nombre) => {
    Swal.fire({
      title: `¿Estás seguro de suspender a ${nombre}?`,
      text: "Esta acción no podrá deshacerse fácilmente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, suspender",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:3000/Mascotas/Eliminar/${id}`, {
          method: "PUT",
        })
          .then((response) => {
            if (!response.ok) throw new Error("Error al suspender mascota");

            // Actualiza el estado removiendo la mascota suspendida
            setMascotas((prev) => prev.filter((m) => m.id !== id));

            Swal.fire(
              "¡Suspendido!",
              `La mascota ${nombre} ha sido suspendida.`,
              "success"
            );
          })
          .catch((error) => {
            console.error(error);
            Swal.fire(
              "Error",
              "No se pudo suspender la mascota. Intenta nuevamente.",
              "error"
            );
          });
      }
    });
  };

  return (
    <div className="gestion-mascotas-container">
      <div className="gestion-mascotas-menu-lateral">
        <OffcanvasMenu />
      </div>
      <div className="gestion-mascotas-contenido-principal">
        <h1 className="gestion-mascotas-titulo">Gestión de Mascotas</h1>
        {error && <p className="gestion-mascotas-error">{error}</p>}
        {!error && mascotas.length === 0 && (
          <p className="gestion-mascotas-no-data">No hay mascotas registradas.</p>
        )}
        {mascotas.length > 0 && (
          <div className="gestion-mascotas-contenedor-tabla">
            <table className="gestion-mascotas-tabla" id="gestion-mascotas-tabla">
              <thead>
                <tr>
                  <th>Código dueño</th>
                  <th>Nombre</th>
                  <th>Especie</th>
                  <th>Raza</th>
                  <th>Edad</th>
                  <th>Historial</th>
                  <th>Modificar</th>
                  <th>Suspender</th>
                </tr>
              </thead>
              <tbody>
                {mascotas.map((mascota) => (
                  <tr key={mascota.id}>
                    <td>{mascota.id_cliente}</td>
                    <td>{mascota.nombre}</td>
                    <td>{mascota.especie}</td>
                    <td>{mascota.raza}</td>
                    <td>{new Date(mascota.fecha_nacimiento).toLocaleDateString()}</td>
                    <td>
                      {/* Enlace para historial: Asume una ruta como /Mascotas/:id/historial */}
                      <Link
                        to={`/Mascotas/${mascota.id}/historial`}
                        aria-label={`Ver historial de ${mascota.nombre}`}
                        className="gestion-mascotas-btn-icon" // Puedes reutilizar esta clase o crear una nueva para links
                      >
                        Historial
                      </Link>
                    </td>
                    <td>
                      {/* Enlace para modificar: Asume la ruta /Mascotas/modificar/:id */}
                      <Link
                        to={`/Mascotas/modificar/${mascota.id}`}
                        aria-label={`Modificar ${mascota.nombre}`}
                        className="gestion-mascotas-btn-icon" // Puedes reutilizar esta clase
                      >
                        Modificar
                      </Link>
                    </td>
                    <td>
                      <button
                        onClick={() => suspenderMascota(mascota.id, mascota.nombre)}
                        aria-label={`Suspender ${mascota.nombre}`}
                        className="gestion-mascotas-btn-icon"
                      >
                        Suspender
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="gestion-mascotas-crear">
          <Link to="/Mascotas/crear" className="btn btn-primary">
            Crear Mascota
          </Link>
        </div>
      </div>
    </div>
  );
}

