from flask import Blueprint, render_template, request, redirect, session, url_for, jsonify
from config import Config

reportes_bp = Blueprint('reportes', __name__)

@reportes_bp.route('/gestion_reportes')
def gestion_reportes():
    if 'usuario' not in session:
        return redirect(url_for('auth.login'))

    conn = Config()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM Alertas")
    alertas = cursor.fetchall()

    return render_template('GestionReportes.html', alertas=alertas)


@reportes_bp.route('/guardar_alerta', methods=['POST'])
def guardar_alerta():
    if 'usuario' not in session:
        return redirect(url_for('auth.login'))

    try:
        veterinario = request.form['veterinario']
        cliente = request.form['cliente']
        mascota = request.form['mascota']
        fecha = request.form['fecha']
        descripcion = request.form['descripcion']

        conn = Config()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO Alertas (id_Veterinario, id_Cliente, id_Mascota, Fecha, descripcion)
            VALUES (%s, %s, %s, %s, %s)
        """, (veterinario, cliente, mascota, fecha, descripcion))

        conn.commit()
        return redirect(url_for('reportes.gestion_reportes'))

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@reportes_bp.route('/editar_alerta', methods=['POST'])
def editar_alerta():
    if 'usuario' not in session:
        return redirect(url_for('auth.login'))

    try:
        alerta_id = request.form['id']
        veterinario = request.form['veterinario']
        cliente = request.form['cliente']
        mascota = request.form['mascota']
        fecha = request.form['fecha']
        descripcion = request.form['descripcion']

        conn = Config()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE Alertas
            SET id_Veterinario=%s, id_Cliente=%s, id_Mascota=%s, Fecha=%s, descripcion=%s
            WHERE id=%s
        """, (veterinario, cliente, mascota, fecha, descripcion, alerta_id))

        conn.commit()
        return redirect(url_for('reportes.gestion_reportes'))

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@reportes_bp.route('/eliminar_alerta', methods=['POST'])
def eliminar_alerta():
    if 'usuario' not in session:
        return redirect(url_for('auth.login'))

    try:
        alerta_id = request.form['id']

        conn = Config()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Alertas WHERE id=%s", (alerta_id,))
        conn.commit()

        return redirect(url_for('reportes.gestion_reportes'))

    except Exception as e:
        return jsonify({'error': str(e)}), 500
