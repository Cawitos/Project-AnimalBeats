const tablaAlarmas = document.getElementById('tabla-alarmas');
const botonAñadirAlarma = document.getElementById('añadir-alarma');
const modal = document.getElementById('modal');
const formAlarma = document.getElementById('form-alarma');
const cancelarBtn = document.getElementById('cancelar');
const modalTitulo = document.getElementById("modalTitulo");

let alarmas = [
    { cliente: 'xxxx', tipo: 'Recordatorio', activa: true, hora: '08:00' },
    { cliente: 'xxxx', tipo: 'Pago Pendiente', activa: false, hora: '10:30' },
    { cliente: 'xxxx', tipo: 'Medicamentos', activa: true, hora: '14:00' },
    { cliente: 'xxxx', tipo: 'Cuidados', activa: true, hora: '18:00' },
];

let editando = null; 

function renderizarAlarmas() {
    tablaAlarmas.innerHTML = '';

    alarmas.forEach((alarma, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${alarma.cliente}</td>
            <td>${alarma.tipo}</td>
            <td>
                <input type="checkbox" ${alarma.activa ? 'checked' : ''} 
                       onchange="cambiarEstado(${index})">
            </td>
            <td>${alarma.hora}</td>
            <td>
                <button onclick="editarAlarma(${index})"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFF"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button>
                <button onclick="eliminarAlarma(${index})"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFF"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
            </td>
        `;
        tablaAlarmas.appendChild(fila);
    });
}

function cambiarEstado(index) {
    alarmas[index].activa = !alarmas[index].activa;
    renderizarAlarmas();
}

function abrirModal() {
    console.log("Abriendo modal");
    modal.classList.remove('oculto');
    modal.classList.add('mostrar');
}

function cerrarModal() {
    console.log("Cerrando modal");
    modal.classList.add('oculto');
    modal.classList.remove('mostrar');
}

botonAñadirAlarma.addEventListener('click', () => {
    formAlarma.reset();
    editando = null; 
    modalTitulo.textContent = 'Añadir Nueva Alarma';
    abrirModal();
});

cancelarBtn.addEventListener('click', cerrarModal);

modal.addEventListener('click', (event) => {
    if (event.target.id === 'modal') { 
        cerrarModal();
    }
});

function eliminarAlarma(index) {
    if (confirm('¿Seguro que quieres eliminar esta alarma?')) {
        alarmas.splice(index, 1);
        renderizarAlarmas();
    }
}

function editarAlarma(index) {
    editando = index;
    const alarma = alarmas[index];

    document.getElementById('cliente').value = alarma.cliente;
    document.getElementById('tipo').value = alarma.tipo;
    document.getElementById('hora').value = alarma.hora;
    document.getElementById('activa').checked = alarma.activa;

    modalTitulo.textContent = 'Modificar Alarma';
    abrirModal();
}

formAlarma.addEventListener('submit', (event) => {
    event.preventDefault();

    const cliente = document.getElementById('cliente').value;
    const tipo = document.getElementById('tipo').value;
    const hora = document.getElementById('hora').value;
    const activa = document.getElementById('activa').checked;

    if (editando !== null) {
        alarmas[editando] = { cliente, tipo, hora, activa };
    } else {
        alarmas.push({ cliente, tipo, hora, activa });
    }

    renderizarAlarmas();
    cerrarModal(); 
    formAlarma.reset();
    editando = null; 
});


renderizarAlarmas();
