const tablaAlarmas = document.getElementById('tabla-alarmas');
const botonAñadirAlarma = document.getElementById('añadir-alarma');
const modal = document.getElementById('modal');
const formAlarma = document.getElementById('form-alarma');
const cancelarBtn = document.getElementById('cancelar');

let alarmas = [
    { cliente: 'xxxxx', tipo: 'RECORDATORIO', activa: true },
    { cliente: 'xxxxx', tipo: 'PAGO', activa: true },
    { cliente: 'xxxx', tipo: 'MEDICAMENTOS', activa: true },
    { cliente: 'xxxxx', tipo: 'CUIDADO', activa: true },
];

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
            <td>
                <i class="fa-solid fa-bell" style="color: ${alarma.activa ? 'green' : 'gray'}"></i>
            </td>
        `;
        tablaAlarmas.appendChild(fila);
    });
}

function cambiarEstado(index) {
    alarmas[index].activa = !alarmas[index].activa;
    renderizarAlarmas();
}

botonAñadirAlarma.addEventListener('click', () => {
    modal.classList.add('mostrar');
});

cancelarBtn.addEventListener('click', () => {
    modal.classList.remove('mostrar');
});

formAlarma.addEventListener('submit', (event) => {
    event.preventDefault();

    const cliente = document.getElementById('cliente').value;
    const tipo = document.getElementById('tipo').value;

    if (cliente && tipo) {
        alarmas.push({ cliente, tipo, activa: true });
        renderizarAlarmas();
        modal.classList.remove('mostrar');
        formAlarma.reset();
    }
});

renderizarAlarmas();
