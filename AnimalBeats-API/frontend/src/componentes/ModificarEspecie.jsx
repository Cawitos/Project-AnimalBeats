import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../css/ModificarEspecieRaza.css';

function ModificarEspecie() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [especie, setEspecie] = useState('');
  const [imagenActual, setImagenActual] = useState(null);
  const [nuevaImagen, setNuevaImagen] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const obtenerEspecie = async () => {
      try {
        const respuesta = await axios.get(`http://localhost:3000/Especies/${id}`);
        const datos = respuesta.data;

        setEspecie(datos.Especie || '');
        setImagenActual(datos.imagen || null);
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar la especie.', 'error');
      }
    };

    obtenerEspecie();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!especie.trim()) {
      Swal.fire('Atención', 'El nombre de la especie es obligatorio.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('Especie', especie);
    if (nuevaImagen) {
      formData.append('imagen', nuevaImagen);
    }

    try {
      setLoading(true);
      await axios.put(`http://localhost:3000/Especies/Actualizar/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await Swal.fire({
        icon: 'success',
        title: '¡Modificado!',
        text: 'La especie se actualizó correctamente.',
        confirmButtonText: 'Aceptar',
      });

      navigate('/especies');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo modificar la especie.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="especie-contenedor-dashboard">
      <main className="especie-contenido-principal">
        <h1 className="especie-titulo">Modificar Especie</h1>
        <div className="especie-contenedor-formulario">
          <form className="especie-form-mascota" onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="especie-mb-3">
              <label htmlFor="Especie" className="especie-form-label">Nombre de la especie</label>
              <input
                type="text"
                className="especie-form-control"
                id="Especie"
                name="Especie"
                required
                value={especie}
                onChange={(e) => setEspecie(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="especie-mb-3">
              <label className="especie-form-label">Imagen actual</label>
              {imagenActual ? (
                <div>
                  <img
                    src={`http://localhost:3000/imagenes_especies/${imagenActual}`}
                    alt={especie}
                    style={{ maxWidth: '200px', display: 'block', marginBottom: '10px' }}
                  />
                </div>
              ) : (
                <p>No hay imagen disponible</p>
              )}
            </div>

            <div className="especie-mb-3">
              <label htmlFor="imagen" className="especie-form-label">Cambiar imagen</label>
              <input
                type="file"
                className="especie-form-control"
                id="imagen"
                name="imagen"
                accept="image/*"
                onChange={(e) => setNuevaImagen(e.target.files[0])}
                disabled={loading}
              />
            </div>

            <div className="especie-mb-3">
              <button type="submit" className="especie-btn-primary" disabled={loading}>
                {loading ? 'Modificando...' : 'Modificar Especie'}
              </button>
              <Link to="/Especies" className="especie-btn-link ms-3">Volver</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ModificarEspecie;
