document.querySelector('.btn-ingresar').addEventListener('click', function (event) {
    event.preventDefault(); 
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (email === '' || password === '') {
        Swal.fire({
            icon: 'warning',
            title: 'Campos vacíos',
            text: 'Por favor, completa todos los campos antes de continuar.',
            confirmButtonText: 'Aceptar',
        });
        return;
    }
    if (email === 'admin@animalbeats.com' && password === '12345') {
        Swal.fire({
            icon: 'success',
            title: 'Inicio de sesión exitoso',
            text: 'Bienvenido Administrador.',
            confirmButtonText: 'Ingresar',
        }).then(() => {
            window.location.href = 'Administrador/administrador.html'; 
        });
    } else if(email === 'veterinario@animalbeats.com' && password === '54321'){
        Swal.fire({
            icon: 'success',
            title: 'Inicio de sesión exitoso',
            text: 'Bienvenido Veterinario.',
            confirmButtonText: 'Ingresar',
            }).then(() => {
                window.location.href = 'Veterinario/veterinario.html';
        })
        } else if(email === 'cliente@animalbeats.com' && password === '67890'){
            Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                text: 'Bienvenido Cliente'
                }).then(() => {
                    window.location.href = 'Cliente/cliente.html';
                    })
    }else{
        Swal.fire({
            icon: 'error',
            title: 'Credenciales incorrectas',
            text: 'El correo o la contraseña no son válidos. Inténtalo nuevamente.',
            confirmButtonText: 'Reintentar',
        });
    }
});