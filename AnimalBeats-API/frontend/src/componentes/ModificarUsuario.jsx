import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import '../css/modificarU.css'

const ModificarUsuario = ({ usuario }) => {
  const navigate = useNavigate();

  const [nDocumento, setNDocumento] = useState("");
  const [nombre, setNombre] = useState("");
  const [correoelectronico, setCorreoElectronico] = useState("");
  const [rol, setRol] = useState("");

  const [nDocumentoOriginal, setNDocumentoOriginal] = useState("");

  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [idDocumento, setIdDocumento] = useState("");

  useEffect(() => {
    const fetchTiposDocumento = async () => {
      try {
        const response = await fetch("http://localhost:3000/tiposDocumento");
        const data = await response.json();
        setTiposDocumento(data);
      } catch (error) {
        console.error("Error al obtener tipos de documento:", error);
      }
    };
    fetchTiposDocumento();
  }, []);

  useEffect(() => {
    if (usuario && usuario.n_documento) {
      setNDocumento(usuario.n_documento);
      setNDocumentoOriginal(usuario.n_documento);
      setNombre(usuario.nombre || "");
      setCorreoElectronico(usuario.correoelectronico || "");
      setRol(
        usuario.id_rol === 1
          ? "admin"
          : usuario.id_rol === 2
            ? "cliente"
            : usuario.id_rol === 3
              ? "veterinario"
              : ""
      );
      setIdDocumento(usuario.id_documento || "");
    }
  }, [usuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3000/usuario/Actualizar/${nDocumento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correoelectronico,
          id_documento: idDocumento,
          n_documento_original: nDocumentoOriginal,
          id_rol: rol === "admin" ? 1 : rol === "cliente" ? 2 : rol === "veterinario" ? 3 : null,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = { error: "Respuesta inválida del servidor" };
      }

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "¡Usuario actualizado!",
          text: data.mensaje || "Los datos del usuario se actualizaron correctamente.",
          confirmButtonText: "OK",
        });
        navigate("/gestionusuarios");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "No se pudo actualizar el usuario.",
        });
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al actualizar el usuario.",
      });
    }
  };

  return (
    <div className="ab-modificar-container">
      <div className="ab-modificar-card">
        <h3 className="ab-modificar-title">Modificar Usuario</h3>
        <form onSubmit={handleSubmit}>
          <div className="ab-form-group">
            <label htmlFor="n_documento" className="ab-form-label">
              Número de Documento
            </label>
            <input
              type="number"
              className="ab-form-input"
              id="n_documento"
              value={nDocumento}
              onChange={(e) => setNDocumento(e.target.value)}
              required
            />
          </div>

          <div className="ab-form-group">
            <label htmlFor="nombre" className="ab-form-label">
              Nombre
            </label>
            <input
              type="text"
              className="ab-form-input"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="ab-form-group">
            <label htmlFor="correoelectronico" className="ab-form-label">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="ab-form-input"
              id="correoelectronico"
              value={correoelectronico}
              onChange={(e) => setCorreoElectronico(e.target.value)}
              required
            />
          </div>

          <div className="ab-form-group">
            <label htmlFor="id_documento" className="ab-form-label">
              Tipo de Documento
            </label>
            <select
              className="ab-form-select"
              id="id_documento"
              value={idDocumento}
              onChange={(e) => setIdDocumento(e.target.value)}
              required
            >
              <option value="">Seleccione tipo de documento</option>
              {tiposDocumento.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="ab-form-group">
            <label htmlFor="rol" className="ab-form-label">
              Rol
            </label>
            <select
              className="ab-form-select"
              id="rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              required
            >
              <option value="">Seleccione un rol</option>
              <option value="admin">Administrador</option>
              <option value="cliente">Cliente</option>
              <option value="veterinario">Veterinario</option>
            </select>
          </div>

          <button type="submit" className="ab-btn ab-btn-danger">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModificarUsuario;
