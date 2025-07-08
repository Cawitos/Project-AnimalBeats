import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from 'axios';
import OffcanvasMenu from "./menu";
import { Link } from "react-router-dom";
import '../css/gestionEspecies.css'

const gestionEspecies = () => {
  const [especies, setEspecies] = useState([]);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const obtenerEspecies = async () => {
      try {
        const respuesta = await axios.get('http://localhost:3000/Especies/Listado');
        const datos = respuesta.data;

        if (typeof datos === 'string') {
          setEspecies([]);
          setError(datos);
        } else {
          setEspecies(datos);
          setError(null);
        }
      } catch (error) {
        setError('Error al conectar con el servidor');
        console.error(error);
      }
    };
    obtenerEspecies();
  }, []);

  const eliminarEspecie = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta especie será eliminada permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const respuesta = await axios.delete(`http://localhost:3000/Especies/Eliminar/${id}`);
        const datos = respuesta.data;

        if (typeof datos === 'string') {
          Swal.fire('Error al eliminar la especie', datos, 'error');
        } else {
          setEspecies(prev => prev.filter(especie => especie.id !== id));
          Swal.fire('¡Eliminada!', 'La especie ha sido eliminada con éxito.', 'success');
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se pudo eliminar la especie.", "error");
      }
    }
  };

  // Filtrar especies según texto de búsqueda
  const especiesFiltradas = especies.filter(especie =>
  especie.Especie.toLowerCase().startsWith(busqueda.toLowerCase())
);


  return (
    <div className="gestion-especies-container">
      <nav className="gestion-especies-menu-lateral">
        <OffcanvasMenu />
      </nav>
  
  <div className="gestion-especies-dashboard">
    <main className="gestion-especies-consulta">
      <nav className="gestion-especies-navbar bg-body-tertiary">
        <div className="busqueda-especies">
          <span className="navbar-brand">Busqueda</span>
           <form
      className="gestion-especies-form"
      role="search"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        className="form-control me-2"
        type="search"
        placeholder="Buscar Especie"
        aria-label="Search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <button className="btn btn-primary" type="submit">
        Buscar
      </button>
    </form>
  </div>
</nav>


      <div className="gestion-especies-row">
        {especiesFiltradas && especiesFiltradas.length > 0 ? (
          especiesFiltradas.map((especie) => (
            <div className="gestion-especies-card mb-3" style={{ maxWidth: '540px' }} key={especie.id}>
              <div className="row g-0">
                <div className="col-md-4">
                  <img
                    src={`http://localhost:3000/imagenes_especies/${especie.imagen}`}
                    className="img-fluid rounded-start"
                    alt={especie.Especie}
                  />
                </div>
                <div className="col-md-8">
                  <div className="gestion-especies-card-body card-body">
                    <h1 className="gestion-especies-card-title card-title">{especie.Especie}</h1>
                    <Link to={`/Razas/${especie.id}`} className="btn btn-primary">
                      Más info
                    </Link>
                    <Link to={`/Especies/modificar/${especie.id}`} className="btn btn-primary ms-2">
                      Modificar
                    </Link>
                    <button
                      onClick={() => eliminarEspecie(especie.id)}
                      className="btn btn-primary ms-2"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No hay especies registradas.</p>
        )}
      </div>
    </main>
    <div className="gestion-especies-crear">
      <Link to="/Especies/crear" className="btn btn-primary">
        Crear especie
      </Link>
    </div>
  </div>
</div>

  );
};

export default gestionEspecies;

