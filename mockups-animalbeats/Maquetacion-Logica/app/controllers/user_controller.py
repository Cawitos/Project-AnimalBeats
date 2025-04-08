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
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT contrasena FROM Usuarios WHERE correoelectronico=%s", (correoelectronico,))
                result = cursor.fetchone()
                if result and bcrypt.check_password_hash(result['contrasena'], contrasena):
                    session['correoelectronico'] = correoelectronico  # Guardar el email del usuario en la sesión
                    return redirect(url_for('user_bp.profile'))
                else:
                    return "Inicio de sesion fallido"
        except Exception as e:
            return str(e)

    return render_template('registro.html')

@user_bp.route('/register', methods=['GET', 'POST'])
def register():
    
    connection = current_app.connection
    if request.method == 'POST':
        name = request.form['name']
        correoelectronico = request.form['correoelectronico']
        contrasena = request.form['contrasena']
        hashed_password = bcrypt.generate_password_hash(contrasena).decode('utf-8')

        try:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO usuarios (name, correoelectronico, contrasena) VALUES (%s, %s, %s, %s)", (name, correoelectronico, hashed_password))
                connection.commit()
            return redirect(url_for('user_bp.login'))
        except Exception as e:
            return str(e)

    # Obtener los roles de la base de datos
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, role_name FROM roles")
            roles = cursor.fetchall()
    except Exception as e:
        return str(e)

    return render_template('register.html', roles=roles)

@user_bp.route('/profile')
def profile():
    # Obtener el email del usuario desde la sesión o redireccionar al login si no está autenticado
    correoelectronico = session.get('user_email')
    if not correoelectronico:
        return redirect(url_for('user_bp.login'))
    
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT name, correoelectronico, role_id FROM usuarios WHERE email=%s", (correoelectronico,))
            user  = cursor.fetchone()
            if not user:
                return "User not found"
    except Exception as e:
        return str(e)

    return render_template('profile.html', user=user)

