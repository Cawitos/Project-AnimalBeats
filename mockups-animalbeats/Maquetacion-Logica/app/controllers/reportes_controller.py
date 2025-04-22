from flask import Blueprint, render_template, request, redirect, url_for, current_app, jsonify
from datetime import datetime

reportes_bp = Blueprint('reportes', __name__)

# Mostrar todas las alertas
@reportes_bp.route('/gestion-reportes')
def gestion_reportes():
    connection = current_app.connection
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT Alertas.id, Alertas.id_Mascota, Mascota.Nombre AS nombre_mascota,
                   Alertas.id_cliente, Alertas.Fecha, Alertas.descripcion
            FROM Alertas
            JOIN Mascota ON Alertas.id_Mascota = Mascota.id
        """)
        alertas = cursor.fetchall()
    return render_template('Administrador/GestionReportes.html', alertas=alertas)

@reportes_bp.route('/alertas/guardar', methods=['POST'])
def guardar_alerta():
    connection = current_app.connection
    try:
        cliente = request.form['cliente']
        mascota = request.form['mascota']
        fecha = request.form['fecha']
        descripcion = request.form['descripcion']

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO Alertas (id_cliente, id_Mascota, Fecha, descripcion)
                VALUES (%s, %s, %s, %s)
            """, (cliente, mascota, fecha, descripcion))
            connection.commit()

        return redirect(url_for('reportes.gestion_reportes'))

    except Exception as e:
        return f"Error al guardar la alerta: {str(e)}", 500

@reportes_bp.route('/alertas/modificar/<id>', methods=['GET', 'POST'])
def modificar_alerta(id):
    connection = current_app.connection
    with connection.cursor() as cursor:
        if request.method == 'POST':
            cliente = request.form['cliente']
            mascota = request.form['mascota']
            fecha = request.form['fecha']
            descripcion = request.form['descripcion']

            cursor.execute("""
                UPDATE Alertas
                SET id_cliente=%s, id_Mascota=%s, Fecha=%s, descripcion=%s
                WHERE id=%s
            """, (cliente, mascota, fecha, descripcion, id))
            connection.commit()
            return redirect(url_for('reportes.gestion_reportes'))

        cursor.execute("SELECT * FROM Alertas WHERE id = %s", (id,))
        alerta = cursor.fetchone()

        if alerta and isinstance(alerta['Fecha'], datetime):
            alerta['Fecha'] = alerta['Fecha'].strftime('%Y-%m-%d')

        cursor.execute("SELECT n_documento FROM Usuarios WHERE id_rol = 2") 
        clientes = cursor.fetchall()

        cursor.execute("SELECT id, Nombre FROM Mascota")
        mascotas = cursor.fetchall()

    if alerta:
        return render_template(
            'Administrador/ModificarAlerta.html',
            alerta=alerta,
            clientes=clientes,
            mascotas=mascotas
        )
    else:
        return "Alerta no encontrada", 404
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
