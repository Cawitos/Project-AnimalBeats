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
      const response = await axios.post("http://localhost:3000/login", {
        correoelectronico,
        contrasena
      });

      const data = response.data;

      setUser(data.usuario);
      setMensaje(data.mensaje || "Inicio de sesión exitoso");

      localStorage.setItem("token", data.token);

      setTimeout(() => {
        console.log("Rol recibido:", data.rol);
        if (data.rol === "admin") {
          navigate("/admin");
        } else if (data.rol === "veterinario") {
          navigate("/veterinario");
        } else {
          navigate("/cliente");
        }
      }, 1000);

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
