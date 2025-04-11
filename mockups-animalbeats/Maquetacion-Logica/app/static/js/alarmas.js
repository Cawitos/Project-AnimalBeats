document.addEventListener("DOMContentLoaded", function () {
    const tabla = document.querySelector("#tablaAlarmas tbody");
    let filaEditando = null;

    document.getElementById("formAgregarAlarma").addEventListener("submit", function (e) {
        e.preventDefault();

        const nombre = document.getElementById("agregarNombreMascota").value;
        const motivo = document.getElementById("agregarMotivo").value;
        const fecha = document.getElementById("agregarFecha").value;
        const hora = document.getElementById("agregarHora").value;

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${nombre}</td>
            <td>${motivo}</td>
            <td>${fecha}</td>
            <td>${hora}</td>
            <td>
                <button class="btn btn-warning btn-sm btn-editar">Editar</button>
                <button class="btn btn-danger btn-sm btn-eliminar">Eliminar</button>
            </td>
        `;
        tabla.appendChild(fila);
        cerrarModal("modalAgregarAlarma");
        this.reset();
        actualizarEventos();
    });

    function actualizarEventos() {
        document.querySelectorAll(".btn-editar").forEach((boton) => {
            boton.onclick = function () {
                filaEditando = this.closest("tr");
                document.getElementById("editarNombreMascota").value = filaEditando.cells[0].innerText;
                document.getElementById("editarMotivo").value = filaEditando.cells[1].innerText;
                document.getElementById("editarFecha").value = filaEditando.cells[2].innerText;
                document.getElementById("editarHora").value = filaEditando.cells[3].innerText;

                new bootstrap.Modal(document.getElementById("modalEditarAlarma")).show();
            };
        });

        document.querySelectorAll(".btn-eliminar").forEach((boton) => {
            boton.onclick = function () {
                const fila = this.closest("tr");

                Swal.fire({
                    title: "¿Estás seguro?",
                    text: "Esta alarma se eliminará permanentemente.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar"
                }).then((result) => {
                    if (result.isConfirmed) {
                        fila.remove();
                        Swal.fire("Eliminado", "La alarma ha sido eliminada.", "success");
                    }
                });
            };
        });
    }

    document.getElementById("formEditarAlarma").addEventListener("submit", function (e) {
        e.preventDefault();

        if (filaEditando) {
            filaEditando.cells[0].innerText = document.getElementById("editarNombreMascota").value;
            filaEditando.cells[1].innerText = document.getElementById("editarMotivo").value;
            filaEditando.cells[2].innerText = document.getElementById("editarFecha").value;
            filaEditando.cells[3].innerText = document.getElementById("editarHora").value;

            cerrarModal("modalEditarAlarma");
            filaEditando = null;
        }
    });

    function cerrarModal(id) {
        const modal = bootstrap.Modal.getInstance(document.getElementById(id));
        if (modal) modal.hide();
    }
});
