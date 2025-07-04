import { useEffect, useState } from "react";
import OffcanvasMenu from "./menu";

const gestionMascotas = () => {
    const [mascotas, setMascotas] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
    // Definimos la función async dentro de useEffect
    const fetchMascotas = async () => {
      try {
        const response = await fetch('http://localhost:3000/mascotas');
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        const data = await response.json();

        // Si el backend devuelve un string cuando no hay datos, manejamos eso
        if (typeof data === 'string') {
          setMascotas([]);
          setError(data); // Mostrar mensaje 'No hay mascotas registradas'
        } else {
          setMascotas(data);
          setError(null);
        }
      } catch (err) {
        setError('Error al conectar con el servidor');
        console.error(err);
      }
    };

    fetchMascotas();
  }, []);
  return (
    <div>
        <OffcanvasMenu />
      <div className="contenido-principal">
  <h1>Gestión de Mascotas</h1>
  {error && <p style={{ color: 'red' }}>{error}</p>}
  {!error && mascotas.length === 0 && <p>No hay mascotas registradas.</p>}
  {mascotas.length > 0 && (
    <div className="contenedor-tabla">
      <table className="tabla-mascotas" id="tabla-mascotas">
        <thead>
          <tr>
            <th>Código dueño</th>
            <th>Nombre</th>
            <th>Especie</th>
            <th>Raza</th>
            <th>Edad</th>
            <th>Historial</th>
            <th>Modificar</th>
            <th>Suspender</th>
          </tr>
        </thead>
        <tbody>
          {mascotas.map((mascota) => (
            <tr key={mascota.id}>
              <td>{mascota.id_cliente}</td>
              <td>{mascota.nombre}</td>
              <td>{mascota.Especie}</td>
              <td>{mascota.Raza}</td>
              <td>{mascota.edad}</td>
              <td>
                <button
                  onClick={() => {
                    // Aquí puedes manejar la navegación o mostrar historial
                  }}
                  aria-label={`Ver historial de ${mascota.nombre}`}
                  className="btn-icon"
                >
                  {/* Aquí puedes poner un icono SVG o texto */}
                  Historial
                </button>
              </td>
              <td>
                <button
                  onClick={() => {
                    // Manejar modificar mascota
                  }}
                  aria-label={`Modificar ${mascota.nombre}`}
                  className="btn-icon"
                >
                  Modificar
                </button>
              </td>
              <td>
                <button
                  onClick={() => {
                    // Manejar suspender mascota
                  }}
                  aria-label={`Suspender ${mascota.nombre}`}
                  className="btn-icon"
                >
                  Suspender
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    )}
    </div>

    </div>
  )
}

export default gestionMascotas
