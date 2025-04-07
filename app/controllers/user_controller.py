#vamos a definir la lógica para el registro, login y perfil, utilizando consultas SQL manuales. Este código se conecta directamente a la base de datos y ejecuta consultas SQL para el login, registro, y el perfil de usuario.
from flask import Blueprint, render_template, request, redirect, url_for, current_app
from flask_bcrypt import Bcrypt
from flask import session

user_bp = Blueprint('user_bp', __name__)
bcrypt = Bcrypt()

@user_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        connection = current_app.connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT password FROM usuarios WHERE email=%s", (email,))
                result = cursor.fetchone()
                if result and bcrypt.check_password_hash(result['password'], password):
                    session['user_email'] = email  # Guardar el email del usuario en la sesión
                    return redirect(url_for('user_bp.profile'))
                else:
                    return "Login Failed"
        except Exception as e:
            return str(e)

    return render_template('login.html')

@user_bp.route('/register', methods=['GET', 'POST'])
def register():
    connection = current_app.connection
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        role_id = request.form['role']
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        try:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO usuarios (name, email, password, role_id) VALUES (%s, %s, %s, %s)", (name, email, hashed_password, role_id))
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
    email = session.get('user_email')
    if not email:
        return redirect(url_for('user_bp.login'))
    
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT name, email, role_id FROM usuarios WHERE email=%s", (email,))
            user = cursor.fetchone()
            if not user:
                return "User not found"
    except Exception as e:
        return str(e)

    return render_template('profile.html', user=user)

@user_bp.route('/Mascotas', methods=['GET', 'POST'])
def Mascotas():
    connection = current_app.connection
    
    return render_template('GestionMascotas.html')

def create_mascot():
    connection = current_app.connection
    if request.method == 'POST':
        namec = request.form['namec']
        edadc = request.form['edadc']
        razaC = request.form['razaC']
        especieC = request.form['especieC']
        n_documento = request.form['n_documento']

        try:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO mascotas (id_cliente, nombre, edad, id_raza, id_especie) VALUES (%s, %s, %s, %s, %s)", (n_documento, namec, edadc, razaC, especieC))
                connection.commit()
            return redirect(url_for('user_bp.GestionMascotas.html'))
        except Exception as e:
            return str(e)
        
    return render_template('GestionMascotas.html')

