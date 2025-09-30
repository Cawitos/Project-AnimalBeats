import React, { useEffect, useState } from "react";
import OffcanvasMenu from "./menu";
import "../css/dashboard.css";

export default function VeterinarioDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const documento = localStorage.getItem("n_documento");
        console.log("Documento recibido:", documento);

        if (!documento) {
            setError("No se encontró el documento del usuario");
            setLoading(false);
            return;
        }

        fetch(`https://animalbeats-api.onrender.com/veterinario/dashboard/${documento}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setDashboardData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al obtener el dashboard:", err);
                setError("No se pudo cargar el dashboard");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-center mt-5">Cargando...</div>;
    }

    if (error) {
        return <div className="text-center mt-5 text-danger">{error}</div>;
    }

    const usuario = dashboardData?.usuario || {};
    const stats = dashboardData?.stats || {};

    return (
        <>
            <div className="admin-dashboard-menu-lateral">
                <OffcanvasMenu />
            </div>

            <div className="admin-dashboard-container">
                <main className="admin-dashboard-main">
                    {/* Perfil */}
                    <div className="admin-dashboard-profile">
                        <h1 className="admin-dashboard-title">PERFIL DE USUARIO</h1>
                        <h2 className="admin-dashboard-subtitle">
                            Veterinario{" "}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="30" height="30">
                                <circle cx="256" cy="128" r="128" />
                                <path d="M256,298.667c-105.99,0.118-191.882,86.01-192,192..." />
                            </svg>
                        </h2>
                        <label><b>Nombre:</b> {usuario.nombre || "N/A"}</label><br />
                        <label><b>Correo:</b> {usuario.correo || "N/A"}</label><br />
                        <label><b>Mascotas a cargo:</b> {usuario.mascotas || 0}</label>
                    </div>

                    {/* Estadísticas */}
                    <div className="admin-dashboard-stats">
                        <h1 className="admin-dashboard-title">ESTADÍSTICAS GENERALES</h1>
                        <ul className="admin-dashboard-stats-list">
                            <li className="admin-dashboard-stat-item">
                                <div className="admin-dashboard-stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#FFF">
                                        <path d="M480-480q-66 0-113-47..." />
                                    </svg>
                                </div>
                                <div className="admin-dashboard-stat-info">
                                    <h4 className="admin-dashboard-stat-title">Mascotas Añadidas</h4>
                                    <p className="admin-dashboard-stat-value">{stats.mascotas_agregadas || 0}</p>
                                </div>
                            </li>

                            <li className="admin-dashboard-stat-item">
                                <div className="admin-dashboard-stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="35px" viewBox="0 0 512 512" fill="#FFFCE8">
                                        <path d="M1670 5111 c-81 -25 -182 -111..." />
                                    </svg>
                                </div>
                                <div className="admin-dashboard-stat-info">
                                    <h4 className="admin-dashboard-stat-title">Citas Pendientes</h4>
                                    <p className="admin-dashboard-stat-value">{stats.citas_pendientes || 0}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </main>
            </div>
        </>
    );
}
