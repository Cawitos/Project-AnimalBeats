import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import OffcanvasMenu from './menu';
import { Link, useParams } from 'react-router-dom';
import '../css/gestionRazas.css';

const GestionRazas = () => {
  const { id } = useParams();
  const [razas, setRazas] = useState([]);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const obtenerRazas = async () => {
      try {
        const respuesta = await axios.get(`http://localhost:3000/Razas/Listado/${id}`);
        const datos = respuesta.data;

        if (typeof datos === 'string') {
          setRazas([]);
          setError(datos);
        } else if (Array.isArray(datos)) {
          const datosNormalizados = datos.map(item => ({
            ...item,
            raza: item.Raza,
            descripcion: item.descripcion,
            imagen: item.imagen,
            id: item.id,
            id_especie: item.id_especie,
          }));
          setRazas(datosNormalizados);
          setError(null);
        } else {
          setRazas([]);
          setError('Datos recibidos en formato inesperado');
        }
      } catch (error) {
        setError('Error al conectar con el servidor');
        console.error(error);
      }
    };
    obtenerRazas();
  }, [id]);

  const eliminarRaza = async (idRaza) => {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta raza será eliminada permanentemente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      const respuesta = await axios.delete(`http://localhost:3000/Razas/Eliminar/${idRaza}`);
      const datos = respuesta.data;

      if (datos.mensaje && datos.mensaje.toLowerCase().includes('error')) {
        Swal.fire('Error al eliminar la raza', datos.mensaje, 'error');
      } else {
        setRazas(prev => prev.filter(raza => raza.id !== idRaza));
        Swal.fire('¡Eliminada!', 'La raza ha sido eliminada con éxito.', 'success');
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo eliminar la raza.", "error");
    }
  }
};


  const razasFiltradas = Array.isArray(razas)
    ? razas.filter(raza =>
        raza.raza &&
        typeof raza.raza === 'string' &&
        raza.raza.toLowerCase().startsWith(busqueda.toLowerCase())
      )
    : [];

  return (
    <div className="gestion-razas-container">
      <nav className="gestion-especies-menu-lateral">
        <OffcanvasMenu />
      </nav>
      <div className="gestion-razas-dashboard">
        <main className="gestion-razas-consulta">
          <nav className="gestion-razas-navbar bg-body-tertiary">
            <span className="gestion-razas-navbar-brand">Busqueda</span>
            <form className="gestion-razas-form d-flex" role="search" onSubmit={(e) => e.preventDefault()}>
              <input
                className="gestion-razas-input form-control me-2"
                type="search"
                placeholder="Buscar Raza"
                aria-label="Search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <button className="gestion-razas-boton btn btn-primary" type="submit">
                Buscar
              </button>
            </form>
          </nav>

          <div className="gestion-razas-row row">
            {razasFiltradas && razasFiltradas.length > 0 ? (
              razasFiltradas.map((raza) => (
                <div className="gestion-razas-card card mb-3" style={{ maxWidth: '540px' }} key={raza.id}>
                  <div className="row g-0">
                    <div className="col-md-4">
                      <img
                        src={`http://localhost:3000/imagenes_razas/${raza.imagen}`}
                        className="img-fluid rounded-start"
                        alt={raza.raza}
                      />
                    </div>
                    <div className="col-md-8">
                      <div className="gestion-razas-card-body card-body">
                        <h1 className="gestion-razas-card-title card-title">{raza.Raza}</h1>
                        <p className="gestion-razas-card-text card-text">Descripción: {raza.descripcion}</p>
                        <Link to={`/Razas/modificar/${id}/${raza.id}`} className="btn btn-primary">
                          Modificar
                        </Link>
                        <button
                          onClick={() => eliminarRaza(raza.id)}
                          className="btn btn-danger ms-2 gestion-razas-btn-eliminar"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="gestion-razas-sin-resultados">{error || 'No hay razas registradas.'}</p>
            )}
          </div>
        </main>

        <div className="gestion-razas-crear">
          {id ? (
            <>
              <Link to="/Especies" className="btn btn-secondary me-2">
                Regresar
              </Link>
              <Link to={`/Razas/crear/${id}`} className="btn btn-primary">
                Crear raza
              </Link>
            </>
          ) : (
            <p>Cargando...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionRazas;

