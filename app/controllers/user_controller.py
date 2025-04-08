#vamos a definir la lógica para el registro, login y perfil, utilizando consultas SQL manuales. Este código se conecta directamente a la base de datos y ejecuta consultas SQL para el login, registro, y el perfil de usuario.
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
                session['correoelectronico'] = correoelectronico  # Guardar el correo electrónico en la sesión
                return redirect(url_for('user_bp.profile'))
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
    # Obtener el correo electrónico del usuario desde la sesión o redireccionar al login si no está autenticado
    correoelectronico = session.get('correoelectronico')
    if not correoelectronico:
        return redirect(url_for('user_bp.login'))
    
    connection = current_app.connection
    with connection.cursor() as cursor:
        # Recuperar la información del usuario por correo electrónico
        cursor.execute("SELECT n_documento, correoelectronico FROM Usuarios WHERE correoelectronico=%s", (correoelectronico,))
        user = cursor.fetchone()
        if not user:
            return "Usuario no encontrado"

    return render_template('profile.html', user=user)
