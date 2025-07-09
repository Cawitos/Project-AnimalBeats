import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ConsultarU() {
  const { n_documento } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/usuario/${n_documento}`)
      .then(res => res.json())
      .then(data => {
        setUsuario(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al obtener usuario:', err);
        setLoading(false);
      });
  }, [n_documento]);

  const volver = () => navigate(-1);

  if (loading) return <p className="consultar-u-loading text-center mt-5">Cargando usuario...</p>;
  if (!usuario || usuario === 'Usuario no encontrado')
    return <p className="consultar-u-error text-center mt-5">Usuario no encontrado.</p>;

  return (
    <div className="consultar-u-wrapper d-flex justify-content-center align-items-center vh-100">
      <div className="consultar-u-card card shadow p-4" style={{ width: '28rem' }}>
        <h3 className="consultar-u-title text-center mb-4">Usuario {usuario.n_documento}</h3>
        <ul className="consultar-u-list list-group list-group-flush">
          <li className="consultar-u-item list-group-item">
            <b>Nombre:</b> {usuario.nombre}
          </li>
          <li className="consultar-u-item list-group-item">
            <b>Tipo de documento:</b> {usuario.tipo_documento}
          </li>
          <li className="consultar-u-item list-group-item">
            <b>Correo:</b> {usuario.correoelectronico}
          </li>
        </ul>
        <div className="consultar-u-actions mt-4 text-center">
          <button className="consultar-u-button btn btn-danger" onClick={volver}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConsultarU;
