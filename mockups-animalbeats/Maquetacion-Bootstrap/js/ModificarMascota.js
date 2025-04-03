function guardarCambiosM(event) {
    event.preventDefault(); 
    const nombreM = document.getElementById("nombreM").value;
    const especieM = document.getElementById("especieM").value;
    const razaM = document.getElementById("razaM").value;
    const edadM = document.getElementById("edadM").value;
    const color_Pelaje = document.getElementById("color_Pelaje").value;
    const alergiasM = document.getElementById("alergiaM").value;
    const enfermedadM = document.getElementById("enfermedadM").value;
    const codigo = document.getElementById("codigoM").value;

    console.log("Datos guardados:");
    console.log("Nombre:", nombreM);
    console.log("Especie:", especieM);
    console.log("Raza:", razaM);
    console.log("Edad:", edadM);
    console.log("Color de pelaje:", color_Pelaje);
    console.log("Alergias:", alergiasM);
    console.log("Enfermedad:", enfermedadM);
    console.log("Código de dueño:", codigo);

    // Mostrar alerta de éxito
    Swal.fire({
        title: '¡Cambios guardados!',
        text: 'Los datos se han guardado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "GestionMascotas.html";
        }
    });
}
