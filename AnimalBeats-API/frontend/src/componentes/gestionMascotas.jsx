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
        const res = await fetch("https://animalbeats-api.onrender.com/mascotas");
        if (!res.ok) throw new Error("Error al obtener mascotas");

        const data = await res.json();
        console.log("🐾 Datos recibidos:", data);

        // Normalizar respuesta
        if (Array.isArray(data)) {
          setMascotas(data);
          setError(null);
        } else if (data.Mascotas) {
          setMascotas(data.Mascotas);
          setError(null);
        } else if (data.mascotas) {
          setMascotas(data.mascotas);
          setError(null);
        } else if (typeof data === "string") {
          setMascotas([]);
          setError(data);
        } else {
          setMascotas([]);
          setError("Formato inesperado de datos");
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
        fetch(`https://animalbeats-api.onrender.com/Mascotas/Eliminar/${id}`, {
          method: "PUT",
        })
          .then((response) => {
            if (!response.ok) throw new Error("Error al suspender mascota");

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

  const mascotasFiltradas = () => {
    if (User?.rol === 2) {
      return mascotas.filter((mascota) => mascota.id_cliente === User.id);
    } else {
      return mascotas;
    }
  };

  const mascotasMostradas = mascotasFiltradas();

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin registro";
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? "Fecha inválida" : d.toLocaleDateString();
  };

  return (
    <div className="gestion-mascotas-container">
      <div className="gestion-mascotas-menu-lateral">
        <OffcanvasMenu />
      </div>
      <div className="gestion-mascotas-contenido-principal">
        <h1 className="gestion-mascotas-titulo">Gestión de Mascotas</h1>
        {error && <p className="gestion-mascotas-error">{error}</p>}

        {!error && mascotasMostradas.length === 0 && (
          <p className="gestion-mascotas-no-data">No hay mascotas registradas.</p>
        )}

        {mascotasMostradas.length > 0 && (
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
                  {User?.rol !== 2 && <th>Modificar</th>}
                  {User?.rol !== 2 && <th>Suspender</th>}
                </tr>
              </thead>
              <tbody>
                {mascotasMostradas.map((mascota) => (
                  <tr key={mascota.id}>
                    <td>{mascota.id_cliente}</td>
                    <td>{mascota.nombre}</td>
                    <td>{mascota.especie?.especie}</td>
                    <td>{mascota.raza?.raza}</td>
                    <td>{formatearFecha(mascota.fecha_nacimiento)}</td>
                    <td>
                      <Link
                        to={`/Mascotas/historial/${mascota.id}`}
                        aria-label={`Ver historial de ${mascota.nombre}`}
                        className="gestion-mascotas-btn-icon"
                      >
                        Historial
                      </Link>
                    </td>
                    {User?.rol !== 2 && (
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
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {User?.rol !== 2 && (
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
