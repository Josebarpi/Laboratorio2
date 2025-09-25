import React, { useEffect, useState } from "react";
import * as API from "../services/data";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [currentAlumno, setCurrentAlumno] = useState({
    id: null,
    dni: "",
    nombre: "",
    direccion: "",
    edad: "",
    email: "",
    asignaturaId: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const usuario = localStorage.getItem("usuario");

  const columnasDisponibles = [
    { key: "id", label: "ID" },
    { key: "dni", label: "DNI" },
    { key: "nombre", label: "Nombre" },
    { key: "direccion", label: "Dirección" },
    { key: "edad", label: "Edad" },
    { key: "email", label: "Email" },
    { key: "asignatura", label: "Asignatura" }
  ];

  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(
    columnasDisponibles.map(c => c.key)
  );



const fetchAlumnos = () => {
  setLoading(true);
  API.alumnoProfesor(usuario)
    .then(data => {
      setAlumnos(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
};

  const fetchAsignaturas = () => {
    API.getAsignaturas()
      .then(data => setAsignaturas(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (usuario) {
      fetchAlumnos();
      fetchAsignaturas();
    }
  }, [usuario]);

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
  });
  
  const handleAgregar = () => {
    setCurrentAlumno({
      id: null,
      dni: "",
      nombre: "",
      direccion: "",
      edad: "",
      email: "",
      asignaturaId: ""
    });
    setModalOpen(true);
  };

  const handleEditar = alumno => {
    setCurrentAlumno({
      id: alumno.id,
      dni: alumno.dni,
      nombre: alumno.nombre,
      direccion: alumno.direccion,
      edad: alumno.edad,
      email: alumno.email,
      asignaturaId: alumno.asignaturaId || ""
    });
    setModalOpen(true);
  };

  const handleEliminar = id => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(result => {
      if (result.isConfirmed) {
        API.eliminarAlumno(id).then(() => {
          Swal.fire("Eliminado", "El alumno fue eliminado", "success");
          fetchAlumnos();
        });
      }
    });
  };

  const handleModalSubmit = e => {
    e.preventDefault();
    const { id, dni, nombre, direccion, edad, email, asignaturaId } = currentAlumno;

    if (!dni || !nombre || !asignaturaId) {
      Swal.fire("Error", "DNI, Nombre y Asignatura son obligatorios", "warning");
      return;
    }

    if (id) {
      API.actualizarAlumno(currentAlumno)
        .then(() => {
          setModalOpen(false);
          fetchAlumnos();
          Toast.fire({ icon: "success", title: "Alumno actualizado correctamente" });
        })
        .catch(err => Swal.fire("Error", err.message, "error"));
    } else {
      API.insertarAlumnoMatricular(currentAlumno, asignaturaId)
        .then(() => {
          setModalOpen(false);
          fetchAlumnos();
          Toast.fire({ icon: "success", title: "Alumno insertado y matriculado" });
        })
        .catch(err => Swal.fire("Error", err.message, "error"));
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAlumnos = alumnos.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(alumnos.length / itemsPerPage);

  const handleExport = type => {
    const dataToExport = alumnos.map(al =>
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
      XLSX.writeFile(wb, "Alumnos.xlsx");
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

      doc.save("Alumnos.pdf");
    }

    setIsColumnsModalOpen(false);
  };

  const toggleColumn = key => {
    setSelectedColumns(prev =>
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  return (
    <div className="container mt-4">
      {/* Botones y título */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Alumnos</h4>
        <div>
          <button className="btn btn-success me-2" onClick={handleAgregar}>Agregar Alumno</button>
          <button className="btn btn-secondary" onClick={() => setIsColumnsModalOpen(true)}>Exportar</button>
        </div>
      </div>

      {loading && <div className="text-center">Cargando...</div>}

      {!loading && (
        <table className="table table-striped table-hover table-bordered">
          <thead className="table-dark">
            <tr>
              {columnasDisponibles.map(col => <th key={col.key}>{col.label}</th>)}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentAlumnos.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.dni}</td>
                <td>{a.nombre}</td>
                <td>{a.direccion}</td>
                <td>{a.edad}</td>
                <td>{a.email}</td>
                <td>{a.asignatura}</td>
                <td>
                  <button className="btn btn-primary btn-sm me-2" onClick={() => handleEditar(a)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(a.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginación */}
      <nav>
        <ul className="pagination justify-content-center">
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Modal agregar/editar */}
      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleModalSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{currentAlumno.id ? "Editar Alumno" : "Agregar Alumno"}</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label>DNI</label>
                  <input type="text" className="form-control" value={currentAlumno.dni} 
                    onChange={e => setCurrentAlumno({...currentAlumno, dni: e.target.value})} required />
                </div>

                <div className="mb-3">
                  <label>Nombre</label>
                  <input type="text" className="form-control" value={currentAlumno.nombre} 
                    onChange={e => setCurrentAlumno({...currentAlumno, nombre: e.target.value})} required />
                </div>

                <div className="mb-3">
                  <label>Dirección</label>
                  <input type="text" className="form-control" value={currentAlumno.direccion} 
                    onChange={e => setCurrentAlumno({...currentAlumno, direccion: e.target.value})} />
                </div>

                <div className="mb-3">
                  <label>Edad</label>
                  <input type="number" className="form-control" value={currentAlumno.edad} 
                    onChange={e => setCurrentAlumno({...currentAlumno, edad: e.target.value})} />
                </div>

                <div className="mb-3">
                  <label>Email</label>
                  <input type="email" className="form-control" value={currentAlumno.email} 
                    onChange={e => setCurrentAlumno({...currentAlumno, email: e.target.value})} />
                </div>

                <div className="mb-3">
                  <label>Asignatura</label>
                  <select className="form-select" value={currentAlumno.asignaturaId} 
                    onChange={e => setCurrentAlumno({...currentAlumno, asignaturaId: e.target.value})} required>
                    <option value="">Seleccione una asignatura</option>
                    {asignaturas.map(a => (
                      <option key={a.id} value={a.id}>{a.id} - {a.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal exportar */}
      {isColumnsModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Selecciona columnas para exportar</h5>
                <button type="button" className="btn-close" onClick={() => setIsColumnsModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                {columnasDisponibles.map(col => (
                  <div key={col.key} className="form-check mb-2">
                    <input type="checkbox" className="form-check-input" checked={selectedColumns.includes(col.key)} 
                      onChange={() => toggleColumn(col.key)} id={col.key} />
                    <label className="form-check-label" htmlFor={col.key}>{col.label}</label>
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={() => handleExport("excel")}>Exportar Excel</button>
                <button className="btn btn-danger" onClick={() => handleExport("pdf")}>Exportar PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
