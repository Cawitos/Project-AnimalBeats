import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/home.css";

const BASE_URL = "https://animalbeats-api.onrender.com";

export default function IndexPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <header>
        <div className="header-container">
          <div className="header-left">
            <img src="/Img/logo-corto.png" alt="Logo" />
            <h1>AnimalBeats</h1>
          </div>
          <div className="header-right">
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/registro")}>Registro</button>
          </div>
        </div>
      </header>

      <main className="container main-content">
        <ImageSlider />
        <div className="grid-cards">
          <CardTestimonios />
          <CardTips />
          <CardCuriosidades />
        </div>

        <VeterinariosPreview />
      </main>

      <footer>
        <p>Contacto: contacto@animalbeats.com</p>
        <p>© 2025 AnimalBeats - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

/* ---------------- SLIDER ---------------- */
function ImageSlider() {
  const images = [
    "/Img/banner_gato.jpg",
    "/Img/banner_perro.jpg",
    "/Img/banner_perrogato.png",
    "/Img/patitas.png",
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, 3000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <>
      <div className="slider-container">
        <img src={images[current]} alt="slide" />
      </div>
      <div className="slider-dots">
        {images.map((_, i) => (
          <div key={i} className={current === i ? "active" : ""}></div>
        ))}
      </div>
    </>
  );
}

/* ---------------- CARD 1: TESTIMONIOS ---------------- */
function CardTestimonios() {
  const testimonios = [
    {
      nombre: "Ana y Rocky 🐶",
      comentario: "Gracias a AnimalBeats nunca olvido las vacunas de mi perro.",
    },
    {
      nombre: "Carlos y Michi 🐱",
      comentario: "El sistema me recuerda las citas al instante, muy útil.",
    },
    {
      nombre: "Lucía y Toby 🐾",
      comentario: "Ahora llevo el historial de mi mascota en un solo lugar.",
    },
  ];
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % testimonios.length);

  const t = testimonios[index];
  return (
    <div className="card">
      <h3>{t.nombre}</h3>
      <p>{t.comentario}</p>
      <button onClick={next} className="btn-more">
        Ver otro
      </button>
    </div>
  );
}

/* ---------------- CARD 2: TIPS (QUIZ) ---------------- */
function CardTips() {
  const pregunta = {
    texto: "¿Cada cuánto debo vacunar a mi perro cachorro?",
    opciones: [
      { texto: "Cada 3 meses", correcta: false },
      { texto: "Cada 21 días", correcta: true },
      { texto: "Una vez al año", correcta: false },
    ],
  };

  const validar = (correcta) => {
    alert(
      correcta
        ? "¡Correcto! Los cachorros deben vacunarse cada 21 días."
        : "Ups… revisa el calendario de vacunación recomendado."
    );
  };

  return (
    <div className="card">
      <h3>{pregunta.texto}</h3>
      {pregunta.opciones.map((op, i) => (
        <button
          key={i}
          className="btn-more"
          onClick={() => validar(op.correcta)}
        >
          {op.texto}
        </button>
      ))}
    </div>
  );
}

/* ---------------- CARD 3: CURIOSIDADES ---------------- */
function CardCuriosidades() {
  const curiosidades = [
    "Los perros tienen un olfato 40 veces más sensible que el humano 🐕.",
    "Los gatos pueden saltar hasta 6 veces su altura 🐱.",
    "Un hámster puede correr hasta 8 km en una sola noche 🐹.",
  ];
  const [show, setShow] = useState(true);
  const [idx, setIdx] = useState(0);

  const flip = () => {
    setShow((s) => !s);
    if (show) setIdx((i) => (i + 1) % curiosidades.length);
  };

  return (
    <div className="card flip-card" onClick={flip}>
      {show ? (
        <p>Toca para ver una curiosidad 🐾</p>
      ) : (
        <p>{curiosidades[idx]}</p>
      )}
    </div>
  );
}

/* ----------- VETERINARIOS DESDE API ----------- */
function VeterinariosPreview() {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVet, setSelectedVet] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/veterinarios`)
      .then((r) => r.json())
      .then((data) => {
        setVets(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando veterinarios...</p>;
  if (!vets.length) return <p>No hay veterinarios registrados aún.</p>;

  return (
    <section className="vet-section">
      <h2 className="vet-title">Nuestros Veterinarios</h2>
      <div className="vet-grid">
        {vets.map((vet) => (
          <div className="card vet-card" key={vet.id}>
            {vet.imagen_url ? (
              <img src={vet.imagen_url} alt={vet.nombre_completo} />
            ) : (
              <div className="no-photo">👩‍⚕️</div>
            )}
            <h3>{vet.nombre_completo}</h3>
            <p>Especialidad: {vet.estudios_especialidad || "N/A"}</p>
            <button
              className="btn-more"
              onClick={() => setSelectedVet(vet)}
            >
              Ver más
            </button>
          </div>
        ))}
      </div>

      {selectedVet && (
        <ModalVeterinario
          vet={selectedVet}
          onClose={() => setSelectedVet(null)}
        />
      )}
    </section>
  );
}

function ModalVeterinario({ vet, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        {vet.imagen_url ? (
          <img src={vet.imagen_url} alt={vet.nombre_completo} />
        ) : (
          <div className="no-photo large">👩‍⚕️</div>
        )}
        <h3>{vet.nombre_completo}</h3>
        <p><strong>Edad:</strong> {vet.edad ?? "N/A"}</p>
        <p><strong>Altura:</strong> {vet.altura ?? "N/A"} m</p>
        <p><strong>Experiencia:</strong> {vet.anios_experiencia ?? "N/A"} años</p>
        <p><strong>Especialidad:</strong> {vet.estudios_especialidad || "N/A"}</p>
      </div>
    </div>
  );
}
