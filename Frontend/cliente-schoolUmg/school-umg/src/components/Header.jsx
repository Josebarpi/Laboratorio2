import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoUMG from "../assets/logoUMG.png";

export function Header() {
  const navigate = useNavigate();

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('usuario'); // Elimina usuario del localStorage
    navigate('/'); // Redirige al login
  };

  return (
    <header className="navbar navbar-dark bg-primary px-3 fixed-top d-flex justify-content-between">
      {/* Contenedor para logo y título */}
      <div className="d-flex align-items-center">
        <img
          src={logoUMG}
          alt="Logo UMG"
          style={{
            width: '40px',
            height: '40px',
            marginRight: '10px',
            objectFit: 'contain'
          }}
        />
        <h5 className="text-white mb-0">Sistema UMG</h5>
      </div>

      {/* Botón de cerrar sesión */}
      <button className="btn btn-light" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </header>
  );
}
