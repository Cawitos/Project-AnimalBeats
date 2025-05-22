from flask import Blueprint, render_template, request, redirect, url_for, current_app
from flask_bcrypt import Bcrypt
from flask import session

citas_bp = Blueprint('Citas_bp', __name__)

@citas_bp_bp.route('/Citas_bp', methods=['GET'])
def Citas():
    return render_template('/Administrador/Citas.html')

def mostrar_Citas():
    conn = current_app.connection
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Citas")
    Citas = cursor.fetchall()
    return render_template('Citas.html', Citas=Citas)


@citas_bp.route('/agregar_Citas', methods=['POST'])
def agregar_Citas():
    nombre = request.form['nombre']
    descripcion = request.form['descripcion']

    conn = current_app.connection
    cursor = conn.cursor()
    cursor.execute("INSERT INTO Citas (nombre, descripcion) VALUES (%s, %s)", (nombre, descripcion))
    conn.commit()

    return redirect(url_for('Citas_bp.mostrar_Citas'))

@citas_bp.route('/eliminar_Citas/<nombre>', methods=['POST'])
def eliminar_Citas(nombre):
    conn = current_app.connection
    cursor = conn.cursor()
    try :
        cursor.execute("DELETE FROM Citas WHERE nombre = %s", (nombre,))
        conn.commit()
        return redirect(url_for('Citas_bp.mostrar_Citas'))
    except Exception as e:
        print(f"Error al eliminar la Citas: {e}")
        return redirect(url_for('Citas_bp.mostrar_Citas'))
        