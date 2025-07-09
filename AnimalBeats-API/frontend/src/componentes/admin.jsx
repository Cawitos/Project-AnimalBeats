import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OffcanvasMenu from "./menu";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/admin/dashboard')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error del servidor: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setDashboardData(data))
      .catch(err => {
        console.error("Error al obtener el dashboard:", err);
        setDashboardData({ error: "No se pudo cargar el dashboard" });
      });
  }, []);

  if (!dashboardData) {
    return <div className="admin-dashboard-loading text-center mt-5">Cargando...</div>;
  }

  if (dashboardData.error) {
    return <div className="admin-dashboard-error text-center mt-5 text-danger">{dashboardData.error}</div>;
  }

  return (
    <>
      <OffcanvasMenu />

      <div className="admin-dashboard-container">
        <main className="admin-dashboard-main">
          <div className="admin-dashboard-profile">
            <h1 className="admin-dashboard-title">PERFIL DE USUARIO</h1>
            <h2 className="admin-dashboard-subtitle">
              Administrador
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30px" height="30px">
                <path d="M19,24H5..."></path>
              </svg>
            </h2>
            <label className="admin-dashboard-label"><b>Nombre:</b> {dashboardData.usuario.nombre}</label><br />
            <label className="admin-dashboard-label"><b>Correo:</b> {dashboardData.usuario.correo}</label><br />
          </div>

          <div className="admin-dashboard-stats">
            <h1 className="admin-dashboard-title">ESTADISTICAS GENERALES</h1>
            <ul className="admin-dashboard-stats-list">
              <li className="admin-dashboard-stat-item">
                <div className="admin-dashboard-stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#FFF">
                    <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34..."></path>
                  </svg>
                </div>
                <div className="admin-dashboard-stat-info">
                  <h4 className="admin-dashboard-stat-title">Clientes</h4>
                  <p className="admin-dashboard-stat-value">{dashboardData.total_clientes}</p>
                </div>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}
