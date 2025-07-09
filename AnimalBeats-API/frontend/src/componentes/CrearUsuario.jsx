import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function CrearUsuario() {
  const navigate = useNavigate();
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [formData, setFormData] = useState({
    id_documento: '',
    n_documento: '',
    nombre: '',
    correoelectronico: '',
    contrasena: '',
    id_rol: '',
  });

  useEffect(() => {
    const obtenerTiposDocumento = async () => {
      try {
        const response = await axios.get('http://localhost:3000/tiposDocumento');
        if (response.data && Array.isArray(response.data)) {
          setTiposDocumento(response.data);
        } else {
          console.error('Respuesta inesperada:', response.data);
        }
      } catch (error) {
        console.error('Error al obtener tipos de documento:', error);
      }
    };
    obtenerTiposDocumento();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/usuario/Crear', formData);
      Swal.fire({
        title: '¡Éxito!, Usuario Creado Correctamente',
        text: response.data.mensaje,
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/gestionusuarios');
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error',
        text: 'Error al registrar usuario',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div className="crear-usuario-container container mt-5">
      <div className="crear-usuario-card card mx-auto shadow p-4" style={{ maxWidth: '500px' }}>
        <h3 className="crear-usuario-title text-center mb-4">Crear Usuario</h3>
        <form className="crear-usuario-form" onSubmit={handleSubmit}>
          <div className="crear-usuario-field mb-3">
            <label htmlFor="id_documento" className="crear-usuario-label form-label">Tipo de documento</label>
            <select
              className="crear-usuario-select form-select"
              name="id_documento"
              id="id_documento"
              required
              value={formData.id_documento}
              onChange={handleChange}
            >
              <option value="">Seleccione un tipo</option>
              {tiposDocumento.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>{tipo.tipo}</option>
              ))}
            </select>
          </div>

          <div className="crear-usuario-field mb-3">
            <label htmlFor="n_documento" className="crear-usuario-label form-label">Número de documento</label>
            <input
              type="number"
              className="crear-usuario-input form-control"
              name="n_documento"
              id="n_documento"
              required
              value={formData.n_documento}
              onChange={handleChange}
            />
          </div>

          <div className="crear-usuario-field mb-3">
            <label htmlFor="nombre" className="crear-usuario-label form-label">Nombre completo</label>
            <input
              type="text"
              className="crear-usuario-input form-control"
              name="nombre"
              id="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          <div className="crear-usuario-field mb-3">
            <label htmlFor="correoelectronico" className="crear-usuario-label form-label">Correo electrónico</label>
            <input
              type="email"
              className="crear-usuario-input form-control"
              name="correoelectronico"
              id="correoelectronico"
              required
              value={formData.correoelectronico}
              onChange={handleChange}
            />
          </div>

          <div className="crear-usuario-field mb-3">
            <label htmlFor="contrasena" className="crear-usuario-label form-label">Contraseña</label>
            <input
              type="password"
              className="crear-usuario-input form-control"
              name="contrasena"
              id="contrasena"
              required
              value={formData.contrasena}
              onChange={handleChange}
            />
          </div>

          <div className="crear-usuario-field mb-3">
            <label htmlFor="id_rol" className="crear-usuario-label form-label">Rol</label>
            <select
              className="crear-usuario-select form-select"
              name="id_rol"
              id="id_rol"
              required
              value={formData.id_rol}
              onChange={handleChange}
            >
              <option value="">Seleccione un rol</option>
              <option value="1">Administrador</option>
              <option value="2">Cliente</option>
              <option value="3">Veterinario</option>
            </select>
          </div>

          <div className="crear-usuario-actions text-center mt-4">
            <button type="submit" className="crear-usuario-button btn btn-danger">Registrar Usuario</button>
          </div>
        </form>
      </div>
    </div>
  );
}
