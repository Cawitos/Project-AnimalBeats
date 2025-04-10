from flask import Blueprint, render_template, request, redirect, url_for, current_app, flash
from flask_bcrypt import Bcrypt
from flask import flash

gestion_bp = Blueprint('gestion_bp', __name__)
bcrypt = Bcrypt()

@gestion_bp.route('/gestion-usuarios')
def gestion_usuarios():
    connection = current_app.connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT n_documento, correoelectronico FROM Usuarios")
        usuarios = cursor.fetchall()
    return render_template('Administrador/GestionDeUsuarios.html', usuarios=usuarios)

@gestion_bp.route('/usuarios/consultar/<id>')
def consultar_usuario(id):
    connection = current_app.connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT n_documento, correoelectronico FROM Usuarios WHERE n_documento = %s", (id,))
        resultado = cursor.fetchone()
        if resultado:
            usuario = {
                'n_documento': resultado['n_documento'],
                'correoelectronico': resultado['correoelectronico']
            }
            return render_template('Administrador/ConsultarUsuario.html', usuario=usuario)
        else:
            return "Usuario no encontrado"


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





