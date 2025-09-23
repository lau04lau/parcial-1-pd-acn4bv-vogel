
class Paciente {
    /**
     * @param {string} nombre
     * @param {string} apellido
     * @param {string} dni            
     * @param {string} telefono
     * @param {string} fechaNac    
     * @param {string} motivoConsulta
     * @param {number} gradoCurso
     * @param {string} nivelEducativo 
     * @param {string} genero         
     */
    constructor(
        nombre,
        apellido,
        dni,
        telefono,
        fechaNac,
        motivoConsulta,
        gradoCurso,
        nivelEducativo,
        genero
    ) {
        this.nombre = (nombre ?? "").trim();
        this.apellido = (apellido ?? "").trim();
        this.dni = String(dni ?? "").trim();
        this.telefono = (telefono ?? "").trim();
        this.fechaNac = fechaNac;
        this.motivoConsulta = (motivoConsulta ?? "").trim();
        this.gradoCurso = Number(gradoCurso);
        this.nivelEducativo = (nivelEducativo ?? "").trim();
        this.genero = genero;
        this.createdAt = new Date().toISOString();
    }
}

const ALMACEN = "pacientes";

function obtenerPacientes() {
    const raw = localStorage.getItem(ALMACEN);
    return raw ? JSON.parse(raw) : [];
}

function guardarPacientes(lista) {
    localStorage.setItem(ALMACEN, JSON.stringify(lista));
}

function esFechaPasada(fecha) {
    if (!fecha) return false;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    return new Date(fecha) <= hoy;
}

const NIVELES_VALIDOS = ["Inicial", "Primario", "Secundario", "Terciario", "Universitario"];
const GENEROS_VALIDOS = ["Femenino", "Masculino", "Prefiere no decir"];

function validar(form) {
    const nombreOk = form.nombre.value.trim().length > 0;
    const apellidoOk = form.apellido.value.trim().length > 0;
    const dniOk = /^\d{7,8}$/.test(form.dni.value.trim());
    const telOk = /^[0-9+()\-\s]{6,20}$/.test(form.telefono.value.trim());
    const fechaOk = esFechaPasada(form.fechaNac.value);
    const gradoOk = Number(form.gradoCurso.value) >= 1;

    const nivel = (form.nivelEducativo?.value ?? "").trim();
    const nivelOk = NIVELES_VALIDOS.includes(nivel);

    const gen = (form.genero?.value ?? "").trim();
    const generoOk = GENEROS_VALIDOS.includes(gen);

    if (!nombreOk) return "El nombre no puede estar vacío.";
    if (!apellidoOk) return "El apellido no puede estar vacío.";
    if (!dniOk) return "DNI inválido: usar 7 u 8 dígitos.";
    if (!telOk) return "Teléfono inválido: solo números, +, (), - y espacios.";
    if (!fechaOk) return "La fecha de nacimiento debe ser pasada.";
    if (!gradoOk) return "Grado/Curso debe ser un número válido.";
    if (!nivelOk) return "Seleccioná un nivel educativo válido.";
    if (!generoOk) return "Seleccioná un género válido.";
    return "";
}


const form = document.getElementById("formPaciente");
const msg = document.getElementById("msg");
const tabla = document.getElementById("tablaPacientes");
const tbody = tabla.querySelector("tbody");
const tituloTabla = document.getElementById("tituloTabla");
//const btnEliminar = document.getElementById("btnEliminar");

function renderTabla() {
    const pacientes = obtenerPacientes();
    if (!pacientes.length) {
        tabla.hidden = true;
        tituloTabla.hidden = true;
        //btnEliminar.hidden = true;
        tbody.innerHTML = "";
        return;
    }
    tabla.hidden = false;
    tituloTabla.hidden = false;
    //btnEliminar.hidden = false;


    tbody.innerHTML = pacientes.map(p => {
        const apNom = `${p.apellido}, ${p.nombre}`;
        const f = new Date(p.fechaNac).toLocaleDateString("es-AR");
        const nivel = p.nivelEducativo ?? "-";
        return `<tr>
      <td>${apNom}</td>
      <td>${p.dni}</td>
      <td>${p.telefono}</td>
      <td>${f}</td>
      <td>${p.gradoCurso}</td>
      <td>${nivel}</td>
      <td>${p.genero}</td>
      <td>
        <button type="button"
                class="btn-row-del"
                data-dni="${p.dni}"
                aria-label="Eliminar a ${apNom}">Eliminar</button>
      </td>
    </tr>`;
    }).join("");
}


form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    msg.textContent = "";
    msg.className = "msg";

    const error = validar(form);
    if (error) {
        msg.textContent = error;
        msg.classList.add("err");
        return;
    }

    let generoSeleccionado = (form.genero.value || "").trim();
    if (!GENEROS_VALIDOS.includes(generoSeleccionado)) {
        generoSeleccionado = "Prefiere no decir";
    }

    const paciente = new Paciente(
        form.nombre.value,
        form.apellido.value,
        form.dni.value,
        form.telefono.value,
        form.fechaNac.value,
        form.motivoConsulta.value,
        form.gradoCurso.value,
        form.nivelEducativo.value,
        generoSeleccionado
    );

    const pacientes = obtenerPacientes();

    const yaExiste = pacientes.some(p => p.dni === paciente.dni);
    if (yaExiste) {
        msg.textContent = "Ya existe un paciente con ese DNI.";
        msg.classList.add("err");
        return;
    }

    pacientes.push(paciente);
    guardarPacientes(pacientes);

    form.reset();
    form.nombre.focus();
    msg.textContent = "Paciente cargado correctamente.";
    msg.classList.add("ok");
    renderTabla();
});

document.addEventListener("DOMContentLoaded", renderTabla);

// me permite borrar toda la tabla
//document.getElementById("btnEliminar")
//     .addEventListener("click", borrarTabla);


// function borrarTabla() {
//     if (!confirm("¿Eliminar todos los pacientes?")) return;
//     localStorage.removeItem(ALMACEN);
//     renderTabla();
// }

tbody.addEventListener("click", (ev) => {
  const btn = ev.target.closest(".btn-row-del");
  if (!btn) return;

  const dni = btn.dataset.dni;
  if (!confirm(`¿Eliminar al paciente con DNI ${dni}?`)) return;

  const restantes = obtenerPacientes().filter(p => p.dni !== dni);
  guardarPacientes(restantes);
  renderTabla();
});
