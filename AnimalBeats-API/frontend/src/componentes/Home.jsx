import React from 'react'
import { useNavigate } from 'react-router-dom';
import '../css/home.css'

const Home = () => {
  const navigate = useNavigate()

  return (
    <div>
      {/* Navbar fijo */}
      <div className="ab-menu">
        <div className="ab-menu-logo">
          <img src="./public/img/logo.png" alt="Logo AnimalBeats" />
        </div>
        <div className="ab-menu-buttons">
          <button onClick={() => navigate('/#menu')}>INICIO</button>
          <button id="contact-btn">CONTACTENOS</button>
          <button className="ab-btn-login" onClick={() => navigate('/login')}>LOGIN</button>
          <button className="ab-btn-register" onClick={() => navigate('/registro')}>REGISTRARSE</button>
        </div>
      </div>

      {/* Slider de publicidad */}
      <div className="ab-slider">
        <ul>
          <li>
            <img src="./public/img/banner_perro.jpg" alt="Perro feliz en veterinaria" />
            <div className="ab-slide-text1">
              <h2>Cuidando de tus mascotas, nuestra pasión sin límites.</h2>
              <p>En nuestra veterinaria, tu mascota es parte de nuestra familia...</p>
            </div>
          </li>
          <li>
            <img src="./public/img/banner_perrogato.png" alt="Perro y gato juntos" />
            <div className="ab-slide-text2">
              <h2>Salud y felicidad, juntos en cada latido.</h2>
              <p>Creemos que cada latido cuenta. Ofrecemos servicios...</p>
            </div>
          </li>
          <li>
            <img src="./public/img/banner_gato.jpg" alt="Gato recibiendo cuidado" />
            <div className="ab-slide-text3">
              <h2>Juntos por la salud y alegría de tus compañeros peludos.</h2>
              <p>La salud de tus mascotas es una responsabilidad compartida...</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Información de servicios */}
      <section className="ab-info">
        <div className="ab-info-main">
          <nav><h1>¿Qué ofrecemos?</h1></nav>
          <p>En AnimalBeats, nos dedicamos a brindar el mejor cuidado...</p>
        </div>

        <div className="ab-service-1">
          <nav><h1>Medicina Preventiva</h1></nav>
          <p>La prevención es clave para mantener a tu mascota saludable...</p>
        </div>

        <div className="ab-service-2">
          <nav><h1>Consulta y Diagnóstico</h1></nav>
          <p>Realizamos evaluaciones clínicas exhaustivas...</p>
        </div>

        <div className="ab-service-3">
          <nav><h1>Peluquería y Estética</h1></nav>
          <p>Mantenemos a tus mascotas limpias y bien cuidadas...</p>
        </div>

        <div className="ab-service-4">
          <nav><h1>Transporte y Guardería</h1></nav>
          <p>Ofrecemos servicios seguros de transporte...</p>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="ab-footer-help">
          <div className="ab-footer-buttons">
            <button className="btn btn-danger mb-2" data-bs-toggle="offcanvas" data-bs-target="#ubicacionSidebar">
              ¿Dónde nos ubicamos?
            </button>
            <button className="btn btn-danger mb-2" data-bs-toggle="offcanvas" data-bs-target="#horariosSidebar">
              Horarios de atención
            </button>
            <button className="btn btn-danger mb-2" data-bs-toggle="offcanvas" data-bs-target="#ayudaSidebar">
              ¿Qué podemos ayudarte?
            </button>
          </div>
        </div>

        {/* Offcanvas Ubicación */}
        <div className="offcanvas offcanvas-end" tabIndex="-1" id="ubicacionSidebar">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">¿Dónde nos ubicamos?</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
          </div>
          <div className="offcanvas-body">
            <iframe
              title="Ubicación Clínica Veterinaria"
              src="https://www.google.com/maps/embed?pb=..."
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
            <p className="mt-3">En esta dirección puedes encontrarnos de manera sencilla.</p>
          </div>
        </div>

        {/* Offcanvas Horarios */}
        <div className="offcanvas offcanvas-end" tabIndex="-1" id="horariosSidebar">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">Horarios de atención</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
          </div>
          <div className="offcanvas-body">
            <p>
              Lunes a Domingo: <strong>Abierto 24 horas</strong><br />
              Nuestros horarios de atención siempre están a la orden de nuestros clientes.
            </p>
          </div>
        </div>

        {/* Offcanvas Ayuda */}
        <div className="offcanvas offcanvas-end" tabIndex="-1" id="ayudaSidebar">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">¿Qué podemos ayudarte?</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
          </div>
          <div className="offcanvas-body">
            <img
              src="./public/img/medicos-cuidadosos-alto-angulo-que-ayudan-al-perro-enfermo_23-2148302253.avif"
              alt="Veterinarios ayudando a un perro"
              className="img-fluid mb-3"
            />
            <p>
              En nuestra veterinaria puedes encontrar servicios como:<br />
              <b>Consulta General, Urgencias, Baños, Peluquerías, Vacunaciones, Cardiología y Nutricionista</b>.<br />
              También afiliamiento de usuarios en nuestra base de datos junto a tus mascotas.
            </p>
          </div>
        </div>

        <p>2025 AnimalBeats. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default Home
