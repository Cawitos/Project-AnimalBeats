
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import OffcanvasMenu from "./menu";

const baseUrl = "https://animalbeats-api.onrender.com";

export default function Veterinarios() {
    const navigate = useNavigate();
    const [mostrarAviso, setMostrarAviso] = useState(true);
    const [veterinarios, setVeterinarios] = useState([]);

    const cargarVeterinarios = async () => {
        try {
            const res = await axios.get(`${baseUrl}/veterinarios`);
            setVeterinarios(res.data);
        } catch (err) {
            console.error("❌ Error cargando veterinarios:", err);
        }
    };

    const eliminarVeterinario = async (id) => {
        Swal.fire({
            title: "¿Eliminar veterinario?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${baseUrl}/veterinarios/${id}`);
                    Swal.fire("Eliminado", "Veterinario eliminado correctamente", "success");
                    cargarVeterinarios();
                } catch (err) {
                    Swal.fire("Error", "No se pudo eliminar", "error");
                }
            }
        });
    };

    const mostrarDetalle = (vet) => {
        Swal.fire({
            title: vet.nombre_completo || "Sin nombre",
            html: `
        ${vet.imagen_url ? `<img src="${vet.imagen_url}" width="200" style="margin-bottom:10px;border-radius:8px"/>` : "👤"}
        <p><b>Estudios:</b> ${vet.estudios_especialidad || "N/A"}</p>
        <p><b>Edad:</b> ${vet.edad || "N/A"}</p>
        <p><b>Altura:</b> ${vet.altura || "N/A"} m</p>
        <p><b>Experiencia:</b> ${vet.anios_experiencia || "N/A"} años</p>
      `,
            confirmButtonText: "Cerrar",
        });
    };

    useEffect(() => {
        if (!mostrarAviso) {
            cargarVeterinarios();
        }
    }, [mostrarAviso]);

    return (
        <>
            {/* 🔹 Menú lateral */}
            <OffcanvasMenu />

            <div className="container mt-4">
                {mostrarAviso ? (
                    <div className="text-center">
                        <h1
                            className="fw-bold text-danger mb-4"
                            style={{ fontSize: "2.5rem", textAlign: "center" }} // 🔹 forzado
                        >
                            Bienvenido Veterinario
                        </h1>
                        <p className="mt-3 fs-5">
                            Presiona el botón de continuar, selecciona la opción agregar y
                            rellena los datos que te pide el formulario.
                        </p>
                        <button
                            className="btn btn-danger mt-3 px-4 py-2"
                            onClick={() => setMostrarAviso(false)}
                        >
                            Continuar
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 🔹 Título grande y centrado */}
                        <h1
                            className="text-danger text-center fw-bold mb-5"
                            style={{ fontSize: "3rem" }} // 🔹 aquí forzamos tamaño
                        >
                            Gestión de Veterinarios
                        </h1>

                        {veterinarios.length === 0 ? (
                            <p className="text-muted text-center fs-5">
                                Aquí se mostrarán los perfiles de los veterinarios
                            </p>
                        ) : (
                            <div className="row">
                                {veterinarios.map((vet) => (
                                    <div key={vet.id} className="col-md-4 mb-4">
                                        <div className="card shadow-sm text-center p-3">
                                            {vet.imagen_url ? (
                                                <img
                                                    src={vet.imagen_url}
                                                    alt="veterinario"
                                                    className="mx-auto mb-3"
                                                    style={{
                                                        width: "200px",
                                                        height: "200px",
                                                        objectFit: "cover",
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            ) : (
                                                <div className="text-center p-5 fs-1">👤</div>
                                            )}
                                            <h5 className="fw-bold">{vet.nombre_completo || "Sin nombre"}</h5>
                                            <p className="text-muted">
                                                Especialidad: {vet.estudios_especialidad || "N/A"}
                                            </p>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-primary flex-fill"
                                                    onClick={() => mostrarDetalle(vet)}
                                                >
                                                    Ver
                                                </button>
                                                <button
                                                    className="btn btn-danger flex-fill"
                                                    onClick={() => eliminarVeterinario(vet.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            className="btn btn-danger rounded-circle shadow d-flex align-items-center justify-content-center"
                            style={{
                                position: "fixed",
                                bottom: "30px",
                                right: "30px",
                                width: "70px",
                                height: "70px",
                                fontSize: "32px",
                            }}
                            onClick={() => navigate("/agregarpv")}
                        >
                            +
                        </button>
                    </>
                )}
            </div>
        </>
    );
}
