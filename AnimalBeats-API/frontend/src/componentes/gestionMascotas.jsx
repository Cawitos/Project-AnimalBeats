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
    // Imprimir usuario, rol y documento en consola
    console.log("🐾 Usuario actual:", User);
    console.log("Rol:", User?.rol);
    console.log("Documento:", User?.n_documento);

    const fetchMascotas = async () => {
      try {
        const res = await fetch("https://animalbeats-api.onrender.com/mascotas");
        if (!res.ok) throw new Error("Error al obtener mascotas");

        const data = await res.json();
        console.log("🐾 Datos recibidos:", data);

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
  }, [User]);

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

  // Filtrado por rol
  const mascotasFiltradas = () => {
    if (User?.rol === 2) {
      return mascotas.filter(
        (mascota) => String(mascota.id_cliente) === String(User.n_documento)
      );
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

        {/* Vista tipo cards para rol cliente */}
        {User?.rol === 2 && mascotasMostradas.length > 0 && (
          <div className="gestion-mascotas-cards">
            {mascotasMostradas.map((m) => (
              <div key={m.id} className="gestion-mascotas-card">
                <div className="mascota-avatar">
                  {m.especie?.especie?.[0] || "🐾"}
                </div>
                <h3>{m.nombre}</h3>
                <p><strong>Especie:</strong> {m.especie?.especie}</p>
                <p><strong>Raza:</strong> {m.raza?.raza}</p>
                <p><strong>Fecha Nacimiento:</strong> {formatearFecha(m.fecha_nacimiento)}</p>
                <p><strong>Estado:</strong> {m.estado}</p>
                <div className="gestion-mascotas-card-actions">
                  <Link
                    to={`/Mascotas/historial/${m.id}`}
                    className="btn-info"
                  >
                    Ver Historial
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vista tipo tabla para otros roles */}
        {User?.rol !== 2 && mascotasMostradas.length > 0 && (
          <div className="gestion-mascotas-contenedor-tabla">
            <table className="gestion-mascotas-tabla">
              <thead>
                <tr>
                  <th>Código tutor</th>
                  <th>Nombre</th>
                  <th>Especie</th>
                  <th>Raza</th>
                  <th>Fecha Nacimiento</th>
                  <th>Historial</th>
                  <th>Modificar</th>
                  <th>Suspender</th>
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
                        className="gestion-mascotas-btn-icon historial"
                      >
                        Historial
                      </Link>
                    </td>
                    <td>
                      <Link
                        to={`/Mascotas/modificar/${mascota.id}`}
                        className="gestion-mascotas-btn-icon"
                      >
                        Modificar
                      </Link>
                    </td>
                    <td>
                      <button
                        onClick={() => suspenderMascota(mascota.id, mascota.nombre)}
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
