from flask import Blueprint, render_template, request, redirect, url_for, current_app, flash, session

citas_bp = Blueprint('citas_bp', __name__)

def is_authenticated():
    return 'correoelectronico' in session

@citas_bp.route('/Citas', methods=['GET'])
def citas():
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT c.id_Mascota, c.Fecha, c.Descripcion, m.Nombre AS mascota, u.correoelectronico AS cliente, s.servicio
                FROM Citas c
                JOIN Mascota m ON c.id_Mascota = m.id
                JOIN Usuarios u ON c.id_cliente = u.n_documento
                JOIN Servicios s ON c.id_Servicio = s.id
            """)
            citas = cursor.fetchall()
    except Exception as e:
        flash(f"Error al cargar las citas: {e}", 'danger')
        return redirect(url_for('dashboard'))

    return render_template('Administrador/Citas.html', citas=citas)

@citas_bp.route('/Crear-Cita', methods=['GET', 'POST'])
def crear_cita():
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection

    if request.method == 'POST':
        id_mascota = request.form.get('id_mascota')
        id_cliente = request.form.get('id_cliente')
        id_servicio = request.form.get('id_servicio')
        fecha = request.form.get('fecha')
        descripcion = request.form.get('descripcion')

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO Citas (id_Mascota, id_cliente, id_Servicio, Fecha, Descripcion)
                    VALUES (%s, %s, %s, %s, %s)
                """, (id_mascota, id_cliente, id_servicio, fecha, descripcion))
                connection.commit()
                flash('Cita creada exitosamente', 'success')
                return redirect(url_for('citas_bp.citas'))
        except Exception as e:
            flash(f"Error al crear la cita: {e}", 'danger')

    return render_template('Administrador/Crear_Cita.html')

@citas_bp.route('/Modificar-Cita/<int:id>', methods=['GET', 'POST'])
def modificar_cita(id):
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection

    if request.method == 'POST':
        fecha = request.form.get('fecha')
        descripcion = request.form.get('descripcion')

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE Citas
                    SET Fecha = %s, Descripcion = %s
                    WHERE id_Mascota = %s
                """, (fecha, descripcion, id))
                connection.commit()
                flash('Cita modificada exitosamente', 'success')
                return redirect(url_for('citas_bp.citas'))
        except Exception as e:
            flash(f"Error al modificar la cita: {e}", 'danger')

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT c.id_Mascota, c.Fecha, c.Descripcion, m.Nombre AS mascota
                FROM Citas c
                JOIN Mascota m ON c.id_Mascota = m.id
                WHERE c.id_Mascota = %s
            """, (id,))
            cita = cursor.fetchone()
    except Exception as e:
        flash(f"Error al cargar la cita: {e}", 'danger')
        return redirect(url_for('citas_bp.citas'))

    return render_template('Administrador/Modificar_Cita.html', cita=cita)

@citas_bp.route('/Eliminar-Cita/<int:id>', methods=['POST'])
def eliminar_cita(id):
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection

    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM Citas WHERE id_Mascota = %s", (id,))
            connection.commit()
            flash('Cita eliminada exitosamente', 'success')
    except Exception as e:
        flash(f"Error al eliminar la cita: {e}", 'danger')

    return redirect(url_for('citas_bp.citas'))