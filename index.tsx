import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("Iniciando aplicación...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("No se encontró el elemento root");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Renderizado inicial completado.");
} catch (error) {
  console.error("Error fatal al renderizar la app:", error);
}