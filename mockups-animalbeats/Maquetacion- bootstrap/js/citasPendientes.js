function eliminarCita(id) {
    const cita = document.getElementById(id);
    if (cita) {
        cita.classList.add('eliminada');

        const iconoX = document.createElement('span');
        iconoX.className = 'icono-x';
        iconoX.textContent = ' X';
        cita.querySelector('.detalle h3').appendChild(iconoX);
    }
}

function modificarCita(id) {
    alert("Funcionalidad para modificar la cita " + id + " aún no implementada.");
}
