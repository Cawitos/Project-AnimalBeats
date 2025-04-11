# vamos a definir la lógica para el registro, login y perfil, utilizando consultas SQL manuales.
# Este código se conecta directamente a la base de datos y ejecuta consultas SQL para el login, registro, y el perfil de usuario.

from flask import Blueprint, render_template, request, redirect, url_for, current_app
from flask_bcrypt import Bcrypt
from flask import session

user_bp = Blueprint('user_bp', __name__)
bcrypt = Bcrypt()

@user_bp.route('/login', methods=['GET', 'POST'])
def login():
    connection = current_app.connection

    if request.method == 'POST':
        correoelectronico = request.form['correoelectronico']
        contrasena = request.form['contrasena']

        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM Usuarios WHERE correoelectronico = %s", (correoelectronico,))
            result = cursor.fetchone()

            if result and bcrypt.check_password_hash(result['contrasena'], contrasena):
                session['correoelectronico'] = correoelectronico
                n_documento = result['n_documento']

                # ADMINISTRADOR
                if correoelectronico == 'admin@animalbeats.com' and contrasena == 'admin200609':
                    cursor.execute("SELECT id FROM Rol WHERE rol = 'admin'")
                    id_rol = cursor.fetchone()['id']

                    # Verificar si ya existe en la tabla Administrador
                    cursor.execute("SELECT * FROM Administrador WHERE id_Usuario = %s", (n_documento,))
                    if not cursor.fetchone():
                        cursor.execute("""
                            INSERT INTO Administrador (id_Usuario, id_rol)
                            VALUES (%s, %s)
                        """, (n_documento, id_rol))
                        connection.commit()

                    return redirect('/administrador')

                # VETERINARIO
                elif correoelectronico == 'veterinario@animalbeats.com' and contrasena == 'veterinario200817':
                    cursor.execute("SELECT id FROM Rol WHERE rol = 'veterinario'")
                    id_rol = cursor.fetchone()['id']

                    cursor.execute("SELECT * FROM Veterinario WHERE id_Usuario = %s", (n_documento,))
                    if not cursor.fetchone():
                        cursor.execute("""
                            INSERT INTO Veterinario (id_Usuario, id_rol)
                            VALUES (%s, %s)
                        """, (n_documento, id_rol))
                        connection.commit()

                    return redirect('/veterinario')

                # CLIENTE
                else:
                    cursor.execute("SELECT id FROM Rol WHERE rol = 'cliente'")
                    id_rol = cursor.fetchone()['id']

                    cursor.execute("SELECT * FROM Cliente WHERE id_Usuario = %s", (n_documento,))
                    if not cursor.fetchone():
                        cursor.execute("""
                            INSERT INTO Cliente (id_Usuario, id_rol)
                            VALUES (%s, %s)
                        """, (n_documento, id_rol))
                        connection.commit()

                    return redirect('/cliente')
            else:
                return "Inicio de sesión fallido"

    return render_template('login.html')




@user_bp.route('/register', methods=['GET', 'POST'])
def register():
    connection = current_app.connection

    if request.method == 'POST':
        n_documento = request.form['n_documento']
        id_documento = request.form['id_documento']
        correoelectronico = request.form['correoelectronico']
        contrasena = request.form['contrasena']

        if not contrasena:
            return "Contraseña vacía. Por favor, ingrésala."

        hashed_password = bcrypt.generate_password_hash(contrasena).decode('utf-8')

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO Usuarios (n_documento, correoelectronico, contrasena, id_documento, estado)
                VALUES (%s, %s, %s, %s, %s)
            """, (n_documento, correoelectronico, hashed_password, id_documento, 'ACTIVO'))
            connection.commit()

        return redirect(url_for('user_bp.login'))

    with connection.cursor() as cursor:
        cursor.execute("SELECT id, tipo FROM Documento")
        tipos_documento = cursor.fetchall()

    return render_template('register.html', tipos_documento=tipos_documento)




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