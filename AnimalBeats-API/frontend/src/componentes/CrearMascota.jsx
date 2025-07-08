import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../css/CrearMascota.css";

const CrearMascota = () => {
  const [especies, setEspecies] = useState([]);
  const [razas, setRazas] = useState([]);
  const [idEspecieSeleccionada, setIdEspecieSeleccionada] = useState("");
  const [formData, setFormData] = useState({
    nombreM: "",
    especieM: "",
    razaM: "",
    edadM: "",
    n_documento: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerEspecies = async () => {
      try {
        const respuesta = await axios.get("http://localhost:3000/Especies/Listado");
        const datos = respuesta.data;

        if (typeof datos === "string") {
          setEspecies([]);
          setError(datos);
        } else {
          setEspecies(datos);
          setError(null);
        }
      } catch (error) {
        setError("Error al conectar con el servidor");
        console.error(error);
      }
    };
    obtenerEspecies();
  }, []);

  useEffect(() => {
    if (!idEspecieSeleccionada) {
      setRazas([]);
      setFormData((prev) => ({ ...prev, razaM: "" }));
      return;
    }
    const obtenerRazas = async () => {
      try {
        const respuesta = await axios.get(
          `http://localhost:3000/Razas/Listado/${idEspecieSeleccionada}`
        );
        const datos = respuesta.data;

        if (typeof datos === "string") {
          setRazas([]);
          setError(datos);
        } else if (Array.isArray(datos)) {
          const datosNormalizados = datos.map((item) => ({
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
          setError("Datos recibidos en formato inesperado");
        }
      } catch (error) {
        setError("Error al conectar con el servidor");
        console.error(error);
      }
    };
    obtenerRazas();
  }, [idEspecieSeleccionada]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "especieM") {
      setIdEspecieSeleccionada(value);
      setFormData((prev) => ({ ...prev, razaM: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Mapea formData a la estructura que espera el backend
    const mascotaData = {
      nombre: formData.nombreM,
      id_especie: formData.especieM,
      id_raza: formData.razaM,
      fecha_nacimiento: formData.edadM,
      id_cliente: formData.n_documento,
      estado: "activo",
    };

    try {
      await axios.post("http://localhost:3000/Mascotas/Registro", mascotaData);

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
                    {especie.Especie}
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
                    {raza.Raza}
                  </option>
                ))}
              </select>
            </div>

            <div className="crear-mascota-mb-3">
              <label htmlFor="edadM" className="crear-mascota-form-label">
                Fecha de Nacimiento:
              </label>
              <input
                type="date"
                className="crear-mascota-form-control"
                id="edadM"
                name="edadM"
                value={formData.edadM}
                onChange={handleChange}
                required
              />
            </div>

            <div className="crear-mascota-mb-3">
              <label htmlFor="n_documento" className="crear-mascota-form-label">
                Dueño a Asignar:
              </label>
              <input
                type="text"
                className="crear-mascota-form-control"
                id="n_documento"
                name="n_documento"
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

