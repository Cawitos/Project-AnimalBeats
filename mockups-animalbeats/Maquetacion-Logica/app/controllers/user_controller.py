# vamos a definir la lógica para el registro, login y perfil, utilizando consultas SQL manuales.
# Este código se conecta directamente a la base de datos y ejecuta consultas SQL para el login, registro, y el perfil de usuario.

from flask import Blueprint, render_template, request, redirect, url_for, current_app
from flask_bcrypt import Bcrypt
from flask import session

user_bp = Blueprint('user_bp', __name__)
bcrypt = Bcrypt()

@user_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        correoelectronico = request.form['correoelectronico']
        contrasena = request.form['contrasena']

        connection = current_app.connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT contrasena FROM Usuarios WHERE correoelectronico=%s", (correoelectronico,))
            result = cursor.fetchone()

            if result and bcrypt.check_password_hash(result['contrasena'], contrasena):
                # Validar por correo y contraseña exactos si es admin o veterinario
                if correoelectronico == 'admin@animalbeats.com' and contrasena == 'admin200609':
                    return redirect('/administrador')
                elif correoelectronico == 'veterinario@animalbeats.com' and contrasena == 'veterinario200817':
                    return redirect('/veterinario')
                else:
                    return redirect('/cliente')
            else:
                return "Inicio de sesión fallido"

    return render_template('login.html')


@user_bp.route('/register', methods=['GET', 'POST'])
def register():
    connection = current_app.connection

    if request.method == 'POST':
        n_documento = request.form['n_documento']
        correoelectronico = request.form['correoelectronico']
        contrasena = request.form['contrasena']

        if not contrasena:
            return "Contraseña vacía. Por favor, ingrésala."

        hashed_password = bcrypt.generate_password_hash(contrasena).decode('utf-8')

        with connection.cursor() as cursor:
            # Insertar el nuevo usuario en la tabla Usuarios
            cursor.execute("""
                INSERT INTO Usuarios (n_documento, correoelectronico, contrasena)
                VALUES (%s, %s, %s)
            """, (n_documento, correoelectronico, hashed_password))
            connection.commit()

        return redirect(url_for('user_bp.login'))

    return render_template('register.html')


@user_bp.route('/profile')
def profile():
    correoelectronico = session.get('correoelectronico')
    if not correoelectronico:
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT n_documento, correoelectronico FROM Usuarios WHERE correoelectronico=%s", (correoelectronico,))
        user = cursor.fetchone()
        if not user:
            return "Usuario no encontrado"

    if correoelectronico == 'admin@animalbeats.com':
        return redirect('/administrador')
    elif correoelectronico == 'veterinario@animalbeats.com':
        return redirect('/veterinario')
    else:
        return redirect('/cliente')


@user_bp.route('/administrador')
def dashboard_admin():
    return render_template('Administrador/administrador.html')

@user_bp.route('/veterinario')
def dashboard_veterinario():
    return render_template('Veterinario/veterinario.html')

@user_bp.route('/cliente')
def dashboard_cliente():
    return render_template('Cliente/cliente.html')
