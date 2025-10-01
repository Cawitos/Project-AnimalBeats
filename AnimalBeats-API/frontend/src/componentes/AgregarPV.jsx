import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AgregarPV() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre_completo: "",
        estudios_especialidad: "",
        edad: "",
        altura: "",
        anios_experiencia: "",
    });
    const [imagen, setImagen] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImagen(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();
            data.append("nombre_completo", formData.nombre_completo);
            data.append("estudios_especialidad", formData.estudios_especialidad);
            data.append("edad", formData.edad);
            data.append("altura", formData.altura);
            data.append("anios_experiencia", formData.anios_experiencia);

            if (imagen) {
                data.append("imagen", imagen);
            }

            const res = await axios.post(
                "https://animalbeats-api.onrender.com/veterinarios/crear",
                data,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (res.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "¡Éxito!",
                    text: "Veterinario creado correctamente",
                    confirmButtonColor: "#d33",
                }).then(() => {
                    navigate("/veterinarios");
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: res.data.mensaje || "No se pudo guardar el veterinario",
                    confirmButtonColor: "#d33",
                });
            }
        } catch (error) {
            console.error("🔥 Error al guardar veterinario:", error);
            Swal.fire({
                icon: "error",
                title: "Error de conexión",
                text: "No se pudo conectar con el servidor",
                confirmButtonColor: "#d33",
            });
        }
    };

    return (
        <div className="agregar-vet-container container mt-5">
            <div
                className="agregar-vet-card card mx-auto shadow-lg p-4"
                style={{ maxWidth: "550px", borderRadius: "20px" }}
            >
                {/* Título */}
                <h2
                    className="text-center mb-4 display-6 fw-bold"
                    style={{ color: "#e63946" }}
                >
                    Agregar Veterinario
                </h2>

                <form onSubmit={handleSubmit} className="agregar-vet-form">
                    {/* Nombre */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Nombre Completo</label>
                        <input
                            type="text"
                            name="nombre_completo"
                            className="form-control"
                            value={formData.nombre_completo}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Estudios */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Estudios o Especialidad
                        </label>
                        <input
                            type="text"
                            name="estudios_especialidad"
                            className="form-control"
                            value={formData.estudios_especialidad}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Edad */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Edad</label>
                        <input
                            type="number"
                            name="edad"
                            className="form-control"
                            value={formData.edad}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Altura */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Altura (m)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="altura"
                            className="form-control"
                            value={formData.altura}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Experiencia */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Años de Experiencia
                        </label>
                        <input
                            type="number"
                            name="anios_experiencia"
                            className="form-control"
                            value={formData.anios_experiencia}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Imagen */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Imagen</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="form-control"
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* Botón */}
                    <div className="text-center mt-4">
                        <button
                            type="submit"
                            className="btn"
                            style={{
                                backgroundColor: "#f44336",
                                color: "#fff",
                                fontWeight: "bold",
                                padding: "10px 30px",
                                borderRadius: "10px",
                            }}
                        >
                            Guardar Veterinario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
