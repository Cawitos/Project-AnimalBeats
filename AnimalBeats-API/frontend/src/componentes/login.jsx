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

      // Redirigir según rol
      setTimeout(() => {
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
    <div className="login-container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="login-card">
              <h3 className="text-center mb-4">Iniciar Sesión</h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={correoelectronico}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-danger">
                    Iniciar Sesión
                  </button>
                </div>
              </form>

              {mensaje && (
                <div className="alert alert-info text-center mt-3">
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
