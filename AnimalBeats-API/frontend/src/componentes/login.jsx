import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../assets/css/login.css';

const Login = ( { setUser} ) => {
  const [correoelectronico, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.usuario); // Asumiendo que el usuario viene en data.usuario

        // Redirigir según el rol (ajusta los valores según tu backend)
        const rol = data.usuario.id_rol;
        if (rol === 1) {
          navigate("/admin");
        } else if (rol === 2) {
          navigate("/cliente");
        } else if (rol === 3) {
          navigate("/veterinario");
        } else {
          setError("Rol desconocido, contacta al administrador.");
        }
      } else {
        setError(data.mensaje || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
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
