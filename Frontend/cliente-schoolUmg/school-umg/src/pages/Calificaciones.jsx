import React, { useEffect, useState } from "react";
import * as API from "../services/data";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function Calificaciones() {
    const [calificaciones, setCalificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [calificacionActual, setCalificacionActual] = useState({
        id: 0,
        descripcion: "",
        nota: 0,
        porcentaje: 0,       // <—
        matriculaId: 0,
        alumnoDni: "",
        alumnoNombre: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const profesorUsuario = localStorage.getItem("usuario");

    // columnas de exportación (SIN porcentaje)
    const columnasDisponibles = [
        { key: "id", label: "ID" },
        { key: "descripcion", label: "Descripción" },
        { key: "nota", label: "Nota" },
        { key: "porcentaje", label: "Porcentaje" },   // <—
        { key: "matriculaId", label: "Matrícula ID" },
        { key: "alumnoDni", label: "DNI Alumno" },
        { key: "alumnoNombre", label: "Nombre Alumno" },
    ];

    const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState(
        columnasDisponibles.map((c) => c.key)
    );

    const cargar = () => {
        setLoading(true);
        API.getCalificacionesProfesor(profesorUsuario)
            .then((data) => {
                setCalificaciones(data || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err?.message || String(err));
                setLoading(false);
            });
    };

    useEffect(() => {
        if (profesorUsuario) cargar();
    }, [profesorUsuario]);

    // convierte a número cuando corresponde
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCalificacionActual((prev) => ({
            ...prev,
            [name]: ["nota", "porcentaje", "matriculaId"].includes(name)
                ? Number(value)
                : value,
        }));
    };

    const abrirAgregar = () => {
        setModoEditar(false);
        setCalificacionActual({
            id: 0,
            descripcion: "",
            nota: 0,
            porcentaje: 0,   // se pide al crear
            matriculaId: 0,
            alumnoDni: "",
            alumnoNombre: "",
        });
        setShowModal(true);
    };

    const abrirEditar = (calif) => {
        setModoEditar(true);
        setCalificacionActual({
            ...calif,
            nota: Number(calif.nota ?? calif.Nota ?? 0),
            porcentaje: Number(calif.porcentaje ?? calif.Porcentaje ?? 0),  // <—
            matriculaId: Number(calif.matriculaId ?? calif.MatriculaId ?? calif.matriculadoId ?? 0),
        });
        setShowModal(true);
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!calificacionActual.descripcion || !calificacionActual.matriculaId) {
            Swal.fire("Error", "Descripción y Matrícula ID son obligatorios", "warning");
            return;
        }

        if (modoEditar) {
            // NO mandamos porcentaje en actualizar
            API.actualizarCalificacion(calificacionActual)
                .then(() => {
                    Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "success",
                        title: "Calificación actualizada",
                        showConfirmButton: false,
                        timer: 2000,
                    });
                    setShowModal(false);
                    cargar();
                })
                .catch((err) => {
                    console.error(err);
                    Swal.fire("Error", err.message || "Error al actualizar", "error");
                });
        } else {
            // Al crear, porcentaje sí es requerido
            if (calificacionActual.porcentaje === undefined || calificacionActual.porcentaje === null) {
                Swal.fire("Error", "El porcentaje es obligatorio al crear", "warning");
                return;
            }
            API.insertarCalificacion(calificacionActual)
                .then(() => {
                    Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "success",
                        title: "Calificación agregada",
                        showConfirmButton: false,
                        timer: 2000,
                    });
                    setShowModal(false);
                    cargar();
                })
                .catch((err) => {
                    console.error(err);
                    Swal.fire("Error", err.message || "Error al insertar", "error");
                });
        }
    };

    const handleEliminar = (id) => {
        Swal.fire({
            title: "¿Está seguro?",
            text: "No podrás revertir esto",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                API.eliminarCalificacion(id)
                    .then(() => {
                        Swal.fire({
                            toast: true,
                            position: "top-end",
                            icon: "success",
                            title: "Calificación eliminada",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                        setCalificaciones((prev) => prev.filter((c) => c.id !== id));
                    })
                    .catch((err) => {
                        console.error(err);
                        Swal.fire("Error", err.message || "No se pudo eliminar", "error");
                    });
            }
        });
    };

    // Exportación (ya no incluye porcentaje)
    const handleExport = (type) => {
        const dataToExport = calificaciones.map((c) =>
            selectedColumns.reduce((obj, key) => {
                obj[key] = c[key] ?? "";
                return obj;
            }, {})
        );

        if (dataToExport.length === 0) {
            Swal.fire("Atención", "No hay calificaciones para exportar", "info");
            return;
        }

        if (type === "excel") {
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Calificaciones");
            XLSX.writeFile(wb, "Calificaciones.xlsx");
        } else {
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text("Listado de Calificaciones", 14, 20);

            const head = columnasDisponibles
                .filter((c) => selectedColumns.includes(c.key))
                .map((c) => c.label);

            const body = dataToExport.map((c) =>
                selectedColumns.map((key) => String(c[key] ?? ""))
            );

            autoTable(doc, {
                head: [head],
                body,
                startY: 30,
                styles: { fontSize: 10 },
                headStyles: { fillColor: [41, 128, 185] },
            });

            doc.save("Calificaciones.pdf");
        }

        setIsColumnsModalOpen(false);
    };

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCalificaciones = calificaciones.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(calificaciones.length / itemsPerPage);

    if (loading) return <p>Cargando calificaciones...</p>;
    if (error) return <p className="text-danger">Error: {error}</p>;

    return (
        <div className="container mt-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Calificaciones</h3>
                <div className="d-flex gap-2">
                    <button className="btn btn-success" onClick={abrirAgregar}>
                        Agregar calificación
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setIsColumnsModalOpen(true)}
                    >
                        Exportar
                    </button>
                </div>
            </div>

            {calificaciones.length > 0 ? (
                <>
                    <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Descripción</th>
                                <th>Nota</th>
                                <th>Matrícula ID</th>
                                <th>DNI Alumno</th>
                                <th>Nombre Alumno</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCalificaciones.map((calif) => (
                                <tr key={calif.id}>
                                    <td>{calif.id}</td>
                                    <td>{calif.descripcion}</td>
                                    <td>{calif.nota}</td>
                                    <td>{calif.matriculaId ?? calif.matriculadoId}</td>
                                    <td>{calif.alumnoDni}</td>
                                    <td>{calif.alumnoNombre}</td>
                                    <td>
                                        <button
                                            className="btn btn-primary btn-sm me-2"
                                            onClick={() => abrirEditar(calif)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleEliminar(calif.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <nav>
                        <ul className="pagination justify-content-center">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <li
                                    key={i}
                                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </>
            ) : (
                <p className="text-center text-muted">No hay calificaciones.</p>
            )}

            {/* Modal Nueva/Editar Calificación */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <form className="modal-content" onSubmit={handleSubmit}>
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {modoEditar ? "Editar Calificación" : "Nueva Calificación"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Descripción</label>
                                    <input
                                        name="descripcion"
                                        className="form-control"
                                        value={calificacionActual.descripcion}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Nota</label>
                                    <input
                                        name="nota"
                                        type="number"
                                        step="0.1"
                                        className="form-control"
                                        value={calificacionActual.nota}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Porcentaje</label>
                                    <input
                                        name="porcentaje"
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="form-control"
                                        value={calificacionActual.porcentaje}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>


                                <div className="mb-3">
                                    <label className="form-label">Matrícula ID</label>
                                    <input
                                        name="matriculaId"
                                        type="number"
                                        className="form-control"
                                        value={calificacionActual.matriculaId}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de selección de columnas */}
            {isColumnsModalOpen && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Seleccionar columnas a exportar</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsColumnsModalOpen(false)}
                                ></button>
                            </div>

                            <div className="modal-body">
                                {columnasDisponibles.map((col) => (
                                    <div key={col.key} className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={col.key}
                                            checked={selectedColumns.includes(col.key)}
                                            onChange={() => {
                                                setSelectedColumns((prev) =>
                                                    prev.includes(col.key)
                                                        ? prev.filter((c) => c !== col.key)
                                                        : [...prev, col.key]
                                                );
                                            }}
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
        </div>
    );
}