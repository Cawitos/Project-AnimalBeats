import { useEffect, useState } from "react";
import OffcanvasMenu from "./menu";
import Swal from "sweetalert2";
import "../css/estado-rol.css";

export default function EstadoRoles() {
  const [roles, setRoles] = useState([]);
  const [nuevoRol, setNuevoRol] = useState("");

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = () => {
    fetch("https://animalbeats-api.onrender.com/roles/Listado")
      .then((res) => res.json())
      .then((data) => setRoles(data.roles))
      .catch((err) => console.error("Error al obtener roles:", err));
  };

  const agregarRol = () => {
    if (nuevoRol.trim() === "") return;
    fetch("https://animalbeats-api.onrender.com/roles/Crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rol: nuevoRol.trim() }),
    })
      .then((res) => res.json())
      .then(() => {
        setNuevoRol("");
        cargarRoles();
        Swal.fire("✅ Éxito", "Rol agregado correctamente", "success");
      })
      .catch((err) => {
        console.error("Error al agregar rol:", err);
        Swal.fire("❌ Error", "No se pudo agregar el rol", "error");
      });
  };

  const eliminarRol = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el rol de forma permanente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(
          `https://animalbeats-api.onrender.com/roles/Eliminar/${id}`,
          { method: "DELETE" }
        )
          .then((res) => {
            if (res.ok) {
              Swal.fire("✅ Eliminado", "El rol fue eliminado", "success");
              cargarRoles();
            } else {
              Swal.fire("❌ Error", "No se pudo eliminar el rol", "error");
            }
          })
          .catch((err) => {
            console.error("Error al eliminar rol:", err);
            Swal.fire("❌ Error", "Ocurrió un error en la conexión", "error");
          });
      }
    });
  };

  return (
    <div className="estado-roles-container p-4">
      <nav className="estado-roles-menu-lateral">
        <OffcanvasMenu />
      </nav>

      <h2 className="estado-roles-title text-xl font-bold mb-2">
        Tabla de Roles
      </h2>
      <table className="estado-roles-tabla border w-full mb-4">
        <thead>
          <tr>
            <th className="estado-roles-th border px-2 py-1">ID</th>
            <th className="estado-roles-th border px-2 py-1">Rol</th>
            <th className="estado-roles-th border px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((rol) => (
            <tr key={rol.id}>
              <td className="estado-roles-td border px-2 py-1">{rol.id}</td>
              <td className="estado-roles-td border px-2 py-1">{rol.rol}</td>
              <td className="estado-roles-td border px-2 py-1 text-center">
                <button
                  className="estado-roles-btn btn btn-danger"
                  onClick={() => eliminarRol(rol.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="estado-roles-agregar-rol d-flex mb-4">
        <input
          type="text"
          className="estado-roles-input border px-2 py-1 flex-grow bg-white text-dark"
          value={nuevoRol}
          onChange={(e) => setNuevoRol(e.target.value)}
          placeholder="Nuevo rol"
        />
        <button
          className="estado-roles-btn btn btn-danger ms-2"
          onClick={agregarRol}
        >
          Agregar rol
        </button>
      </div>
    </div>
  );
}
