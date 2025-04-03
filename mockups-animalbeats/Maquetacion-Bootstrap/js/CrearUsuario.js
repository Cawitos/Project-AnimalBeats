function crearUsuario(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const tipoDocumento = document.getElementById("tipo-documento").value.trim();
    const numeroDocumento = document.getElementById("numero-documento").value.trim();
    const contacto = document.getElementById("contacto").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();

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
        confirmButtonText: 'Aceptar'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "GestionDeUsuarios.html";
        }
    });
}

document.getElementById('form-usuario').addEventListener('submit', crearUsuario);
