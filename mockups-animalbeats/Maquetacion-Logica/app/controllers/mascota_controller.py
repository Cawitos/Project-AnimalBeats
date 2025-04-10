from flask import Blueprint, render_template, request, redirect, url_for, current_app, flash, session
mascotas_bp = Blueprint('mascotas_bp', __name__)

def is_authenticated():
    return session.get('correoelectronico') is not None

@mascotas_bp.route('/Mascotas', methods=['GET', 'POST'])
def Mascotas():
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_Cliente, Nombre, id_Especie, id_Raza, edad FROM mascota")
            mascotas = cursor.fetchall()
    except Exception as e:
        return str(e)
    
    return render_template('Administrador/GestionMascotas.html', mascotas=mascotas)

@mascotas_bp.route('/Crear-Mascota', methods=['GET', 'POST'])
def create_mascot():
    connection = current_app.connection
    if request.method == 'POST':
        nombreM = request.form.get('nombreM')
        especieM = request.form.get('especieM')
        razaM = request.form.get('razaM')
        edadM = request.form.get('edadM')
        n_documento = request.form.get('n_documento')

        try:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO mascota (id_cliente, nombre, edad, id_raza, id_especie) VALUES (%s, %s, %s, %s, %s)", (n_documento, nombreM, edadM, razaM, especieM))
                connection.commit()
            return redirect(url_for('mascotas_bp.Mascotas'))
        except Exception as e:
            return str(e)
        
    return render_template('Administrador/Crear_Mascota.html')

@mascotas_bp.route('/Editar-Mascota/<int:id_mascota>', methods=['GET', 'POST'])
def edit_mascot(id_mascota):
    connection = current_app.connection
    if request.method == 'POST':
        nombreM = request.form['nombreM']
        edadM = request.form['edadM']
    try:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE mascota SET nombre = %s, edad = %s WHERE id = %s", (nombreM, edadM, id_mascota))
            connection.commit()
            flash('Mascota actualizada correctamente')
            return redirect(url_for('mascotas_bp.Mascotas'))
    except Exception as e:
            flash('Error al actualizar la mascota: ' + str(e), 'danger')

    return render_template('Administrador/Modificar_Mascota.html')


@mascotas_bp.route('/Eliminar-Mascota/<int:id_mascota>', methods=['GET', 'POST'])
def delete_mascot(id_mascota):
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM mascota WHERE id = %s", (id_mascota))
            connection.commit()
            flash('Mascota eliminada correctamente')
            return redirect(url_for('mascotas_bp.Mascotas'))
    except Exception as e:
            flash('Error al eliminar la mascota: ' + str(e), 'danger')

    return render_template('Administrador/Eliminar_Mascota.html')

@mascotas_bp.route('/Historial-Mascota/<int:id_mascota>', methods=['GET', 'POST'])
def historial(id_mascota):
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("select M.id, M.id_Cliente, M.nombre, M.id_Especie, M.id_Raza, M.edad, A.fecha, A.descripcion from mascota M join alertas A on M.id=A.id_mascota WHERE M.id = %s", (id_mascota,))
            historiales=cursor.fetchall()
    except Exception as e:
        flash('Error al encontrar historial: ' + str(e), 'danger')

    return render_template('Historial_Mascota.html', historiales=historiales)