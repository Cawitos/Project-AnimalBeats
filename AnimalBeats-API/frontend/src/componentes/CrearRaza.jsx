import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../css/CrearRaza.css';

function CrearRaza() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [raza, setRaza] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!raza.trim()) {
    Swal.fire('Atención', 'El nombre de la raza es obligatorio.', 'warning');
    return;
  }

  const formData = new FormData();
  formData.append('raza', raza);
  formData.append('descripcion', descripcion);
  if (imagen) {
    formData.append('imagen', imagen);
  }
  // No agregues id_especie aquí, ya que lo envías en la URL

  try {
    setLoading(true);
    await axios.post(`http://localhost:3000/Razas/Crear/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    await Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: 'La raza se creó correctamente.',
      confirmButtonText: 'Aceptar',
    });

    navigate(`/Razas/${id}`);
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'No se pudo crear la raza.', 'error');
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="contenedor-dashboard">
      <main className="contenido-principal">
        <h1>Crear Raza</h1>
        <div className="contenedor-formulario">
          <form className="form-mascota" onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="mb-3">
              <label htmlFor="Raza" className="form-label">Nombre de la Raza</label>
              <input
                type="text"
                id="Raza"
                name="Raza"
                className="form-control"
                required
                value={raza}
                onChange={(e) => setRaza(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="descripcion" className="form-label">Descripción de la Raza</label>
              <textarea
                id="descripcion"
                name="descripcion"
                className="form-control"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="imagen" className="form-label">Imagen de la Raza</label>
              <input
                type="file"
                id="imagen"
                name="imagen"
                className="form-control"
                accept="image/*"
                onChange={(e) => setImagen(e.target.files[0])}
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Raza'}
              </button>
            </div>
            <Link to={`/razas/${id}`} className="btn btn-link">
              Volver
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CrearRaza;
