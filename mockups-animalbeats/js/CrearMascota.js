function crearMascota(event) {
    event.preventDefault();

    const nombreMascota = document.getElementById("nombre-de-mascota").value.trim();
    const especie = document.getElementById("especie").value.trim();
    const raza = document.getElementById("raza").value.trim();
    const edad = document.getElementById("edad").value.trim();
    const colorPelaje = document.getElementById("color-de-pelaje").value.trim();
    const alergias = document.getElementById("alergias").value.trim();
    const enfermedad = document.getElementById("enfermedad").value.trim();
    const dueñoAsignar = document.getElementById("dueño-a-asignar").value.trim();

    if (!nombreMascota || !especie || !raza || !edad || !colorPelaje || !alergias || !enfermedad || !dueñoAsignar) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, complete todos los campos.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
        });
        return;
    }

    console.log("Datos de la nueva mascota:");
    console.log("Nombre de la Mascota:", nombreMascota);
    console.log("Especie:", especie);
    console.log("Raza:", raza);
    console.log("Edad:", edad);
    console.log("Color del Pelaje:", colorPelaje);
    console.log("Alergias:", alergias);
    console.log("Enfermedad:", enfermedad); 
    console.log("Dueño a Asignar:", dueñoAsignar);

    Swal.fire({
        title: '¡Mascota creada!',
        text: 'La nueva mascota ha sido registrada correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "../Administrador/ConsultarMascota.html";
        }
    });
}

document.getElementById('form-mascota').addEventListener('submit', crearMascota);
