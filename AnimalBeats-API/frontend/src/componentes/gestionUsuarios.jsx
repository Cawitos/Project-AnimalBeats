import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import OffcanvasMenu from "../componentes/menu";
import "../css/gestionMascotas.css"; //Estilo de gestion de mascotas

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(
        "https://animalbeats-api.onrender.com/usuario/Listado"
      );
      if (!res.ok) throw new Error("Error al obtener usuarios");

      const data = await res.json();
      if (Array.isArray(data)) {
        setUsuarios(data);
      } else if (data.usuarios || data.Usuarios) {
        setUsuarios(data.usuarios || data.Usuarios);
      } else {
        setUsuarios([]);
        console.warn("Formato inesperado:", data);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const cambiarEstadoUsuario = (id, estadoActual, nombre) => {
    const accion = estadoActual === "Activo" ? "Suspender" : "Reactivar";
    const nuevoEstado = estadoActual === "Activo" ? "Suspendido" : "Activo";

    Swal.fire({
      title: `¿Estás seguro de ${accion.toLowerCase()} a ${nombre}?`,
      text: "Esta acción podrá revertirse luego.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (!result.isConfirmed) return;

      const endpoint =
        estadoActual === "Activo"
          ? `https://animalbeats-api.onrender.com/usuario/Suspender/${id}`
          : `https://animalbeats-api.onrender.com/usuario/Reactivar/${id}`;

      fetch(endpoint, { method: "PUT" })
        .then((response) => {
          if (!response.ok) throw new Error(`Error al ${accion} usuario`);

          setUsuarios((prev) =>
            prev.map((u) =>
              u.n_documento === id ? { ...u, estado: nuevoEstado } : u
            )
          );

          Swal.fire(
            "¡Éxito!",
            `Usuario ${accion.toLowerCase()} correctamente.`,
            "success"
          );
        })
        .catch((err) => {
          console.error(err);
          Swal.fire(
            "Error",
            `No se pudo ${accion.toLowerCase()} el usuario.`,
            "error"
          );
        });
    });
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando usuarios...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center mt-5" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="gestion-mascotas-container">
      <div className="gestion-mascotas-menu-lateral">
        <OffcanvasMenu />
      </div>
      <div className="gestion-mascotas-contenido-principal">
        <h1 className="gestion-mascotas-titulo">Gestión de Usuarios</h1>
        {error && <p className="gestion-mascotas-error">{error}</p>}

        {!error && usuarios.length === 0 && (
          <p className="gestion-mascotas-no-data">
            No hay usuarios registrados actualmente.
          </p>
        )}

        {usuarios.length > 0 && (
          <div className="gestion-mascotas-contenedor-tabla">
            <table className="gestion-mascotas-tabla" id="gestion-usuarios-tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Correo</th>
                  <th>Estado</th>
                  <th>Consultar</th>
                  <th>Modificar</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.n_documento}>
                    <td>{u.nombre}</td>
                    <td>{`${u.tipo_documento} - ${u.n_documento}`}</td>
                    <td>{u.correoelectronico}</td>
                    <td>{u.estado}</td>
                    <td>
                      <Link
                        to={`/usuarios/${u.n_documento}/consultar`}
                        className="gestion-mascotas-btn-icon"
                      >
                        Consultar
                      </Link>
                    </td>
                    <td>
                      <Link
                        to={`/usuario/Actualizar/${u.n_documento}`}
                        className="gestion-mascotas-btn-icon"
                      >
                        Modificar
                      </Link>
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          cambiarEstadoUsuario(u.n_documento, u.estado, u.nombre)
                        }
                        className="gestion-mascotas-btn-icon"
                      >
                        {u.estado === "Activo" ? "Suspender" : "Reactivar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="gestion-mascotas-crear">
          <Link to="/usuarios/crear" className="btn btn-primary">
            Crear Usuario
          </Link>
        </div>
      </div>
    </div>
  );
}
