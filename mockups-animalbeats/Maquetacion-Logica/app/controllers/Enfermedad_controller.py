from flask import Blueprint, render_template, request, redirect, url_for, current_app, flash, session, jsonify

enfermedad_bp = Blueprint('enfermedad_bp', __name__)

def is_authenticated():
    return 'correoelectronico' in session

## Enfermedad routes
@enfermedad_bp.route('/Enfermedades', methods=['GET', 'POST'])
def enfermedades():
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, nombre, descripcion FROM Enfermedad")
            enfermedades = cursor.fetchall()
    except Exception as e:
        return str(e)
    
    if id_rol == 1:
        return render_template('Administrador/Enfermedades.html', enfermedades=enfermedades)
    elif id_rol == 3:
        return render_template('Veterinario/Enfermedades.html', enfermedades=enfermedades)
    else:
        return render_template('Cliente/Enfermedades.html', enfermedades=enfermedades)

@enfermedad_bp.route('/Crear-Enfermedad', methods=['GET', 'POST'])
def crear_enfermedad():
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

    if request.method == 'POST':
        nombre = request.form.get('nombre')
        descripcion = request.form.get('descripcion')
        try:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO Enfermedad (nombre, descripcion) VALUES (%s, %s)", (nombre, descripcion))
                connection.commit()
                return redirect(url_for('enfermedad_bp.enfermedades'))
        except Exception as e:
            return str(e)
    
    if id_rol == 1:
        return render_template('Administrador/Crear_Enfermedad.html')
    elif id_rol == 3:
        return render_template('Veterinario/Crear_Enfermedad.html')

@enfermedad_bp.route('/Editar-Enfermedad/<int:id_enfermedad>', methods=['GET', 'POST'])
def modificar_enfermedad(id_enfermedad):
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

    if request.method == 'POST':
        nombre = request.form.get('nombre')
        descripcion = request.form.get('descripcion')
        try:
            with connection.cursor() as cursor:
                cursor.execute("UPDATE Enfermedad SET nombre = %s, descripcion = %s WHERE id = %s", (nombre, descripcion, id_enfermedad))
                connection.commit()
                return redirect(url_for('enfermedad_bp.enfermedades'))
        except Exception as e:
            return str(e)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, nombre, descripcion FROM Enfermedad WHERE id = %s", (id_enfermedad,))
            enfermedad = cursor.fetchone()
    except Exception as e:
        return str(e)
        
    if id_rol == 1:
        return render_template('Administrador/Modificar_Enfermedad.html', enfermedad=enfermedad)
    elif id_rol == 3:
        return render_template('Veterinario/Modificar_Enfermedad.html', enfermedad=enfermedad)

@enfermedad_bp.route('/Eliminar-Enfermedad/<int:id_enfermedad>', methods=['GET', 'POST'])
def eliminar_enfermedad(id_enfermedad):
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

    if request.method == 'POST':
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM Enfermedad WHERE id = %s", (id_enfermedad,))
                connection.commit()
                flash('Enfermedad eliminada correctamente')
                return redirect(url_for('enfermedad_bp.enfermedades'))
        except Exception as e:
            flash('Error al eliminar la enfermedad: ' + str(e), 'danger')
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, nombre FROM Enfermedad WHERE id = %s", (id_enfermedad,))
            enfermedad = cursor.fetchone()
    except Exception as e:
        return str(e)

    if id_rol == 1:
        return render_template('Administrador/Eliminar_Enfermedad.html', enfermedad=enfermedad)
    elif id_rol == 3:
        return render_template('Veterinario/Eliminar_Enfermedad.html', enfermedad=enfermedad)