function guardarCambios(event) {
    event.preventDefault(); 
    const codigo = document.getElementById("codigo").value;
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const direccion = document.getElementById("direccion").value;

    console.log("Datos guardados:");
    console.log("Código:", codigo);
    console.log("Nombre:", nombre);
    console.log("Apellido:", apellido);
    console.log("Dirección:", direccion);


    Swal.fire({
        title: '¡Cambios guardados!',
        text: 'Los datos se han guardado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "GestionDeUsuarios.html"; 
        }
    });
}