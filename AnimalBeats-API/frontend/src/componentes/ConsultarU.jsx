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

  if (loading) return <p className="text-center mt-5">Cargando usuario...</p>;
  if (!usuario || usuario === 'Usuario no encontrado')
    return <p className="text-center mt-5">Usuario no encontrado.</p>;

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ width: '28rem' }}>
        <h3 className="text-center mb-4">Usuario {usuario.n_documento}</h3>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <b>Nombre:</b> {usuario.nombre}
          </li>
          <li className="list-group-item">
            <b>Tipo de documento:</b> {usuario.tipo_documento}
          </li>
          <li className="list-group-item">
            <b>Correo:</b> {usuario.correoelectronico}
          </li>
        </ul>
        <div className="mt-4 text-center">
          <button className="btn btn-danger" onClick={volver}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConsultarU;
