import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  getAlumnosPorAsignatura,
  getDistribucionCalificaciones,
} from "../services/data";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export function Inicio() {
  const [alumnosPorAsignatura, setAlumnosPorAsignatura] = useState({
    labels: [],
    datasets: [
      {
        label: "Alumnos por Asignatura",
        data: [],
        backgroundColor: ["#2ecc71", "#3498db", "#f1c40f", "#e67e22", "#e74c3c"],
      },
    ],
  });

  const [distribucionCalificaciones, setDistribucionCalificaciones] = useState({
    labels: ["A", "B", "C", "D", "F"],
    datasets: [
      {
        label: "Distribución de Calificaciones",
        data: [],
        backgroundColor: ["#2ecc71", "#3498db", "#f1c40f", "#e67e22", "#e74c3c"],
      },
    ],
  });

  const cardStyle = {
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  };
useEffect(() => {
  // Cargar Alumnos por Asignatura
  getAlumnosPorAsignatura()
    .then((data) => {
      const labels = data.map((d) => d.nombreAsignatura);
      const valores = data.map((d) => d.totalAlumnos);
      // Generar colores dinámicos si hay más asignaturas
      const colores = [
        "#3498db",
        "#2ecc71",
        "#e74c3c",
        "#1abc9c",
        "#34495e",
        "#e67e22",
        "#f1c40f",
        "#8e44ad",
        "#9b59b6",
        "#7f8c8d"
      ].slice(0, data.length);

      setAlumnosPorAsignatura({
        labels,
        datasets: [
          {
            label: "Alumnos por Asignatura",
            data: valores,
            backgroundColor: colores
          }
        ]
      });
    })
    .catch((err) =>
      console.error("Error cargando alumnos por asignatura:", err)
    );

  // Cargar Distribución de Calificaciones
  getDistribucionCalificaciones()
    .then((data) => {
      setDistribucionCalificaciones((prev) => ({
        ...prev,
        datasets: [
          {
            ...prev.datasets[0],
            data: [data.a, data.b, data.c, data.d, data.f]
          }
        ]
      }));
    })
    .catch((err) =>
      console.error("Error cargando distribución de calificaciones:", err)
    );
}, []);

return (
  <div className="container mt-4">
    <h3>Inicio</h3>
    <p>Bienvenido al sistema UMG.</p>

    <div className="row mt-4">
      {/* Gráfica de alumnos por asignatura */}
      <div className="col-md-6 mb-4">
        <div style={cardStyle}>
          <h5>Alumnos por Asignatura</h5>
          <Bar
            data={alumnosPorAsignatura}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
            }}
          />
        </div>
      </div>

      {/* Gráfica de distribución de calificaciones */}
      <div className="col-md-6 mb-4">
        <div style={cardStyle}>
          <h5>Distribución de Calificaciones</h5>
          <Pie
            data={distribucionCalificaciones}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  </div>
);
 }