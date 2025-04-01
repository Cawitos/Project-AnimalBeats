var modal = document.getElementById("modal-crear-mascota");

var btn = document.getElementById("myBtn");

var span = document.getElementsByClassName("close-btn")[0];

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function crearMascota(event) {
    event.preventDefault();

    const nombreMascota = document.getElementById("nombre-de-mascota").value.trim();
    const especie = document.getElementById("tipo-especie").value.trim();
    const raza = document.getElementById("tipo-raza").value.trim();
    const edad = document.getElementById("edad").vaue.trim();
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
            window.location.href = "../Administrador/GestionMascotas.html";
        }
    });
}

document.getElementById('form-mascota').addEventListener('submit', crearMascota);var modal = document.getElementById("modal-crear-mascota");

var btn = document.getElementById("myBtn");

var span = document.getElementsByClassName("close-btn")[0];

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function crearMascota(event) {
    event.preventDefault();

    const form = document.getElementById('form-mascota');
    const formData = new FormData(form);

    if (!formData.get('nombre-de-mascota') || !formData.get('tipo-especie') || !formData.get('tipo-raza') || !formData.get('edad') || !formData.get('color-de-pelaje') || !formData.get('alergias') || !formData.get('enfermedad') || !formData.get('dueño-a-asignar')) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, complete todos los campos.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
        });
        return;
    }

    const mascota = {
        nombre: formData.get('nombre-de-mascota'),
        especie: formData.get('tipo-especie'),
        raza: formData.get('tipo-raza'),
        edad: formData.get('edad'),
        colorPelaje: formData.get('color-de-pelaje'),
        alergias: formData.get('alergias'),
        enfermedad: formData.get('enfermedad'),
        dueño: formData.get('dueño-a-asignar')
    };

    console.log("Datos de la nueva mascota:");
    console.log(mascota);

    Swal.fire({
        title: '¡Mascota creada!',
        text: 'La nueva mascota ha sido registrada correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "../Administrador/GestionMascotas.html";
        }
    });
}

document.getElementById('form-mascota').addEventListener('submit', crearMascota);