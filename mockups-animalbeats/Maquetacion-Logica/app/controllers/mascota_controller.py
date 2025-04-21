from flask import Blueprint, render_template, request, redirect, url_for, current_app, flash, session, jsonify

mascotas_bp = Blueprint('mascotas_bp', __name__)

def is_authenticated():
    return 'n_documento' in session and 'correoelectronico' in session

@mascotas_bp.route('/Mascotas', methods=['GET', 'POST'])
def Mascotas():
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    n_documento = session.get('n_documento')
    id_rol = session.get('id_rol')

    try:
        with connection.cursor() as cursor:
           
            if id_rol == 1: 
                cursor.execute("""
                    SELECT M.id, M.id_cliente, M.nombre, E.Especie, R.Raza, M.edad 
                    FROM Mascota M 
                    JOIN Especie E ON M.id_Especie = E.id 
                    JOIN Raza R ON M.id_Raza = R.id 
                    WHERE M.estado = 'ACTIVO'
                """)
                template = 'Administrador/GestionMascotas.html'
            elif id_rol == 3:
                cursor.execute("""
                    SELECT M.id, M.id_cliente, M.nombre, E.Especie, R.Raza, M.edad 
                    FROM Mascota M 
                    JOIN Especie E ON M.id_Especie = E.id 
                    JOIN Raza R ON M.id_Raza = R.id 
                    WHERE M.estado = 'ACTIVO'
                """)
                template = 'Veterinario/GestionMascotas.html'
            else:
                cursor.execute("""
                    SELECT M.id, M.id_cliente, M.nombre, E.Especie, R.Raza, M.edad 
                    FROM Mascota M 
                    JOIN Especie E ON M.id_Especie = E.id 
                    JOIN Raza R ON M.id_Raza = R.id 
                    WHERE M.estado = 'ACTIVO' AND M.id_cliente = %s
                """, (n_documento,))
                template = 'Cliente/GestionMascotas.html'

            mascotas = cursor.fetchall()
    except Exception as e:
        return str(e)

    return render_template(template, mascotas=mascotas)


@mascotas_bp.route('/Crear-Mascota', methods=['GET', 'POST'])
def create_mascot():
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

    if request.method == 'POST':
        nombreM = request.form.get('nombreM')
        especieM = request.form.get('especieM')
        razaM = request.form.get('razaM')
        edadM = request.form.get('edadM')
        n_documento = request.form.get('n_documento')

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT n_documento FROM Usuarios WHERE n_documento = %s", (n_documento,))
                cliente = cursor.fetchone()
            
            if cliente is None:
                return "Error: El cliente especificado no existe."

            id_cliente = cliente['n_documento']
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO mascota (id_cliente, nombre, edad, id_raza, id_especie, estado) VALUES (%s, %s, %s, %s, %s, %s)", (id_cliente, nombreM, edadM, razaM, especieM, 'ACTIVO'))
                connection.commit()

            flash("Mascota creada con éxito.")

            return redirect(url_for('mascotas_bp.Mascotas'))

        except Exception as e:
            return str(e)

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, Especie FROM Especie")
            especies = cursor.fetchall()

    except Exception as e:
        return str(e)

    
    if id_rol == 1:
        return render_template('Administrador/Crear_Mascota.html', especies=especies)
    elif id_rol == 3: 
        return render_template('Veterinario/Crear_Mascota.html', especies=especies)
    else:
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
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

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


    if id_rol == 1: 
        return render_template('Administrador/Modificar_Mascota.html', mascota=mascota)
    elif id_rol == 3:  
        return render_template('Veterinario/Modificar_Mascota.html', mascota=mascota)
    else:  
        return render_template('Administrador/Modificar_Mascota.html', mascota=mascota)

@mascotas_bp.route('/Eliminar-Mascota/<int:id_mascota>', methods=['GET', 'POST'])
def delete_mascot(id_mascota):
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

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
    
    
    if id_rol == 1:  
        return render_template('Administrador/Eliminar_Mascota.html', mascota=mascota)
    elif id_rol == 3:  
        return render_template('Veterinario/Eliminar_Mascota.html', mascota=mascota)
    else:  
        return render_template('Administrador/Eliminar_Mascota.html', mascota=mascota)

@mascotas_bp.route('/Historial-Mascota/<int:id_mascota>', methods=['GET', 'POST'])
def historial(id_mascota):
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT M.id, M.id_cliente, M.nombre, E.Especie, R.Raza, M.edad FROM mascota M join Especie E on id_Especie=E.id join Raza R on id_Raza=R.id WHERE M.id = %s", (id_mascota,))
            mascota_info = cursor.fetchone()

            if mascota_info is None:
                flash('No se encontró información de la mascota.', 'danger')
                return redirect(url_for('mascotas_bp.Mascotas'))
            
            cursor.execute("SELECT A.fecha, A.descripcion FROM mascota M JOIN alertas A ON M.id = A.id_mascota WHERE M.id = %s", (id_mascota,))
            historial_medico = cursor.fetchall()

    except Exception as e:
        flash('Error al encontrar historial: ' + str(e), 'danger')

    
    if id_rol == 1: 
        return render_template('Administrador/Historial_Mascota.html', mascota_info=mascota_info, historial_medico=historial_medico)
    elif id_rol == 3:  
        return render_template('Veterinario/Historial_Mascota.html', mascota_info=mascota_info, historial_medico=historial_medico)
    else: 
        return render_template('Cliente/Historial_Mascota.html', mascota_info=mascota_info, historial_medico=historial_medico)

