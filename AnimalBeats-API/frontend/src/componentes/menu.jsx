import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import '../css/menu.css';

export default function OffcanvasMenu() {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const navigate = useNavigate();
  const { User, setUser } = useContext(UserContext);

  const handleNavigate = (path) => {
    if (path) {
      navigate(path);
    } else {
      if (User.rol === 1) {
        navigate('/admin');
      } else if (User.rol === 3) {
        navigate('/veterinario');
      } else {
        navigate('/cliente');
      }
    }
    setShowOffcanvas(false);
  };

  const handleLogout = () => {
    setUser(null);
    handleNavigate('/');
  };

  return (
    <div className="container-fluid">
      <button
        className="navbar-toggler"
        type="button"
        onClick={() => setShowOffcanvas(!showOffcanvas)}
        aria-controls="offcanvasNavbar"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>MENU
      </button>

      <div
        className={`offcanvas offcanvas-start ${showOffcanvas ? 'show' : ''}`}
        tabIndex="-1"
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
        style={{ visibility: showOffcanvas ? 'visible' : 'hidden' }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
            <button
              className="btn btn-link animalbeats p-0"
              onClick={() => handleNavigate()}
            >
              <span className="nav-logo">AnimalBeats</span>
            </button>
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowOffcanvas(false)}
            aria-label="Close"
          ></button>
        </div>

        <div className="offcanvas-body">
          <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
            {User && User.rol === 1 && (
              <li className="nav-item dropdown">
                <Dropdown
                  title="Gestion de usuarios"
                  links={[
                    { path: '/gestionusuarios', label: 'Usuarios' },
                    { path: '/estados-roles', label: 'Roles' },
                    { path: '/veterinarios', label: 'Veterinarios' },
                  ]}
                  onLinkClick={handleNavigate}
                />
              </li>
            )}

            <li className="nav-item dropdown">
              <Dropdown
                title="Gestion de Mascotas"
                links={[
                  { path: '/Mascotas', label: 'Mascotas' },
                  { path: '/Especies', label: 'Especies y Razas' },
                  { path: '/gestion_enfermedades', label: 'Enfermedades' },
                  { path: '/gestion_citas', label: 'Citas' },
                ]}
                onLinkClick={handleNavigate}
              />
            </li>

            {User?.rol !== 2 && (
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => handleNavigate('/recordatorios')}
                >
                  Recordatorios
                </button>
              </li>
            )}

            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={handleLogout}
              >
                Salir
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Dropdown({ title, links, onLinkClick }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="nav-link dropdown-toggle btn btn-link"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        type="button"
      >
        {title}
      </button>
      <ul className={`dropdown-menu${open ? ' show' : ''}`}>
        {links.map(({ path, label }, i) => (
          <li key={i}>
            <button
              className="dropdown-item btn btn-link"
              onClick={() => {
                onLinkClick(path);
                setOpen(false);
              }}
            >
              {label}
            </button>
            {i < links.length - 1 && <hr className="dropdown-divider" />}
          </li>
        ))}
      </ul>
    </>
  );
}
