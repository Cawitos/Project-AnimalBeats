import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import OffcanvasMenu from "../components/menu";

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/usuario/Listado")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
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
          method: "DELETE",
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
    <div className="container py-5 mt-5">
      <OffcanvasMenu />
      <h1 className="text-center mb-4">Gestión de usuarios</h1>

      {usuarios.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead className="table-dark">
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Correo</th>
                <th>Consultar</th>
                <th>Modificar</th>
                <th>Suspender</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.n_documento}>
                  <td>{u.nombre}</td>
                  <td>{`${u.tipo_documento} - ${u.n_documento}`}</td>
                  <td>{u.correoelectronico}</td>
                  <td>
                    <Link
                      to={`/usuarios/${u.n_documento}/consultar`}
                      className="text-danger"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </Link>
                  </td>
                  <td>
                    <Link
                      to={`/usuarios/${u.n_documento}/modificar`}
                      className="text-danger"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </Link>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-danger btn-sm"
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
        <div className="alert alert-warning text-center" role="alert">
          No hay usuarios registrados actualmente.
        </div>
      )}

      <div className="text-center mt-4">
        <Link to="/usuarios/crear" className="btn btn-danger btn-lg">
          <i className="fa-solid fa-user-plus"></i> Crear usuario
        </Link>
      </div>
    </div>
  );
}
