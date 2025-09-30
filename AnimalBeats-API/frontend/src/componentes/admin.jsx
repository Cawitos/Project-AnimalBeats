import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OffcanvasMenu from "./menu";
import "../css/dashboard.css";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://animalbeats-api.onrender.com/admin/dashboard")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error del servidor: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setDashboardData(data))
      .catch((err) => {
        console.error("Error al obtener el dashboard:", err);
        setDashboardData({ error: "No se pudo cargar el dashboard" });
      });
  }, []);

  if (!dashboardData) {
    return (
      <div className="admin-dashboard-loading text-center mt-5">
        Cargando...
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="admin-dashboard-error text-center mt-5 text-danger">
        {dashboardData.error}
      </div>
    );
  }

  return (
    <>
      <div className="admin-dashboard-menu-lateral">
        <OffcanvasMenu />
      </div>

      <div className="d-flex justify-content-center align-items-center mt-5">
        <div
          className="card shadow p-5 text-center"
          style={{ width: "800px", borderRadius: "20px" }}
        >
          <h1 className="fw-bold mb-4 text-danger" style={{ fontSize: "40px" }}>PERFIL DE USUARIO</h1>
          <h2 className="mb-4" style={{ fontSize: "30px" }}>
            Administrador{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="35px"
              height="35px"
              style={{ verticalAlign: "middle" }}
            >
              <path d="M19,24H5..."></path>
            </svg>
          </h2>

          <p className="fs-5">
            <b>Nombre:</b> {dashboardData.usuario.nombre}
          </p>
          <p className="fs-5">
            <b>Correo:</b> {dashboardData.usuario.correo}
          </p>

          {/* Botón dentro de la card */}
          <button
            className="btn btn-danger mt-4 px-5 py-3"
            style={{ fontSize: "20px", borderRadius: "14px" }}
            onClick={() => navigate("/estadisticasadmin")}
          >
            📊 Ver estadísticas
          </button>
        </div>
      </div>
    </>
  );
}
