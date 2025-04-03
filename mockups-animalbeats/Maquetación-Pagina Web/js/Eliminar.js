const confirmarBtn = document.querySelector("button");


confirmarBtn.addEventListener("click", function() {

    Swal.fire({
        title: 'Usuario eliminado',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    }).then((result) => {

        if (result.isConfirmed) {
            window.location.href = "GestionDeUsuarios.html";
        }
    });
});