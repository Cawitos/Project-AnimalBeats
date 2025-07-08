import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../css/CrearEspecie.css';


function CrearEspecie() {
  const [especie, setEspecie] = useState('');
  const [imagen, setImagen] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!especie.trim()) {
      Swal.fire('Atención', 'Por favor ingresa el nombre de la especie', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('Especie', especie);
    if (imagen) {
      formData.append('imagen', imagen);
    }

    try {
      await axios.post('http://localhost:3000/Especies/Crear', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'La especie se agregó correctamente.',
        confirmButtonText: 'Aceptar',
      });

      navigate('/especies'); // Redirige después de cerrar la alerta
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo agregar la especie.', 'error');
    }
  };
  

  return (
    <main className="contenedor-formulario">
      <h1>Crear Especie</h1>
      <form className="form-mascota" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label htmlFor="Especie" className="form-label">Nombre de la Especie</label>
          <input
            type="text"
            className="form-control"
            id="Especie"
            name="Especie"
            required
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="imagen" className="form-label">Imagen de la Especie</label>
          <input
            type="file"
            className="form-control"
            id="imagen"
            name="imagen"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
          />
        </div>
        <div className="mb-3">
          <button type="submit" className="btn btn-primary">Crear Especie</button>
        </div>
        <Link to="/Especies" className="btn btn-link">Volver</Link>
      </form>
    </main>
  );
}

export default CrearEspecie;

