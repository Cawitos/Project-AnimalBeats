import { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import axios from 'axios';
import OffcanvasMenu from "./menu";
import { Link } from "react-router-dom";
import '../css/gestionEspecies.css';
import { UserContext } from "../context/UserContext";

const GestionEspecies = () => {
  const [especies, setEspecies] = useState([]);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const { User } = useContext(UserContext);

  useEffect(() => {
    const obtenerEspecies = async () => {
      try {
        const respuesta = await axios.get('https://animalbeats-api.onrender.com/Especies/Listado');
        const datos = respuesta.data;

        console.log("Datos recibidos:", datos);

        if (Array.isArray(datos)) {
          setEspecies(datos);
          setError(null);
        } else {
          setEspecies([]);
          setError(typeof datos === 'string' ? datos : "Formato inesperado");
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
        const respuesta = await axios.delete(`https://animalbeats-api.onrender.com/Especies/Eliminar/${id}`);
        const datos = respuesta.data;

        if (typeof datos === 'string') {
          Swal.fire('Error al eliminar la especie', datos, 'error');
        } else {
          setEspecies(prev =>
            Array.isArray(prev) ? prev.filter(especie => especie.id !== id) : []
          );
          Swal.fire('¡Eliminada!', 'La especie ha sido eliminada con éxito.', 'success');
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se pudo eliminar la especie.", "error");
      }
    }
  };

  // Filtrar especies según texto de búsqueda
  const especiesFiltradas = Array.isArray(especies)
    ? especies.filter(especie =>
        especie.especie?.toLowerCase().startsWith(busqueda.toLowerCase())
      )
    : [];

  return (
    <div className="gestion-especies-container">
      <nav className="gestion-especies-menu-lateral">
        <OffcanvasMenu />
      </nav>
  
      <div className="gestion-especies-dashboard">
        <main className="gestion-especies-consulta">
          <nav className="gestion-especies-navbar bg-body-tertiary">
            <div className="busqueda-especies">
              <span className="navbar-brand">Búsqueda</span>
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
                        src={especie.imagen}
                        className="img-fluid rounded-start"
                        alt={especie.especie}
                      />
                    </div>
                    <div className="col-md-8">
                      <div className="gestion-especies-card-body card-body">
                        <h1 className="gestion-especies-card-title card-title">{especie.especie}</h1>
                        <Link to={`/Razas/${especie.id}`} className="btn btn-primary">
                          Más info
                        </Link>

                        {User.rol !== 2 && (
                          <>
                            <Link to={`/Especies/modificar/${especie.id}`} className="btn btn-primary ms-2">
                              Modificar
                            </Link>
                            <button
                              onClick={() => eliminarEspecie(especie.id)}
                              className="btn btn-primary ms-2"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
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
          {User.rol !== 2 && (
            <Link to="/Especies/crear" className="btn btn-primary">
              Crear especie
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionEspecies;
