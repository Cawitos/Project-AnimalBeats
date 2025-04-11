from flask import Blueprint, render_template, request, redirect, url_for, current_app, flash, session
especie_bp = Blueprint('especie_bp', __name__)

def is_authenticated():
    return session('correoelectronico') is not None

@especie_bp.route('/Especies', methods=['GET', 'POST'])
def especie():
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, Especie FROM Especie")
            especies = cursor.fetchall()
    except Exception as e:
        return str(e)
    
    return render_template('Administrador/Especies.html', especies=especies)



@especie_bp.route('/Crear-Especie', methods=['GET', 'POST'])
def crear_especie():
    connection = current_app.connection
    if request.method == 'POST':
        Especie = request.form.get('Especie')
        try:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO Especie (Especie) VALUES (%s)", (Especie,))
                connection.commit()
                return redirect(url_for('especie_bp.especie'))
        except Exception as e:
            return str(e)
    return render_template('Administrador/Crear_Especie.html')

    
@especie_bp.route('/Editar-Especie/<int:id_especie>', methods=['GET', 'POST'])
def modificar_especie(id_especie):
    connection = current_app.connection
    if request.method == 'POST':
        Especie = request.form.get('Especie')
        try:
            with connection.cursor() as cursor:
                cursor.execute("UPDATE Especie SET Especie = %s WHERE id = %s", (Especie, id_especie))
                connection.commit()
                return redirect(url_for('especie_bp.especie'))
        except Exception as e:
            return str(e)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM Especie WHERE id = %s", (id_especie))
            especie = cursor.fetchone()
    except Exception as e:
        return str(e)
        
    return render_template('Administrador/Modificar_Especie.html', especie=especie)

@especie_bp.route('/Eliminar-Especie/<int:id_especie>', methods=['GET', 'POST'])
def eliminar_especie(id_especie):
    connection = current_app.connection
    if request.method == 'POST':
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM Especie WHERE id = %s", (id_especie))
                connection.commit()
                flash('Especie eliminada correctamente')
                return redirect(url_for('especie_bp.especie'))
        except Exception as e:
                flash('Error al eliminar la especie: ' + str(e), 'danger')
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM Especie WHERE id = %s", (id_especie))
            especie = cursor.fetchone()
    except Exception as e:
        return str(e)

    return render_template('Administrador/Eliminar_Especie.html', especie=especie)


raza_bp = Blueprint('raza_bp', __name__)

@raza_bp.route('/Razas/<int:id_especie>', methods=['GET'])
def razas(id_especie):
    connection = current_app.connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, raza, descripcion FROM Raza WHERE id_especie = %s", (id_especie,))
            razas = cursor.fetchall()
    except Exception as e:
        return str(e)
    
    return render_template('Administrador/Razas.html', razas=razas, id_especie=id_especie)


@raza_bp.route('/Crear-Raza/<int:id_especie>', methods=['GET', 'POST'])
def crear_raza(id_especie):
    connection = current_app.connection
    if request.method == 'POST':
        Raza=request.form.get('Raza')
        descripcion=request.form.get('descripcion')
        try:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO Raza (Raza, descripcion, id_especie) VALUES (%s, %s, %s)", (Raza, descripcion, id_especie))
                connection.commit()
                return redirect(url_for('raza_bp.razas', id_especie=id_especie))
        except Exception as e:
            return str(e)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM Especie WHERE id = %s", (id_especie))
            especie = cursor.fetchone()
    except Exception as e:
        return str(e)
        
    return render_template('Administrador/Crear_Raza.html', especie=especie)
    

@raza_bp.route('/Editar-raza/<int:id_especie>/<int:id_raza>', methods=['GET', 'POST'])
def modificar_raza(id_especie, id_raza):
    connection = current_app.connection
    if request.method == 'POST':
        Raza=request.form.get('Raza')
        descripcion=request.form.get('descripcion')
        try:
            with connection.cursor() as cursor:
                cursor.execute("UPDATE Raza SET Raza = %s, descripcion = %s WHERE id = %s and id_especie = %s", (Raza, descripcion, id_raza, id_especie))
                connection.commit()
                return redirect(url_for('raza_bp.razas', id_especie=id_especie))
        except Exception as e:
            return str(e)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM Especie WHERE id = %s", (id_especie))
            especie = cursor.fetchone()
    except Exception as e:
        return str(e)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM Raza WHERE id = %s and id_especie = %s", (id_raza, id_especie))
            raza = cursor.fetchone()
    except Exception as e:
        return str(e)
        
    return render_template('Administrador/Modificar_Raza.html', especie=especie, raza=raza)

@raza_bp.route('/Eliminar-Especie/<int:id_especie>/<int:id_raza>', methods=['GET', 'POST'])
def eliminar_raza(id_especie, id_raza):
    connection = current_app.connection
    if request.method == 'POST':
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM Raza WHERE id = %s and id_especie = %s", (id_raza, id_especie))
                connection.commit()
                flash('Raza eliminada correctamente')
                return redirect(url_for('raza_bp.razas', id_especie=id_especie))
        except Exception as e:
                flash('Error al eliminar la raza: ' + str(e), 'danger')
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM Especie WHERE id = %s", (id_especie))
            especie = cursor.fetchone()
    except Exception as e:
        return str(e)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM Raza WHERE id = %s and id_especie = %s", (id_raza, id_especie))
            raza = cursor.fetchone()
    except Exception as e:
        return str(e)

    return render_template('Administrador/Eliminar_Raza.html', especie=especie, raza=raza)