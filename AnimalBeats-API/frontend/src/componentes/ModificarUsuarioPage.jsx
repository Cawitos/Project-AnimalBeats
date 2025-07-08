import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ModificarUsuario from "./ModificarUsuario";

export default function ModificarUsuarioPage() {
  const { n_documento } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/usuario/${n_documento}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar usuario");
        return res.json();
      })
      .then((data) => {
        if (typeof data === "string") {
          setError(data);
        } else {
          setUsuario(data);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar el usuario.");
      })
      .finally(() => setCargando(false));
  }, [n_documento]);

  if (cargando) return <div className="text-center mt-5">Cargando usuario...</div>;
  if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>;

  return <ModificarUsuario usuario={usuario} />;
}