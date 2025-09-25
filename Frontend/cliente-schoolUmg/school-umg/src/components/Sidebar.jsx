import React from 'react';
import { Link } from 'react-router-dom';

export function Sidebar() {
  return (
    <div
      className="bg-dark text-white vh-100 position-fixed"
      style={{ width: '200px', top: '56px' }}
    >
      <ul className="nav flex-column p-2">
        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/dashboard">
            Inicio
          </Link>
        </li>
         <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/dashboard/profesores">
            Profesores
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/dashboard/alumnos">
            Alumnos
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/dashboard/calificaciones">
            Calificaciones
          </Link>
        </li>
      </ul>
    </div>
  );
}
