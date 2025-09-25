import React from 'react';
import { Navigate } from 'react-router-dom';

export function PrivateRoute({ children }) {
  const usuario = localStorage.getItem('usuario'); // revisa si está logueado

  // Si no hay usuario, redirige al login
  if (!usuario) {
    return <Navigate to="/" />;
  }

  // Si hay usuario, renderiza los children
  return children;
}
