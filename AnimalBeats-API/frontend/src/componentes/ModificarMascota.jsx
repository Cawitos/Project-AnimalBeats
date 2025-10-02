import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import '../css/ModificarMascota.css'

const ModificarMascota = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState("activo"); // valor inicial en minúsculas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMascota = async () => {
      try {
        const response = await axios.get(`https://animalbeats-api.onrender.com/mascotas/${id}`);
        const mascota = response.data;

        // Normalizar datos
        setNombre(mascota.nombre || "");
        setEstado(mascota.estado?.toLowerCase() || "activo");
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
      const res = await axios.put(
        `https://animalbeats-api.onrender.com/Mascotas/Actualizar/${id}`,
        { nombre, estado },
        { validateStatus: () => true } // 🔹 permite manejar todos los status manualmente
      );

      // Revisar status manualmente
      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Mascota actualizada",
          text: "Los datos de la mascota se actualizaron correctamente",
        });
        navigate("/Mascotas");
      } else if (res.status === 404) {
        Swal.fire({
          icon: "warning",
          title: "No encontrada",
          text: res.data.mensaje || "No se encontró la mascota",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.error || "No se pudo actualizar la mascota",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error de conexión",
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
              <label htmlFor="nameC" className="mod-mascota-form-label">Nombre de Mascota:</label>
              <input
                type="text"
                className="mod-mascota-form-control"
                id="nameC"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="mod-mascota-mb-3">
              <label htmlFor="estadoC" className="mod-mascota-form-label">Estado:</label>
              <select
                id="estadoC"
                className="mod-mascota-form-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                required
              >
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>

            <div className="mod-mascota-mb-3">
              <button type="submit" className="mod-mascota-btn-primary">Modificar</button>
            </div>
          </form>

          <div className="mod-mascota-btn-secondary-wrapper">
            <Link to="/Mascotas" className="mod-mascota-btn-secondary">Volver</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModificarMascota;
