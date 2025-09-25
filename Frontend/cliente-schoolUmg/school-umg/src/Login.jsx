import React, { useState } from "react";
import * as API from "./services/data.js";
import imagen from "./assets/login.png";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function Login() {
  // Estado para almacenar los valores de usuario y contraseña
  const [teacher, setTeacher] = useState({ usuario: "", password: "" });
  const navigate = useNavigate(); // Hook de React Router para redirigir a otra ruta

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeacher((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    const form = e.target;

    // Validación de Bootstrap: si el formulario no es válido, muestra mensajes de error
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    try {
      // Llama a la función login de la API con los valores ingresados
      const response = await API.login(teacher.usuario, teacher.password);

      if (response) {
        // Si el login es exitoso, guardamos el usuario en localStorage
        localStorage.setItem("usuario", teacher.usuario);
        // Redirige al Dashboard
        navigate("/dashboard");
      } else {
        // Si las credenciales son incorrectas, muestra un SweetAlert
        Swal.fire({
          icon: "error",
          title: "Credenciales incorrectas",
          text: "Por favor verifica tu usuario y contraseña",
        });
      }
    } catch (error) {
      // Captura errores de conexión o de la API
      Swal.fire({
        icon: "error",
        title: "Error en la autenticación",
        text: error.message || "Ocurrió un error desconocido",
      });
    }
  };

 return (
  // Contenedor principal centrado y con fondo oscuro
  <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-dark">
    {/* Tarjeta blanca que contiene el formulario */}
    <div
      className="card shadow-lg p-4 bg-white"
      style={{ maxWidth: '420px', width: '100%', borderRadius: '12px' }}
    >
      {/* Encabezado del formulario: logo y título */}
      <div className="text-center mb-3">
        <img
          src={imagen}
          alt="Login"
          className="img-fluid mb-2"
          style={{ width: '90px', height: '90px', objectFit: 'contain' }}
        />
        <h2 className="h5 mb-0">Iniciar Sesión</h2>
      </div>

      {/* Formulario de login */}
      <form
        id="formulario"
        onSubmit={handleSubmit}
        noValidate
        className="needs-validation"
      >
        {/* Campo de usuario */}
        <div className="mb-3">
          <label htmlFor="usuario" className="form-label">
            Usuario:
          </label>
          <input
            type="text"
            id="usuario"
            className="form-control"
            value={teacher.usuario}
            onChange={(e) =>
              setTeacher({ ...teacher, usuario: e.target.value })
            }
            autoComplete="username"
            required
          />
          <div className="invalid-feedback">
            El usuario es obligatorio.
          </div>
        </div>

        {/* Campo de contraseña */}
        <div className="mb-3">
          <label htmlFor="pass" className="form-label">
            Contraseña:
          </label>
          <input
            type="password"
            id="pass"
            className="form-control"
            value={teacher.password}
            onChange={(e) =>
              setTeacher({ ...teacher, password: e.target.value })
            }
            autoComplete="current-password"
            required
          />
          <div className="invalid-feedback">
            La contraseña es obligatoria.
          </div>
        </div>

        {/* Botón de enviar formulario */}
        <button type="submit" id="enviar" className="btn btn-primary w-100">
          Ingresar
        </button>
      </form>
    </div>
  </div>
);

  
}


