
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OffcanvasMenu from "./menu";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);

useEffect(() => {
  fetch('http://localhost:3000/api/admin/dashboard')
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
  return <div className="text-center mt-5">Cargando...</div>;
}

if (dashboardData.error) {
  return <div className="text-center mt-5 text-danger">{dashboardData.error}</div>;
}


  return (
    <>
      < OffcanvasMenu />
      {/* Menú */}

      <div className="contenedor-dashboard">
        <main className="perfil">
          <div className="contenedor-perfil">
            <h1>PERFIL DE USUARIO</h1>
            <h2>Administrador <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30px" height="30px">
              <path d="M19,24H5..."></path></svg></h2>
            <label><b>Nombre:</b> {dashboardData.usuario.nombre}</label><br/>
            <label><b>Correo:</b> {dashboardData.usuario.correo}</label><br/>
          </div>

          <div className="estadisticas">
            <h1>ESTADISTICAS GENERALES</h1>
            <ul>
              <li>
                <div className="stats"><svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#FFF">
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34..."></path>
                </svg></div>
                <div className="info">
                  <h4>Clientes</h4>
                  <p>{dashboardData.total_clientes}</p>
                </div>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}
