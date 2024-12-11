document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-modificar");
    const cerrarBtns = document.querySelectorAll(".cerrar-modal");
    const btnsModificar = document.querySelectorAll(".btn-modificar");

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

            modal.style.display = "block";
        });
    });

    cerrarBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    });

    window.addEventListener("click", (e) => {
        if (e.target == modal) {
            modal.style.display = "none";
        }
    });
});

function guardarCambios(event) {
    event.preventDefault();
    alert("Cambios guardados");
    document.getElementById("modal-modificar").style.display = "none";
}
