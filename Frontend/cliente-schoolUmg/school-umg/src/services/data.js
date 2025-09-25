
const URL = 'http://localhost:5219/api/';

// ------------
// LOGIN
// ------------

export function login(usuario, pass) {
  const datos = { usuario, pass };

  return fetch(`${URL}autenticacion`, {
    method: 'POST',
    body: JSON.stringify(datos),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => {
    if (!res.ok) throw new Error('Error en la solicitud: ' + res.status);
    return res.text();
  })
  .then(text => text ? text : null);
}

// ------------
// ALUMNOS
// ------------

export function alumnoProfesor(usuario) {
  return fetch(`${URL}getAlumnosProfesor?usuario=${usuario}`)
    .then(res => {
      if (!res.ok) throw new Error('Error en la solicitud: ' + res.status);
      return res.json();
    });
}

export function getAlumno(id) {
  return fetch(`${URL}getAlumnoId?id=${id}`)
    .then(res => {
      if (!res.ok) throw new Error('Error en la solicitud: ' + res.status);
      return res.json();
    });
}

export function insertarAlumnoMatricular(alumno, id_asig) {
  const url = `${URL}insertarMatricular?id_asig=${id_asig}`;
  const body = {
    dni: alumno.dni,
    nombre: alumno.nombre,
    direccion: alumno.direccion,
    edad: Number(alumno.edad),
    email: alumno.email
  };

  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => {
    if (!res.ok) throw new Error('Error en la solicitud: ' + res.status);
    return res.text();
  });
}

export function actualizarAlumno(alumno) {
  return fetch(`${URL}actualizarAlumno`, {
    method: 'PUT',
    body: JSON.stringify(alumno),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => {
    if (!res.ok) throw new Error('Error en la solicitud: ' + res.status);
    return res.text();
  });
}

export function eliminarAlumno(id) {
  return fetch(`${URL}eliminarAlumno?id=${id}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Error en la solicitud: ' + res.status);
      return res.text();
    });
}

// -------------
// ASIGNATURAS
// -------------

export function getAsignaturas() {
  return fetch(`${URL}getAsignaturas`)
    .then(res => {
      if (!res.ok) throw new Error('Error en la solicitud: ' + res.status);
      return res.json();
    });
}

// ----------------
// CALIFICACIONES
// ----------------

export function getCalificacionesProfesor(usuario) {
  // URL corregida según tu controlador
  return fetch(`${URL}calificaciones/profesor/${usuario}`)
    .then(res => {
      if (!res.ok) throw new Error('Error en la solicitud: ' + res.status);
      return res.json();
    });
}

export function insertarCalificacion(calificacion) {
  const url = `${URL}insertCalificacion`;
  const body = {
    descripcion: calificacion.descripcion,
    nota: Number(calificacion.nota),
    porcentaje: Number(calificacion.porcentaje || 0),
    matriculaId: Number(calificacion.matriculaId),
    alumnoDni: calificacion.alumnoDni,
    alumnoNombre: calificacion.alumnoNombre
  };

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(async res => {
    const text = await res.text();
    if (!res.ok) throw new Error(`Error en la solicitud: ${res.status} ${text}`);
    try { return JSON.parse(text); } catch { return text; }
  });
}

export function actualizarCalificacion(calificacion) {
  const url = `${URL}actualizarCalificacion/${calificacion.id}`;
  const body = {
    descripcion: calificacion.descripcion,
    nota: Number(calificacion.nota),
    porcentaje: Number(calificacion.porcentaje || 0),
    matriculaId: Number(calificacion.matriculaId),
    alumnoDni: calificacion.alumnoDni,
    alumnoNombre: calificacion.alumnoNombre
  };

  return fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(async res => {
    const text = await res.text();
    if (!res.ok) throw new Error(`Error en la solicitud: ${res.status} ${text}`);
    try { return JSON.parse(text); } catch { return text; }
  });
}

export function eliminarCalificacion(id) {
  const url = `${URL}eliminarCalificacion/${id}`;
  return fetch(url, { method: 'DELETE' })
    .then(async res => {
      const text = await res.text();
      if (!res.ok) throw new Error(`Error en la solicitud: ${res.status} ${text}`);
      return text;
    });
}



// Obtener todos los profesores
export function getProfesores() {
  return fetch(`${URL}profesores`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Error en la solicitud: ' + res.status);
      }
      return res.json();
    });
}

// Obtener un profesor por usuario
export function getProfesor(usuario) {
  return fetch(`${URL}profesor/${usuario}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Error en la solicitud: ' + res.status);
      }
      return res.json();
    });
}

// Insertar un nuevo profesor
export function insertarProfesor(profesor) {
  const body = {
    usuario: profesor.usuario,
    pass: profesor.pass,
    nombre: profesor.nombre,
    email: profesor.email
  };

  return fetch(`${URL}profesor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then(async res => {
      const text = await res.text(); // leer texto (por si API devuelve string)
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${text}`);
      }
      return text; // devuelve "Profesor insertado correctamente"
    });

    
}

// Actualizar un profesor existente
export function actualizarProfesor(usuario, profesor) {
  const body = {
    usuario: usuario, // aseguramos que no cambie la clave primaria
    pass: profesor.pass,
    nombre: profesor.nombre,
    email: profesor.email
  };

  return fetch(`${URL}profesor/${usuario}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then(async res => {
      const text = await res.text(); // leer la respuesta como texto
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${text}`);
      }
      return text; // devuelve "Profesor actualizado correctamente"
    });
}

// Eliminar un profesor
export function eliminarProfesor(usuario) {
  return fetch(`${URL}profesor/${usuario}`, {
    method: 'DELETE'
  })
    .then(async res => {
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${text}`);
      }
      return text; // devuelve "Profesor eliminado correctamente"
    });

    
}


// Obtener alumnos por asignatura
export function getAlumnosPorAsignatura() {
  return fetch(`${URL}getAlumnosPorAsignatura`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Error en la solicitud: ' + res.status);
      }
      return res.json();
    });
}

// Obtener distribución de calificaciones
export function getDistribucionCalificaciones() {
  return fetch(`${URL}getDistribucionCalificaciones`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Error en la solicitud: ' + res.status);
      }
      return res.json();
    });
}