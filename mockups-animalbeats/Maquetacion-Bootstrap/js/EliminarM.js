const confirmarBtn = document.querySelector("button");


confirmarBtn.addEventListener("click", function() {

    Swal.fire({
        title: 'Mascota eliminada',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    }).then((result) => {

        if (result.isConfirmed) {
            window.location.href = "../Administrador/ConsultarMascota.html";
        }
    });
});