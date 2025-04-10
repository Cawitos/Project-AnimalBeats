from flask import Blueprint, render_template, request, redirect, url_for, current_app, jsonify

reportes_bp = Blueprint('reportes', __name__)

@reportes_bp.route('/gestion-reportes')
def gestion_reportes():
    connection = current_app.connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM Alertas")
        alertas = cursor.fetchall()
    return render_template('Administrador/GestionReportes.html', alertas=alertas)


@reportes_bp.route('/alertas/guardar', methods=['POST'])
def guardar_alerta():
    connection = current_app.connection
    try:
        veterinario = request.form['veterinario']
        cliente = request.form['cliente']
        mascota = request.form['mascota']
        fecha = request.form['fecha']
        descripcion = request.form['descripcion']

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO Alertas (id_Veterinario, id_Cliente, id_Mascota, Fecha, descripcion)
                VALUES (%s, %s, %s, %s, %s)
            """, (veterinario, cliente, mascota, fecha, descripcion))
            connection.commit()

        return redirect(url_for('reportes.gestion_reportes'))

    except Exception as e:
        return f"Error al guardar la alerta: {str(e)}", 500

@reportes_bp.route('/alertas/modificar/<id>', methods=['GET', 'POST'])
def modificar_alerta(id):
    connection = current_app.connection
    with connection.cursor() as cursor:
        if request.method == 'POST':
            veterinario = request.form['veterinario']
            cliente = request.form['cliente']
            mascota = request.form['mascota']
            fecha = request.form['fecha']
            descripcion = request.form['descripcion']

            cursor.execute("""
                UPDATE Alertas
                SET id_Veterinario=%s, id_Cliente=%s, id_Mascota=%s, Fecha=%s, descripcion=%s
                WHERE id=%s
            """, (veterinario, cliente, mascota, fecha, descripcion, id))
            connection.commit()
            return redirect(url_for('reportes.gestion_reportes'))

        cursor.execute("SELECT * FROM Alertas WHERE id = %s", (id,))
        resultado = cursor.fetchone()
        if resultado:
            return render_template('Administrador/ModificarAlerta.html', alerta=resultado)
        else:
            return "Alerta no encontrada"


@reportes_bp.route('/alertas/eliminar/<id>', methods=['POST'])
def eliminar_alerta(id):
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM Alertas WHERE id = %s", (id,))
            connection.commit()

        return redirect(url_for('reportes.gestion_reportes'))

    except Exception as e:
        return jsonify({'error': str(e)}), 500
