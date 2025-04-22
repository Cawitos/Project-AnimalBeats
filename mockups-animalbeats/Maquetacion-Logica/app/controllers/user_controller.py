# vamos a definir la lógica para el registro, login y perfil, utilizando consultas SQL manuales.
# Este código se conecta directamente a la base de datos y ejecuta consultas SQL para el login, registro, y el perfil de usuario.

from flask import Blueprint, render_template, request, redirect, url_for, current_app
from flask_bcrypt import Bcrypt
from flask import session

user_bp = Blueprint('user_bp', __name__)
bcrypt = Bcrypt()

def is_authenticated():
    return 'n_documento' in session and 'correoelectronico' in session and 'id_rol' in session



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
                session['n_documento'] = result['n_documento'] 
                session['id_rol'] = result['id_rol']
                n_documento = result['n_documento']
                id_rol = result['id_rol']

                cursor.execute("SELECT rol FROM Rol WHERE id = %s", (id_rol,))
                rol = cursor.fetchone()['rol']

                if rol == 'admin':
                    return redirect('/administrador')
                elif rol == 'veterinario':
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
        nombre = request.form['nombre']  
        id_documento = request.form['id_documento']
        correoelectronico = request.form['correoelectronico']
        contrasena = request.form['contrasena']

        if not contrasena:
            return "Contraseña vacía. Por favor, ingrésala."

        with connection.cursor() as cursor:
            if correoelectronico == 'admin@animalbeats.com' and contrasena == 'admin200609':
                cursor.execute("SELECT id FROM Rol WHERE rol = 'admin'")
            elif correoelectronico == 'veterinario@animalbeats.com' and contrasena == 'veterinario200817':
                cursor.execute("SELECT id FROM Rol WHERE rol = 'veterinario'")
            else:
                cursor.execute("SELECT id FROM Rol WHERE rol = 'cliente'")

            id_rol = cursor.fetchone()['id']

        hashed_password = bcrypt.generate_password_hash(contrasena).decode('utf-8')

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO Usuarios (n_documento, nombre, correoelectronico, contrasena, id_documento, estado, id_rol)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (n_documento, nombre, correoelectronico, hashed_password, id_documento, 'ACTIVO', id_rol))
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
        cursor.execute("""
            SELECT u.n_documento, u.correoelectronico, u.id_rol, r.rol
            FROM Usuarios u
            JOIN Rol r ON u.id_rol = r.id
            WHERE u.correoelectronico = %s
        """, (correoelectronico,))
        user = cursor.fetchone()
        if not user:
            return "Usuario no encontrado"

    if user['rol'] == 'admin':
        return redirect('/administrador')
    elif user['rol'] == 'veterinario':
        return redirect('/veterinario')
    else:
        return redirect('/cliente')


@user_bp.route('/administrador')
def dashboard_admin():
    correoelectronico = session.get('correoelectronico')
    if not correoelectronico:
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT n_documento, nombre, correoelectronico 
            FROM Usuarios 
            WHERE correoelectronico = %s
        """, (correoelectronico,))
        usuario = cursor.fetchone()

     
        cursor.execute("""
            SELECT COUNT(*) 
            FROM Usuarios 
            WHERE id_rol = (SELECT id FROM Rol WHERE rol = 'cliente')
        """)
        total_clientes_result = cursor.fetchone()
        total_clientes = total_clientes_result.get('COUNT(*)', 0) if total_clientes_result else 0

       
        cursor.execute("""
            SELECT COUNT(*) 
            FROM Usuarios 
            WHERE id_rol = (SELECT id FROM Rol WHERE rol = 'veterinario')
        """)
        total_veterinarios_result = cursor.fetchone()
        total_veterinarios = total_veterinarios_result.get('COUNT(*)', 0) if total_veterinarios_result else 0

    return render_template('Administrador/administrador.html', 
                           usuario=usuario, 
                           total_clientes=total_clientes,
                           total_veterinarios=total_veterinarios)




@user_bp.route('/veterinario')
def dashboard_veterinario():
    correoelectronico = session.get('correoelectronico')
    if not correoelectronico:
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT n_documento, nombre, correoelectronico
            FROM Usuarios
            WHERE correoelectronico = %s
        """, (correoelectronico,))
        usuario = cursor.fetchone()

    if not usuario:
        return redirect(url_for('user_bp.login'))

    # Para depuración
    print(usuario)

    return render_template('Veterinario/veterinario.html', usuario=usuario)



@user_bp.route('/cliente')
def dashboard_cliente():
    return render_template('Cliente/cliente.html')

