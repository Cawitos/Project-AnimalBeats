from flask import Blueprint, render_template, request, redirect, url_for, current_app, flash, session, jsonify
mascotas_bp = Blueprint('mascotas_bp', __name__)

def is_authenticated():
    return session.get('correoelectronico') is not None

@mascotas_bp.route('/Mascotas', methods=['GET', 'POST'])
def Mascotas():
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT M.id, C.id_Usuario, M.nombre, E.Especie, R.Raza, M.edad FROM mascota M join Especie E on id_Especie=E.id join Raza R on id_Raza=R.id join Cliente C on id_Cliente=C.id where estado = 'ACTIVO'")
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
                cursor.execute("SELECT id FROM cliente WHERE id_usuario = %s", (n_documento,))
                cliente = cursor.fetchone()
            
            if cliente is None:
                return "Error: El cliente especificado no existe."

            id_cliente = cliente['id']
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO mascota (id_cliente, nombre, edad, id_raza, id_especie, estado) VALUES (%s, %s, %s, %s, %s, %s)", (id_cliente, nombreM, edadM, razaM, especieM, 'ACTIVO'))
                connection.commit()

            # Mensaje de éxito antes de redirigir
            flash("Mascota creada con éxito.")
            return redirect(url_for('mascotas_bp.Mascotas'))

        except Exception as e:
            return str(e)

    # GET method - cargar especies y razas
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, Especie FROM Especie")
            especies = cursor.fetchall()

    except Exception as e:
        return str(e)

    return render_template('Administrador/Crear_Mascota.html', especies=especies)




@mascotas_bp.route('/get-razas/<int:especie_id>', methods=['GET'])
def get_razas(especie_id):
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, Raza FROM Raza WHERE id_especie = %s", (especie_id,))
            razas = cursor.fetchall()
            return jsonify(razas)
    except Exception as e:
        return jsonify({'error': str(e)})




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
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM mascota WHERE id = %s", (id_mascota))
            mascota = cursor.fetchone()
    except Exception as e:
        return str(e)

    return render_template('Administrador/Modificar_Mascota.html', mascota=mascota)


@mascotas_bp.route('/Eliminar-Mascota/<int:id_mascota>', methods=['GET', 'POST'])
def delete_mascot(id_mascota):
    connection = current_app.connection
    if request.method == 'POST':
        try:
            with connection.cursor() as cursor:
                cursor.execute("update mascota set estado = 'INACTIVO' where id = %s", (id_mascota))
                connection.commit()
                flash('Mascota eliminada correctamente')
                return redirect(url_for('mascotas_bp.Mascotas'))
        except Exception as e:
                flash('Error al eliminar la mascota: ' + str(e), 'danger')
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM mascota WHERE id = %s", (id_mascota))
            mascota = cursor.fetchone()
    except Exception as e:
        return str(e)
    
    return render_template('Administrador/Eliminar_Mascota.html', mascota=mascota)

@mascotas_bp.route('/Historial-Mascota/<int:id_mascota>', methods=['GET', 'POST'])
def historial(id_mascota):
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT M.id, C.id_Usuario, M.nombre, E.Especie, R.Raza, M.edad FROM mascota M join Especie E on id_Especie=E.id join Raza R on id_Raza=R.id join Cliente C on id_Cliente=C.id WHERE M.id = %s", (id_mascota,))
            mascota_info = cursor.fetchone()
            print(mascota_info)
            if mascota_info is None:
                flash('No se encontró información de la mascota.', 'danger')
                return redirect(url_for('mascotas_bp.Mascotas'))
            
            cursor.execute("SELECT A.fecha, A.descripcion FROM mascota M JOIN alertas A ON M.id = A.id_mascota WHERE M.id = %s", (id_mascota,))
            historial_medico = cursor.fetchall()
            print(historial_medico)
    except Exception as e:
        flash('Error al encontrar historial: ' + str(e), 'danger')

    return render_template('Administrador/Historial_Mascota.html', mascota_info=mascota_info, historial_medico=historial_medico)
