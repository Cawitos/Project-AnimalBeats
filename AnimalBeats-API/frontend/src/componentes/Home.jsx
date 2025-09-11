import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/home.css";

// ================= COMPONENTE PRINCIPAL =================
export default function IndexPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* ================= HEADER ================= */}
      <header>
        <div className="header-container">
          {/* LOGO IZQUIERDA */}
          <div className="header-left">
            <img src="../Img/logo-corto.png" alt="Logo" />
            <h1>AnimalBeats</h1>
          </div>

          <div className="header-right">
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/registro")}>Registro</button>
          </div>
        </div>
      </header>

      {/* ================= CONTENIDO ================= */}
      <main className="container main-content">
        {/* SLIDER */}
        <ImageSlider />

        {/* GRID DE CARDS */}
        <div className="grid-cards">
          <CardServicios />
          <CardImportancia />
          <CardNovedades />
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer>
        <p>Contacto: contacto@animalbeats.com</p>
        <p>© 2025 AnimalBeats - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

// ================== CARDS ==================
function CardServicios() {
  return (
    <div className="card">
      <img src="../Img/siberiano.jpg" alt="Servicios" />
      <h3>Servicios</h3>
      <p>
        Agenda de citas, recordatorios de vacunas, historial de mascotas y
        alertas automáticas para veterinarios.
      </p>
    </div>
  );
}

function CardImportancia() {
  return (
    <div className="card">
      <h3>Importancia del proyecto</h3>
      <p>
        AnimalBeats es un sistema administrativo para las veterinarias, el
        impacto que tiene es llevar un mejor orden en los clientes y mascotas
        que interactúan con la veterinaria.
      </p>
    </div>
  );
}

function CardNovedades() {
  return (
    <div className="card">
      <h3>Novedades</h3>
      <p>
        Próximas funciones, eventos, lanzamientos o testimonios. Podemos cambiar
        esta card cuando lo definas.
      </p>
    </div>
  );
}

// ================== SLIDER ==================
function ImageSlider() {
  const images = [
    "../Img/banner_gato.jpg",
    "../Img/banner_perro.jpg",
    "../Img/banner_perrogato.png",
    "../Img/patitas.png"
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="slider-container">
      <img src={images[current]} alt="slide" />

      <div className="slider-dots">
        {images.map((_, index) => (
          <div
            key={index}
            className={current === index ? "active" : ""}
          ></div>
        ))}
      </div>
    </div>
  );
}
