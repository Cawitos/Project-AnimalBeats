from flask import Blueprint, render_template, request, redirect, url_for, current_app
from flask_bcrypt import Bcrypt
from flask import session

Enfermedad_bp = Blueprint('Enfermedad_bp', __name__)

@Enfermedadnfermedad_bp.route('/Enfermedad', methods=['GET'])
def Enfermedad():
    return render_template('/Administrador/Enfermedad.html')

def mostrar_enfermedades():
    conn = current_app.connection
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Enfermedad")
    Enfermedades = cursor.fetchall()
    return render_template('Enfermedades.html', Enfermedades=Enfermedades)


@Enfermedad_bp.route('/agregar_enfermedad', methods=['POST'])
def agregar_enfermedad():
    nombre = request.form['nombre']
    descripcion = request.form['descripcion']

    conn = current_app.connection
    cursor = conn.cursor()
    cursor.execute("INSERT INTO Enfermedad (nombre, descripcion) VALUES (%s, %s)", (nombre, descripcion))
    conn.commit()

    return redirect(url_for('Enfermedad_bp.mostrar_enfermedades'))

@Enfermedad_bp.route('/eliminar_enfermedad/<nombre>', methods=['POST'])
def eliminar_enfermedad(nombre):
    conn = current_app.connection
    cursor = conn.cursor()
    try :
        cursor.execute("DELETE FROM Enfermedad WHERE nombre = %s", (nombre,))
        conn.commit()
        return redirect(url_for('Enfermedad_bp.mostrar_enfermedades'))
    except Exception as e:
        print(f"Error al eliminar la enfermedad: {e}")
        return redirect(url_for('Enfermedad_bp.mostrar_enfermedades'))
        