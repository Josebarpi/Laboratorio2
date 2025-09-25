import React from 'react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white text-center py-3 mt-auto">
      &copy; {year} Sistema UMG. Todos los derechos reservados.
    </footer>
  );
}
