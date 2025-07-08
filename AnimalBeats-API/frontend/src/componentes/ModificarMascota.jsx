import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import '../css/ModificarMascota.css'

const ModificarMascota = () => {
  const { id } = useParams(); // Obtener id de la mascota desde la URL
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState("Activo"); // Puedes ajustar valores según tu lógica
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos actuales de la mascota
  useEffect(() => {
    const fetchMascota = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/mascotas/${id}`);
        const mascota = response.data;
        setNombre(mascota.nombre);
        setEstado(mascota.estado || "Activo");
      } catch (err) {
        setError("Error al cargar los datos de la mascota");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMascota();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:3000/Mascotas/Actualizar/${id}`, {
        nombre,
        estado,
      });

      Swal.fire({
        icon: "success",
        title: "Mascota actualizada",
        text: "Los datos de la mascota se actualizaron correctamente",
      });

      navigate("/Mascotas"); // Redirigir a listado o donde quieras
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la mascota",
      });
    }
  };

  if (loading) return <p className="mod-mascota-loading">Cargando datos...</p>;
  if (error) return <p className="mod-mascota-error">{error}</p>;

  return (
    <div className="mod-mascota-contenedor-dashboard">
      <div className="mod-mascota-contenido-principal">
        <h1 className="mod-mascota-titulo">Modificar Mascota</h1>
        <div className="mod-mascota-contenedor-formulario">
          <form className="mod-mascota-form" onSubmit={handleSubmit}>
            <div className="mod-mascota-mb-3">
              <label htmlFor="nameC" className="mod-mascota-form-label">
                Nombre de Mascota:
              </label>
              <input
                type="text"
                className="mod-mascota-form-control"
                id="nameC"
                name="nameC"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="mod-mascota-mb-3">
              <label htmlFor="estadoC" className="mod-mascota-form-label">
                Estado:
              </label>
              <select
                id="estadoC"
                name="estadoC"
                className="mod-mascota-form-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                required
              >
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
                {/* Agrega más estados si los tienes */}
              </select>
            </div>

            <div className="mod-mascota-mb-3">
              <button type="submit" className="mod-mascota-btn-primary">
                Modificar
              </button>
            </div>
          </form>
          <div className="mod-mascota-btn-secondary-wrapper">
            <Link to="/Mascotas" className="mod-mascota-btn-secondary">
              Volver
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModificarMascota;

