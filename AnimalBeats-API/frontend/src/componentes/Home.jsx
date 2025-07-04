import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login';
import Registro from './register';

const Home = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={ <Login setUser={setUser}/>} />
          <Route path="/register" element={ <Registro setUser={setUser}/>} />
        </Routes>
      </BrowserRouter>
      {/* Navbar fijo */}
      <div className="menu">
        <div className="c1">
          <img src="./public/img/logo.png" alt="Logo AnimalBeats" />
        </div>
        <div className="c2">
          <button onClick={() => navigate('/#menu')}>INICIO</button>
          <button id="contact-btn">CONTACTENOS</button>
          <button className="btn" onClick={() => navigate('/login')}>LOGIN</button>
          <button className="btn-registrarse" onClick={() => navigate('/register')}>REGISTRARSE</button>
        </div>
      </div>

      {/* Slider de publicidad */}
      <div className="publicidad">
        <ul>
          <li>
            <img src="./public/img/banner_perro.jpg" alt="Perro feliz en veterinaria" />
            <div className="texto1">
              <h2>Cuidando de tus mascotas, nuestra pasión sin límites.</h2>
              <p>En nuestra veterinaria, tu mascota es parte de nuestra familia...</p>
            </div>
          </li>
          <li>
            <img src="./public/img/banner_perrogato.png" alt="Perro y gato juntos" />
            <div className="texto2">
              <h2>Salud y felicidad, juntos en cada latido.</h2>
              <p>Creemos que cada latido cuenta. Ofrecemos servicios...</p>
            </div>
          </li>
          <li>
            <img src="./public/img/banner_gato.jpg" alt="Gato recibiendo cuidado" />
            <div className="texto3">
              <h2>Juntos por la salud y alegría de tus compañeros peludos.</h2>
              <p>La salud de tus mascotas es una responsabilidad compartida...</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Información de servicios */}
      <section className="informacion">
        <div className="servicios">
          <nav><h1>¿Qué ofrecemos?</h1></nav>
          <p>En AnimalBeats, nos dedicamos a brindar el mejor cuidado...</p>
        </div>

        <div className="s1">
          <nav><h1>Medicina Preventiva</h1></nav>
          <p>La prevención es clave para mantener a tu mascota saludable...</p>
        </div>

        <div className="s2">
          <nav><h1>Consulta y Diagnóstico</h1></nav>
          <p>Realizamos evaluaciones clínicas exhaustivas...</p>
        </div>

        <div className="s3">
          <nav><h1>Peluquería y Estética</h1></nav>
          <p>Mantenemos a tus mascotas limpias y bien cuidadas...</p>
        </div>

        <div className="s4">
          <nav><h1>Transporte y Guardería</h1></nav>
          <p>Ofrecemos servicios seguros de transporte...</p>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="atencion">
          <div className="botones-container">
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
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15904.316557121381!2d-74.0990538!3d4.7562667!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f845d48b9fd41%3A0x109fccc1ecd013dd!2sClinica%20Veterinaria%20Vetpoly!5e0!3m2!1ses-419!2sco!4v1733365569970!5m2!1ses-419!2sco"
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
