import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../css/login.css';

const Login = ({ setUser }) => {
  const [correoelectronico, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const response = await axios.post("https://animalbeats-api.onrender.com/login", {
        correoelectronico,
        contrasena
      });

      const data = response.data;
      const usuario = {
        rol: data.usuario.rol,
        n_documento: data.usuario.n_documento,
        nombre: data.usuario.nombre,
        correo: data.usuario.correoelectronico
      };

      // Guardar usuario en contexto
      setUser(usuario);

      // Guardar usuario completo en localStorage
      localStorage.setItem("user", JSON.stringify(usuario));

      // Guardar token y datos importantes
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.usuario.rol);
      localStorage.setItem("n_documento", data.usuario.n_documento);

      setMensaje(data.mensaje || "Inicio de sesión exitoso");

      setTimeout(() => {
        console.log("Rol recibido:", data.usuario.rol);
        console.log("Documento recibido:", data.usuario.n_documento);

        if (data.usuario.rol === 1) {
          navigate("/admin");
        } else if (data.usuario.rol === 3) {
          navigate("/veterinario");
        } else {
          navigate("/cliente");
        }
      }, 500); // Reducido a medio segundo para mayor rapidez

    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.mensaje || "Error al iniciar sesión");
    }
  };

  return (
    <div className="ab-login-container">
      <div className="ab-login-row">
        <div className="ab-login-col">
          <div className="ab-login-card">
            <div className="ab-login-card-body">
              <h3 className="ab-login-title">Iniciar Sesión</h3>

              <form onSubmit={handleSubmit}>
                <div className="ab-form-group">
                  <label htmlFor="email" className="ab-form-label">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className="ab-form-input"
                    id="email"
                    value={correoelectronico}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>

                <div className="ab-form-group">
                  <label htmlFor="password" className="ab-form-label">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="ab-form-input"
                    id="password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                  />
                </div>

                <div className="ab-form-button-wrapper">
                  <button type="submit" className="ab-btn ab-btn-danger">
                    Iniciar Sesión
                  </button>
                </div>
              </form>

              {mensaje && (
                <div className="ab-alert ab-alert-info">
                  {mensaje}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
