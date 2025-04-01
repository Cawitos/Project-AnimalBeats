function abrirModal(enfermedadId) {
    const modal = document.getElementById(enfermedadId);
    if (modal) {
        modal.style.display = "block";
    }
}

function cerrarModal(enfermedadId) {
    const modal = document.getElementById(enfermedadId);
    if (modal) {
        modal.style.display = "none";
    }
}

// Cerrar el modal al hacer clic fuera de él
window.onclick = function(event) {
    const modales = document.getElementsByClassName('modal');
    for (let i = 0; i < modales.length; i++) {
        if (event.target === modales[i]) {
            modales[i].style.display = "none";
        }
    }
};
