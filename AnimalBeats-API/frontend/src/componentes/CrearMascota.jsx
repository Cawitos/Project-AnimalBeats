import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../css/CrearMascota.css";

const CrearMascota = () => {
  const obtenerFechaActual = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
  };

  const fechaActual = obtenerFechaActual();

  const [especies, setEspecies] = useState([]);
  const [razas, setRazas] = useState([]);
  const [idEspecieSeleccionada, setIdEspecieSeleccionada] = useState("");
  const [formData, setFormData] = useState({
    nombreM: "",
    especieM: "",
    razaM: "",
    fechaNacimiento: "",
    n_documento: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 🔹 Obtener especies
  useEffect(() => {
    const obtenerEspecies = async () => {
      try {
        const respuesta = await axios.get(
          "https://animalbeats-api.onrender.com/Especies/Listado"
        );
        const datos = respuesta.data;

        if (Array.isArray(datos)) {
          // normalizo formato
          const especiesNormalizadas = datos.map((item) => ({
            id: item.id,
            nombre: item.Especie || item.especie || "Sin nombre",
          }));
          setEspecies(especiesNormalizadas);
          setError(null);
        } else {
          setEspecies([]);
          setError("Error: datos de especies en formato inesperado");
        }
      } catch (error) {
        setError("Error al conectar con el servidor");
        console.error(error);
      }
    };
    obtenerEspecies();
  }, []);

  // 🔹 Obtener razas
  useEffect(() => {
    if (!idEspecieSeleccionada) {
      setRazas([]);
      setFormData((prev) => ({ ...prev, razaM: "" }));
      return;
    }
    const obtenerRazas = async () => {
      try {
        const respuesta = await axios.get(
          `https://animalbeats-api.onrender.com/Razas/Listado/${idEspecieSeleccionada}`
        );
        const datos = respuesta.data;

        if (Array.isArray(datos)) {
          const razasNormalizadas = datos.map((item) => ({
            id: item.id,
            nombre: item.Raza || item.raza || "Sin nombre",
          }));
          setRazas(razasNormalizadas);
          setError(null);
        } else {
          setRazas([]);
          setError("Error: datos de razas en formato inesperado");
        }
      } catch (error) {
        setError("Error al conectar con el servidor");
        console.error(error);
      }
    };
    obtenerRazas();
  }, [idEspecieSeleccionada]);

  // 🔹 Manejo de cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "especieM") {
      setIdEspecieSeleccionada(value);
      setFormData((prev) => ({ ...prev, razaM: "" }));
    }
  };

  // 🔹 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const mascotaData = {
      nombre: formData.nombreM,
      id_especie: formData.especieM,
      id_raza: formData.razaM,
      fecha_nacimiento: formData.fechaNacimiento,
      id_cliente: formData.n_documento,
      estado: "activo",
    };

    try {
      await axios.post(
        "https://animalbeats-api.onrender.com/Mascotas/Registro",
        mascotaData
      );

      await Swal.fire({
        icon: "success",
        title: "¡Mascota creada exitosamente!",
        showConfirmButton: false,
        timer: 2000,
      });

      navigate("/Mascotas");
    } catch (err) {
      console.error(err);
      setError("Error al crear mascota");

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error al crear mascota, por favor intente de nuevo.",
      });
    }
  };

  return (
    <div className="crear-mascota-contenedor-dashboard">
      <div className="crear-mascota-contenido-principal">
        <h1 className="crear-mascota-titulo">Crear Mascota</h1>
        {error && (
          <p className="crear-mascota-error" style={{ color: "red" }}>
            {error}
          </p>
        )}
        <div className="crear-mascota-contenedor-formulario">
          <form className="crear-mascota-form" onSubmit={handleSubmit}>
            <div className="crear-mascota-mb-3">
              <label htmlFor="nombreM" className="crear-mascota-form-label">
                Nombre de Mascota:
              </label>
              <input
                type="text"
                className="crear-mascota-form-control"
                id="nombreM"
                name="nombreM"
                value={formData.nombreM}
                onChange={handleChange}
                required
              />
            </div>

            <div className="crear-mascota-mb-3">
              <label htmlFor="especieM" className="crear-mascota-form-label">
                Especie:
              </label>
              <select
                className="crear-mascota-form-select"
                id="especieM"
                name="especieM"
                value={formData.especieM}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Seleccione una especie
                </option>
                {especies.map((especie) => (
                  <option key={especie.id} value={especie.id}>
                    {especie.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="crear-mascota-mb-3">
              <label htmlFor="razaM" className="crear-mascota-form-label">
                Raza:
              </label>
              <select
                className="crear-mascota-form-select"
                id="razaM"
                name="razaM"
                value={formData.razaM}
                onChange={handleChange}
                required
                disabled={!razas.length}
              >
                <option value="" disabled>
                  Seleccione una raza
                </option>
                {razas.map((raza) => (
                  <option key={raza.id} value={raza.id}>
                    {raza.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="crear-mascota-mb-3">
              <label
                htmlFor="fechaNacimiento"
                className="crear-mascota-form-label"
              >
                Fecha de Nacimiento:
              </label>
              <input
                type="date"
                className="crear-mascota-form-control"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                max={fechaActual}
                required
              />
            </div>

            <div className="crear-mascota-mb-3">
              <label htmlFor="n_documento" className="crear-mascota-form-label">
                Tutor a Asignar:
              </label>
              <input
                type="text"
                className="crear-mascota-form-control"
                id="n_documento"
                name="n_documento"
                placeholder="Número de documento del tutor"
                value={formData.n_documento}
                onChange={handleChange}
                required
              />
            </div>

            <div className="crear-mascota-mb-3">
              <button type="submit" className="crear-mascota-btn-primary">
                Crear Mascota
              </button>
            </div>
          </form>
          <div className="crear-mascota-btn-secondary-wrapper">
            <Link to="/Mascotas" className="crear-mascota-btn-secondary">
              Regresar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearMascota;
