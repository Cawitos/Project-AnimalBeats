from flask import Blueprint, render_template, request, redirect, url_for, current_app, flash
user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/Mascotas', methods=['GET', 'POST'])
def Mascotas():
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_Cliente, Nombre, id_Especie, id_Raza, edad FROM mascotas")
            mascotas = cursor.fetchall()
    except Exception as e:
        return str(e)
    
    return render_template('GestionMascotas.html', mascotas=mascotas)

@user_bp.route('/Crear-Mascota', methods=['GET', 'POST'])
def create_mascot():
    connection = current_app.connection
    if request.method == 'POST':
        namec = request.form['nameC']
        edadc = request.form['edadC']
        razaC = request.form['razaC']
        EspecieC = request.form['EspecieC']
        n_documento = request.form['n_documento']

        try:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO mascotas (id_cliente, nombre, edad, id_raza, id_especie) VALUES (%s, %s, %s, %s, %s)", (n_documento, namec, edadc, razaC, EspecieC))
                connection.commit()
            return redirect(url_for('user_bp.Mascotas'))
        except Exception as e:
            return str(e)
        
    return redirect(url_for('user_bp.Mascotas'))

@user_bp.route('/Editar-Mascota/<int:id_mascota>', methods=['GET', 'POST'])
def edit_mascot(id_mascota):
    connection = current_app.connection
    if request.method == 'POST':
        namec = request.form['nameC']
        edadc = request.form['edadC']
    try:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE mascotas SET nombre = %s, edad = %s WHERE id = %s", (namec, edadc, id_mascota))
            connection.commit()
            flash('Mascota actualizada correctamente')
    except Exception as e:
            flash('Error al actualizar la mascota: ' + str(e), 'danger')

    return redirect(url_for('user_bp.Mascotas'))


@user_bp.route('/Eliminar-Mascota', methods=['GET', 'POST'])
def delete_mascot(id_mascota):
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM mascotas WHERE id = %s", (id_mascota))
            connection.commit()
            flash('Mascota eliminada correctamente')
    except Exception as e:
            flash('Error al eliminar la mascota: ' + str(e), 'danger')

    return redirect(url_for('user_bp.Mascotas'))

@user_bp.route('/Historial-Mascota/<int:id_mascota>', methods=['GET', 'POST'])
def historial(id_mascota):
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("select M.id, M.id_Cliente, M.nombre, M.id_Especie, M.id_Raza, M.edad, A.fecha, A.descripcion from mascota M join alertas A on M.id=A.id_mascota WHERE M.id = %s", (id_mascota,))
            historiales=cursor.fetchall()
    except Exception as e:
        flash('Error al encontrar historial: ' + str(e), 'danger')

    return render_template('Historial_Mascota.html', historiales=historiales)