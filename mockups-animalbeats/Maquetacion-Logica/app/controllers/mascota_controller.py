from flask import Blueprint, render_template, request, redirect, url_for, current_app
user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/Mascotas', methods=['GET', 'POST'])
def Mascotas():
    connection = current_app.connection
    
    return render_template('GestionMascotas.html')

user_bp.route('/Crear-Mascota', methods=['POST'])
def create_mascot():
    connection = current_app.connection
    if request.method == 'POST':
        namec = request.form['nameC']
        edadc = request.form['edadC']
        razaC = request.form['razaC']
        especieC = request.form['especieC']
        n_documento = request.form['n_documento']

        try:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO mascotas (id_cliente, nombre, edad, id_raza, id_especie) VALUES (%s, %s, %s, %s, %s)", (n_documento, namec, edadc, razaC, especieC))
                connection.commit()
            return redirect(url_for('user_bp.GestionMascotas.html'))
        except Exception as e:
            return str(e)
        
    return render_template('Crear_Mascota')