import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import OffcanvasMenu from "../componentes/menu";
import '../css/usuarios.css';

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/usuario/Listado")
      .then((res) => res.json())
      .then((data) => setUsuarios(data.usuarios))
      .catch((err) => console.error("Error al cargar usuarios:", err));
  }, []);

  const suspenderUsuario = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Este usuario será suspendido y no podrá iniciar sesión.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, suspender",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:3000/usuario/Suspender/${id}`, {
          method: "PUT",
        })
          .then((response) => {
            if (!response.ok) throw new Error("Error al suspender usuario");

            setUsuarios((prev) =>
              prev.filter((u) => u.n_documento !== id)
            );

            Swal.fire(
              "¡Suspendido!",
              "El usuario ha sido suspendido.",
              "success"
            );
          })
          .catch((error) => {
            console.error(error);
            Swal.fire("Error", "No se pudo suspender el usuario.", "error");
          });
      }
    });
  };

  return (
    <div className="gestion-usuarios-container container py-5 mt-5">
      <OffcanvasMenu />
      <h1 className="gestion-usuarios-title text-center mb-4">
        Gestión de usuarios
      </h1>

      {usuarios.length > 0 ? (
        <div className="gestion-usuarios-tabla-responsive table-responsive">
          <table className="gestion-usuarios-tabla table table-striped">
            <thead className="gestion-usuarios-thead table-dark">
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Correo</th>
                <th>Consultar</th>
                <th>Modificar</th>
                <th>Suspender</th>
              </tr>
            </thead>
            <tbody className="gestion-usuarios-tbody">
              {usuarios.map((u) => (
                <tr key={u.n_documento}>
                  <td>{u.nombre}</td>
                  <td>{`${u.tipo_documento} - ${u.n_documento}`}</td>
                  <td>{u.correoelectronico}</td>
                  <td>
                    <Link
                      to={`/usuarios/${u.n_documento}/consultar`}
                      className="gestion-usuarios-icon text-danger"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </Link>
                  </td>
                  <td>
                    <Link
                      to={`/usuario/Actualizar/${u.n_documento}`}
                      className="gestion-usuarios-icon text-danger"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </Link>
                  </td>
                  <td>
                    <button
                      className="gestion-usuarios-btn btn btn-outline-danger btn-sm"
                      onClick={() => suspenderUsuario(u.n_documento)}
                    >
                      <i className="fa-solid fa-user-lock"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="gestion-usuarios-alert alert alert-warning text-center"
          role="alert"
        >
          No hay usuarios registrados actualmente.
        </div>
      )}

      <div className="gestion-usuarios-crear text-center mt-4">
        <Link to="/usuarios/crear" className="gestion-usuarios-crear-btn btn btn-danger btn-lg">
          <i className="fa-solid fa-user-plus"></i> Crear usuario
        </Link>
      </div>
    </div>
  );
}
