import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EstadisticasAdmin() {
    const [dashboardData, setDashboardData] = useState(null);
    const [roles, setRoles] = useState([]);
    const [totalMascotas, setTotalMascotas] = useState(0);
    const [totalRecordatorios, setTotalRecordatorios] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiUrl = "https://animalbeats-api.onrender.com";
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashRes, rolesRes, mascotasRes, recordatoriosRes] =
                    await Promise.all([
                        fetch(`${apiUrl}/admin/dashboard`),
                        fetch(`${apiUrl}/roles/Listado`),
                        fetch(`${apiUrl}/Mascotas`),
                        fetch(`${apiUrl}/recordatorios`),
                    ]);

                if (
                    dashRes.ok &&
                    rolesRes.ok &&
                    mascotasRes.ok &&
                    recordatoriosRes.ok
                ) {
                    const dashData = await dashRes.json();
                    const rolesData = await rolesRes.json();
                    const mascotasData = await mascotasRes.json();
                    const recordatoriosData = await recordatoriosRes.json();

                    setDashboardData(dashData);
                    setRoles(rolesData.roles || []);
                    setTotalMascotas(Array.isArray(mascotasData) ? mascotasData.length : 0);
                    setTotalRecordatorios(
                        Array.isArray(recordatoriosData) ? recordatoriosData.length : 0
                    );

                    setLoading(false);
                } else {
                    setError(
                        `Error al obtener datos:\nDashboard(${dashRes.status}), Roles(${rolesRes.status}), Mascotas(${mascotasRes.status}), Recordatorios(${recordatoriosRes.status})`
                    );
                    setLoading(false);
                }
            } catch (e) {
                setError("No se pudieron cargar las estadísticas: " + e.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <h3>Cargando estadísticas...</h3>
                <div className="spinner-border text-danger mt-3" role="status"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5 text-center text-danger">
                <h3>{error}</h3>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Botón volver */}
            <div className="mb-3">
                <button
                    className="btn btn-outline-danger"
                    onClick={() => navigate("/admin")}
                >
                    <i className="bi bi-arrow-left"></i> Volver al Dashboard
                </button>
            </div>

            <h1 className="text-danger fw-bold text-center mb-4" style={{ fontSize: "40px" }}>📊 Estadísticas</h1>

            {/* Total Clientes / Veterinarios */}
            <div className="card shadow mb-4" style={{ borderRadius: "12px" }}>
                <div className="card-body d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-people-fill text-danger fs-3 me-3"></i>
                        <h5 className="mb-0">Total Clientes / Veterinarios</h5>
                    </div>
                    <span className="fw-bold fs-4">
                        {dashboardData?.total_clientes ?? 0}
                    </span>
                </div>
            </div>

            {/* Roles */}
            <div className="card shadow mb-4" style={{ borderRadius: "12px" }}>
                <div className="card-body">
                    <h4 className="fw-bold mb-3">Roles en el sistema</h4>
                    {roles.length > 0 ? (
                        roles.map((rol, idx) => (
                            <div
                                key={idx}
                                className="d-flex align-items-center mb-2 border-bottom pb-2"
                            >
                                <i className="bi bi-check-circle-fill text-danger me-2"></i>
                                <div>
                                    <p className="mb-0">
                                        <b>ID:</b> {rol.id}
                                    </p>
                                    <small className="text-muted">Rol: {rol.rol}</small>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No hay roles registrados</p>
                    )}
                </div>
            </div>

            {/* Total Mascotas */}
            <div
                className="card shadow"
                style={{ borderRadius: "12px", backgroundColor: "#fff5f5" }}
            >
                <div className="card-body d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-heart-fill text-danger fs-3 me-3"></i>
                        <div>
                            <h5 className="mb-0">Total de Mascotas</h5>
                            <small className="text-muted">
                                Recordatorios asignados: {totalRecordatorios}
                            </small>
                        </div>
                    </div>
                    <span className="fw-bold fs-4">{totalMascotas}</span>
                </div>
            </div>
        </div>
    );
}
