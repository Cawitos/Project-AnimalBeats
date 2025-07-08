import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import '../css/ModificarEspecieRaza.css';

const ModificarRaza = () => {
  const { id_especie, id_raza } = useParams();
  const navigate = useNavigate();

  const [nombreRaza, setNombreRaza] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenActual, setImagenActual] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRaza = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/razas/${id_raza}`);
        const raza = response.data;

        setNombreRaza(raza.raza || "");
        setDescripcion(raza.descripcion || "");
        setImagenActual(raza.imagen || null); // Aquí asumimos que el backend envía la propiedad imagen
      } catch (err) {
        setError("Error al cargar los datos de la raza");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRaza();
  }, [id_raza]);

  const handleImagenChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImagen(e.target.files[0]);
    } else {
      setImagen(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("raza", nombreRaza);
      formData.append("descripcion", descripcion);
      if (imagen) {
        formData.append("imagen", imagen);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      await axios.put(`http://localhost:3000/Razas/Actualizar/${id_raza}`, formData, config);

      Swal.fire({
        icon: "success",
        title: "Raza actualizada",
        text: "Los datos de la raza se actualizaron correctamente",
      });

      navigate(`/razas/${id_especie}`);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la raza",
      });
    }
  };

  if (loading) return <p className="raza-loading">Cargando datos...</p>;
  if (error) return <p className="raza-error">{error}</p>;

  return (
    <div className="raza-contenedor-dashboard">
      <main className="raza-contenido-principal">
        <h1 className="raza-titulo">Modificar Raza</h1>
        <div className="raza-contenedor-formulario">
          <form className="raza-form-mascota" onSubmit={handleSubmit} encType="multipart/form-data">
            
            <div className="raza-mb-3">
              <label htmlFor="Raza" className="raza-form-label">
                Nombre de la Raza
              </label>
              <input
                type="text"
                id="Raza"
                name="Raza"
                className="raza-form-control"
                value={nombreRaza}
                onChange={(e) => setNombreRaza(e.target.value)}
                required
              />
            </div>

            <div className="raza-mb-3">
              <label htmlFor="descripcion" className="raza-form-label">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                className="raza-form-control"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción de la raza"
              />
            </div>

            <div className="raza-mb-3">
              <label className="raza-form-label">Imagen actual</label>
              {imagenActual ? (
                <div>
                  <img
                    src={`http://localhost:3000/imagenes_razas/${imagenActual}`}
                    alt={nombreRaza}
                    style={{ maxWidth: '200px', display: 'block', marginBottom: '10px' }}
                  />
                </div>
              ) : (
                <p>No hay imagen disponible</p>
              )}
            </div>

            <div className="raza-mb-3">
              <label htmlFor="imagen" className="raza-form-label">
                Cambiar imagen (opcional)
              </label>
              <input
                type="file"
                id="imagen"
                name="imagen"
                className="raza-form-control"
                accept="image/*"
                onChange={handleImagenChange}
              />
            </div>

            <div className="raza-mb-3">
              <button type="submit" className="raza-btn-primary">
                Modificar Raza
              </button>
            </div>

            <Link to={`/razas/${id_especie}`} className="raza-btn-link">
              Volver
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ModificarRaza;
