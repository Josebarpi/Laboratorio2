import React, { useEffect, useState } from "react";
import * as API from "../services/data"; // tus funciones GET/POST/PUT/DELETE
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export function Profesores() {
  const [profesores, setProfesores] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [modalOpen, setModalOpen] = useState(false); 
  const [currentProfesor, setCurrentProfesor] = useState({
    usuario: "",
    pass: "",
    nombre: "",
    email: "",
  });

  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 10;

  const columnasDisponibles = [
    { key: "usuario", label: "Usuario" },
    { key: "pass", label: "Contraseña" },
    { key: "nombre", label: "Nombre" },
    { key: "email", label: "Email" },
  ];

  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false); 
  const [selectedColumns, setSelectedColumns] = useState(
    columnasDisponibles.map((c) => c.key)
  );

  // --- Fetch Profesores ---
  const fetchProfesores = () => {
    setLoading(true);
    API.getProfesores()
      .then((data) => {
        setProfesores(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  // --- Toast (SweetAlert2) ---
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });

  // --- Modal Agregar ---
  const handleAgregar = () => {
    setCurrentProfesor({
      usuario: "",
      pass: "",
      nombre: "",
      email: "",
    });
    setModalOpen(true);
  };

  // --- Modal Editar ---
  const handleEditar = (profesor) => {
    setCurrentProfesor({ ...profesor });
    setModalOpen(true);
  };

  // --- Eliminar ---
  const handleEliminar = (usuario) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        API.eliminarProfesor(usuario)
          .then(() => {
            Swal.fire("Eliminado", "El profesor fue eliminado", "success");
            fetchProfesores();
          })
          .catch((err) => Swal.fire("Error", err.message, "error"));
      }
    });
  };

  // --- Guardar Modal (Insertar o Actualizar) ---
  const handleModalSubmit = (e) => {
    e.preventDefault();
    const { usuario, nombre } = currentProfesor;

    if (!usuario || !nombre) {
      Swal.fire("Error", "Usuario y Nombre son obligatorios", "warning");
      return;
    }

    if (profesores.some((p) => p.usuario === usuario)) {
      // Actualizar
      API.actualizarProfesor(usuario, currentProfesor)
        .then(() => {
          setModalOpen(false);
          fetchProfesores();
          Toast.fire({ icon: "success", title: "Profesor actualizado correctamente" });
        })
        .catch((err) => Swal.fire("Error", err.message, "error"));
    } else {
      // Insertar
      API.insertarProfesor(currentProfesor)
        .then(() => {
          setModalOpen(false);
          fetchProfesores();
          Toast.fire({ icon: "success", title: "Profesor insertado correctamente" });
        })
        .catch((err) => Swal.fire("Error", err.message, "error"));
    }
  };

  // --- useEffect para cargar profesores al inicio ---
  useEffect(() => {
    fetchProfesores();
  }, []);

  // --- Paginación ---
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProfesores = profesores.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(profesores.length / itemsPerPage);



  const handleExport = type => {
    const dataToExport = profesores.map(al =>
      selectedColumns.reduce((obj, key) => {
        obj[key] = al[key] ?? "";
        return obj;
      }, {})
    );

    if (!dataToExport.length) {
      Swal.fire("Aviso", "No hay datos para exportar", "info");
      return;
    }

    if (type === "excel") {
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Alumnos");
      XLSX.writeFile(wb, "Profesores.xlsx");
    } else {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Listado de Alumnos", 14, 20);

      const head = columnasDisponibles
        .filter(c => selectedColumns.includes(c.key))
        .map(c => c.label);

      const body = dataToExport.map(a =>
        selectedColumns.map(key => String(a[key] ?? ""))
      );

      autoTable(doc, {
        head: [head],
        body,
        startY: 30,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      doc.save("Profesores.pdf");
    }

    setIsColumnsModalOpen(false);
  };

  // --- Selección de columnas ---
  const toggleColumn = (key) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  return (
    <>
      <div className="container mt-4">
        {/* Encabezado */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Profesores</h4>
          <div>
            <button className="btn btn-success me-2" onClick={handleAgregar}>
              Agregar Profesor
            </button>
            <button className="btn btn-secondary" onClick={() => setIsColumnsModalOpen(true)}>
              Exportar
            </button>
          </div>
        </div>

        {/* Cargando */}
        {loading && <div className="text-center">Cargando...</div>}

        {/* Tabla */}
        {!loading && (
          <table className="table table-striped table-hover table-bordered">
            <thead className="table-dark">
              <tr>
                {columnasDisponibles.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentProfesores.map((p) => (
                <tr key={p.usuario}>
                  <td>{p.usuario}</td>
                  <td>{p.pass}</td>
                  <td>{p.nombre}</td>
                  <td>{p.email}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleEditar(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleEliminar(p.usuario)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Paginación */}
        <nav>
          <ul className="pagination justify-content-center">
            {Array.from({ length: totalPages }).map((_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Modal Agregar/Editar */}
      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleModalSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {currentProfesor.usuario ? "Editar Profesor" : "Agregar Profesor"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label>Usuario</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentProfesor.usuario}
                    onChange={(e) =>
                      setCurrentProfesor({ ...currentProfesor, usuario: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label>Contraseña</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentProfesor.pass}
                    onChange={(e) =>
                      setCurrentProfesor({ ...currentProfesor, pass: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label>Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentProfesor.nombre}
                    onChange={(e) =>
                      setCurrentProfesor({ ...currentProfesor, nombre: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={currentProfesor.email}
                    onChange={(e) =>
                      setCurrentProfesor({ ...currentProfesor, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal columnas */}
      {isColumnsModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Selecciona columnas para exportar</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsColumnsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                {columnasDisponibles.map((col) => (
                  <div key={col.key} className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedColumns.includes(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      id={col.key}
                    />
                    <label className="form-check-label" htmlFor={col.key}>
                      {col.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={() => handleExport("excel")}
                >
                  Exportar Excel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleExport("pdf")}
                >
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
