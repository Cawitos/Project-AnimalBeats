from flask import Blueprint, render_template, request, redirect, url_for, current_app, flash
from flask_bcrypt import Bcrypt
from flask import flash

gestion_bp = Blueprint('gestion_bp', __name__)
bcrypt = Bcrypt()

@gestion_bp.route('/gestion-usuarios')
def gestion_usuarios():
    connection = current_app.connection
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT Usuarios.n_documento, Usuarios.correoelectronico, Documento.tipo
            FROM Usuarios
            JOIN Documento ON Usuarios.id_documento = Documento.id
            WHERE Usuarios.estado = 'ACTIVO'
        """)
        usuarios = cursor.fetchall()
    return render_template('Administrador/GestionDeUsuarios.html', usuarios=usuarios)





@gestion_bp.route('/usuarios/consultar/<id>')
def consultar_usuario(id):
    connection = current_app.connection
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT Usuarios.n_documento, Usuarios.correoelectronico, Documento.tipo
            FROM Usuarios
            JOIN Documento ON Usuarios.id_documento = Documento.id
            WHERE Usuarios.n_documento = %s
        """, (id,))
        resultado = cursor.fetchone()
        if resultado:
            usuario = {
                'n_documento': resultado['n_documento'],
                'correoelectronico': resultado['correoelectronico'],
                'tipo_documento': resultado['tipo']
            }
            return render_template('Administrador/ConsultarUsuario.html', usuario=usuario)
        else:
            return "Usuario no encontrado"

@gestion_bp.route('/crear-usuario', methods=['GET', 'POST'])
def crear_usuario():
    connection = current_app.connection

    if request.method == 'POST':
        n_documento = request.form['n_documento']
        id_documento = request.form['id_documento']
        correoelectronico = request.form['correoelectronico']
        contrasena = request.form['contrasena']
        rol_nombre = request.form['rol']

        if not contrasena:
            return "Contraseña vacía. Por favor, ingrésala."

        hashed_password = bcrypt.generate_password_hash(contrasena).decode('utf-8')

        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM Rol WHERE rol = %s", (rol_nombre,))
            rol_resultado = cursor.fetchone()

            if not rol_resultado:
                return "Rol no válido."

            id_rol = rol_resultado['id']

            cursor.execute("""
                INSERT INTO Usuarios (n_documento, correoelectronico, contrasena, id_documento, id_rol, estado)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (n_documento, correoelectronico, hashed_password, id_documento, id_rol, 'ACTIVO'))

            connection.commit()

        return redirect(url_for('gestion_bp.gestion_usuarios'))

    with connection.cursor() as cursor:
        cursor.execute("SELECT id, tipo FROM Documento")
        tipos_documento = cursor.fetchall()

    return render_template('Administrador/CrearUsuario.html', tipos_documento=tipos_documento)




@gestion_bp.route('/usuarios/modificar/<id>', methods=['GET', 'POST'])
def modificar_usuario(id):
    connection = current_app.connection
    with connection.cursor() as cursor:
        if request.method == 'POST':
            nuevo_documento = request.form['n_documento']
            nuevo_correo = request.form['correoelectronico']
            nueva_contrasena = request.form['contrasena']
            hashed_password = bcrypt.generate_password_hash(nueva_contrasena).decode('utf-8')

            cursor.execute("""
                UPDATE Usuarios
                SET n_documento=%s, correoelectronico=%s, contrasena=%s
                WHERE n_documento=%s
            """, (nuevo_documento, nuevo_correo, hashed_password, id))
            connection.commit()
            return redirect(url_for('gestion_bp.gestion_usuarios'))

        cursor.execute("SELECT n_documento, correoelectronico FROM Usuarios WHERE n_documento = %s", (id,))
        resultado = cursor.fetchone()
        if resultado:
            usuario = {
                'n_documento': resultado['n_documento'],
                'correoelectronico': resultado['correoelectronico']
            }
            return render_template('Administrador/ModificarUsuario.html', usuario=usuario)
        else:
            return "Usuario no encontrado"
        
@gestion_bp.route('/usuario/<n_documento>/eliminar', methods=['GET'])
def suspender_usuario(n_documento):
    connection = current_app.connection
    with connection.cursor() as cursor:
        cursor.execute("UPDATE Usuarios SET estado = 'INACTIVO' WHERE n_documento = %s", (n_documento,))
        connection.commit()
    flash('Usuario suspendido con éxito.')
    return redirect(url_for('gestion_bp.gestion_usuarios'))
