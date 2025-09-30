import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function CrearUsuario() {
  const navigate = useNavigate();
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    id_documento: '',
    n_documento: '',
    nombre: '',
    correoelectronico: '',
    contrasena: '',
    id_rol: '',
  });

  useEffect(() => {
    const obtenerTiposDocumento = async () => {
      try {
        const res = await axios.get('https://animalbeats-api.onrender.com/tiposDocumento');
        if (Array.isArray(res.data)) setTiposDocumento(res.data);
      } catch (error) {
        console.error('Error al obtener tipos de documento:', error);
      }
    };

    const obtenerRoles = async () => {
      try {
        const res = await axios.get('https://animalbeats-api.onrender.com/roles/Listado');
        if (res.data?.roles) setRoles(res.data.roles);
      } catch (error) {
        console.error('Error al obtener roles:', error);
      }
    };

    obtenerTiposDocumento();
    obtenerRoles();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación extra como en Flutter
    if (
      formData.id_rol === "1" &&
      formData.correoelectronico.toLowerCase() !== "administrador@animalbeats.com"
    ) {
      Swal.fire({
        icon: "warning",
        title: "Correo inválido para Administrador",
        text: "Solo se permite el correo predeterminado para este rol.",
      });
      return;
    }

    try {
      const res = await axios.post(
        "https://animalbeats-api.onrender.com/usuario/Crear",
        formData
      );

      if (res.status === 201) {
        Swal.fire({
          title: "¡Éxito!",
          text: "Usuario creado correctamente",
          icon: "success",
        }).then(() => navigate("/gestionusuarios"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo crear el usuario",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.mensaje || "Error al registrar usuario",
        icon: "error",
      });
    }
  };

  return (
    <div className="crear-usuario-container container mt-5">
      <div
        className="crear-usuario-card card mx-auto shadow-lg p-4"
        style={{ maxWidth: "550px", borderRadius: "20px" }}
      >
        {/* Título */}
        <h2
          className="crear-usuario-title text-center mb-4 display-6 fw-bold"
          style={{ color: "#e63946" }}
        >
          Crear Usuario
        </h2>

        <form className="crear-usuario-form" onSubmit={handleSubmit}>
          {/* Tipo de documento */}
          <div className="crear-usuario-field mb-3">
            <label htmlFor="id_documento" className="form-label fw-semibold">
              Tipo de documento
            </label>
            <select
              className="form-select"
              name="id_documento"
              id="id_documento"
              required
              value={formData.id_documento}
              onChange={handleChange}
            >
              <option value="">Seleccione un tipo</option>
              {tiposDocumento.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Número de documento */}
          <div className="crear-usuario-field mb-3">
            <label htmlFor="n_documento" className="form-label fw-semibold">
              Número de documento
            </label>
            <input
              type="number"
              className="form-control"
              name="n_documento"
              required
              value={formData.n_documento}
              onChange={handleChange}
            />
          </div>

          {/* Nombre */}
          <div className="crear-usuario-field mb-3">
            <label htmlFor="nombre" className="form-label fw-semibold">
              Nombre completo
            </label>
            <input
              type="text"
              className="form-control"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          {/* Correo */}
          <div className="crear-usuario-field mb-3">
            <label htmlFor="correoelectronico" className="form-label fw-semibold">
              Correo electrónico
            </label>
            <input
              type="email"
              className="form-control"
              name="correoelectronico"
              required
              value={formData.correoelectronico}
              onChange={handleChange}
            />
          </div>

          {/* Contraseña */}
          <div className="crear-usuario-field mb-3">
            <label htmlFor="contrasena" className="form-label fw-semibold">
              Contraseña
            </label>
            <input
              type="password"
              className="form-control"
              name="contrasena"
              required
              value={formData.contrasena}
              onChange={handleChange}
            />
          </div>

          {/* Rol */}
          <div className="crear-usuario-field mb-3">
            <label htmlFor="id_rol" className="form-label fw-semibold">
              Rol
            </label>
            <select
              className="form-select"
              name="id_rol"
              required
              value={formData.id_rol}
              onChange={handleChange}
            >
              <option value="">Seleccione un rol</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.rol}
                </option>
              ))}
            </select>
          </div>

          {/* Botón */}
          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn"
              style={{
                backgroundColor: "#f44336",
                color: "#fff",
                fontWeight: "bold",
                padding: "10px 30px",
                borderRadius: "10px",
              }}
            >
              Registrar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}
