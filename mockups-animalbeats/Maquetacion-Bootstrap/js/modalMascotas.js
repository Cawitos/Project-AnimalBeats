document.addEventListener("DOMContentLoaded", () => {
    // Modal Eliminar
    const modalEliminar = document.getElementById("modal-eliminar");
    const btnsEliminar = document.querySelectorAll(".btn-eliminar");
    const cerrarEliminar = document.querySelector(".cerrar-eliminar");
    const confirmarEliminar = document.getElementById("confirmar-eliminar");
    const cancelarEliminar = document.getElementById("cancelar-eliminar");

    let idMascotaEliminar = null;

    btnsEliminar.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const fila = e.target.closest("tr");
            idMascotaEliminar = fila.cells[0].textContent;
            modalEliminar.style.display = "block";
        });
    });

    cerrarEliminar.addEventListener("click", () => {
        modalEliminar.style.display = "none";
    });

    cancelarEliminar.addEventListener("click", () => {
        modalEliminar.style.display = "none";
    });

    confirmarEliminar.addEventListener("click", () => {
        Swal.fire({
            title: 'Mascota eliminada',
            icon: 'success',
            confirmButtonText: 'Aceptar',
        }).then((result) => {
            if (result.isConfirmed) {
                const filas = document.querySelectorAll("#tabla-mascotas tbody tr");
                filas.forEach((fila) => {
                    if (fila.cells[0].textContent === idMascotaEliminar) {
                        fila.remove();
                    }
                });
                modalEliminar.style.display = "none";
            }
        });
    });

    // Modal Modificar
    const modalModificar = document.getElementById("modal-modificar");
    const btnsModificar = document.querySelectorAll(".btn-modificar");
    const cerrarModificar = document.querySelector(".cerrar-modificar");

    btnsModificar.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const row = e.target.closest("tr");
            document.getElementById("nombreM").value = row.cells[1].innerText;
            document.getElementById("especieM").value = row.cells[2].innerText;
            document.getElementById("razaM").value = row.cells[3].innerText;
            document.getElementById("edadM").value = row.cells[4].innerText;
            document.getElementById("color_Pelaje").value = row.cells[5].innerText;
            document.getElementById("alergiaM").value = row.cells[6].innerText;
            document.getElementById("enfermedadM").value = row.cells[7].innerText;
            document.getElementById("codigoM").value = row.cells[0].innerText;

            modalModificar.style.display = "block";
        });
    });

    cerrarModificar.addEventListener("click", () => {
        modalModificar.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modalEliminar) {
            modalEliminar.style.display = "none";
        }
        if (e.target === modalModificar) {
            modalModificar.style.display = "none";
        }
    });
});

function guardarCambios(event) {
    event.preventDefault();
    Swal.fire({
        title: 'Mascota modificada',
        icon: 'success',
        confirmButtonText: 'Aceptar',})
    document.getElementById("modal-modificar").style.display = "none";
}
