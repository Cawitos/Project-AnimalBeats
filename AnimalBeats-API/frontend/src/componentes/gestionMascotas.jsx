import { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import OffcanvasMenu from "./menu";
import "../css/gestionMascotas.css";
import { UserContext } from "../context/UserContext";

export default function GestionMascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [error, setError] = useState(null);
  const { User } = useContext(UserContext);

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        const res = await fetch("http://localhost:3000/mascotas");
        const data = await res.json();

        if (typeof data === "string") {
          setMascotas([]);
          setError(data);
        } else {
          setMascotas(data);
          setError(null);
        }
      } catch (err) {
        console.error("Error al cargar mascotas:", err);
        setError("Error al conectar con el servidor");
      }
    };

    fetchMascotas();
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
            <table
              className="gestion-mascotas-tabla"
              id="gestion-mascotas-tabla"
            >
              <thead>
                <tr>
                  <th>Código dueño</th>
                  <th>Nombre</th>
                  <th>Especie</th>
                  <th>Raza</th>
                  <th>Edad</th>
                  <th>Historial</th>
                  {User !== 2 && <th>Modificar</th>}
                  {User !== 2 && <th>Suspender</th>}
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
                      <Link
                        to={`/Mascotas/historial/${mascota.id}`}
                        aria-label={`Ver historial de ${mascota.nombre}`}
                        className="gestion-mascotas-btn-icon"
                      >
                        Historial
                      </Link>
                    </td>
                    {User !== 2 ? (
                      <>
                        <td>
                          <Link
                            to={`/Mascotas/modificar/${mascota.id}`}
                            aria-label={`Modificar ${mascota.nombre}`}
                            className="gestion-mascotas-btn-icon"
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
                      </>
                    ) : (
                      <>
                        <td></td>
                        <td></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {User !== 2 && (
          <div className="gestion-mascotas-crear">
            <Link to="/Mascotas/crear" className="btn btn-primary">
              Crear Mascota
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


