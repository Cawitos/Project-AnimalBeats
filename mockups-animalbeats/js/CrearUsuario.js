<<<<<<< Updated upstream
function crearUsuario(event) {
    event.preventDefault(); // Evitar que el formulario recargue la página

    // Obtener los valores de los campos
    const nombre = document.getElementById("nombre").value;
    const tipoDocumento = document.getElementById("tipo-documento").value;
    const numeroDocumento = document.getElementById("numero-documento").value;
    const contacto = document.getElementById("contacto").value;
    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;

    // Validación básica
    if (!nombre || !tipoDocumento || !numeroDocumento || !contacto || !correo || !contrasena) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, complete todos los campos.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
        });
        return;
    }


    console.log("Datos del nuevo usuario:");
    console.log("Nombre:", nombre);
    console.log("Tipo de Documento:", tipoDocumento);
    console.log("Número de Documento:", numeroDocumento);
    console.log("Contacto:", contacto);
    console.log("Correo:", correo);
    console.log("Contraseña:", contrasena);

 
    Swal.fire({
        title: '¡Usuario creado!',
        text: 'El nuevo usuario ha sido registrado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
=======
document.getElementById('form-usuario').addEventListener('submit', function(event) {
    event.preventDefault();  

    Swal.fire({
        title: '¡Usuario creado!',
        text: 'El usuario ha sido creado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
>>>>>>> Stashed changes
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "GestionDeUsuarios.html";
        }
    });
<<<<<<< Updated upstream
}
=======
});
>>>>>>> Stashed changes
