from flask import Blueprint, render_template, request, redirect, url_for, current_app, flash, session, jsonify
import os
from werkzeug.utils import secure_filename

especie_bp = Blueprint('especie_bp', __name__)
raza_bp = Blueprint('raza_bp', __name__)

def is_authenticated():
    return 'correoelectronico' in session


@especie_bp.route('/Especies', methods=['GET', 'POST'])
def especie():
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, Especie, imagen FROM Especie")
            especies = cursor.fetchall()
    except Exception as e:
        return str(e)
    
    if id_rol == 1:
        return render_template('Administrador/Especies.html', especies=especies)
    elif id_rol == 3:
        return render_template('Veterinario/Especies.html', especies=especies)
    else:
        return render_template('Cliente/Especies.html', especies=especies)
    
@especie_bp.route('/Especies-C', methods=['GET', 'POST'])
def especieC():
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, Especie, imagen FROM Especie")
            especies = cursor.fetchall()
    except Exception as e:
        return str(e)
    
    if id_rol == 1:
        return render_template('Administrador/C-Especies.html', especies=especies)
    elif id_rol == 3:
        return render_template('Veterinario/C-Especies.html', especies=especies)


@especie_bp.route('/Crear-Especie', methods=['GET', 'POST'])
def crear_especie():
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

    if request.method == 'POST':
        # Obtener datos del formulario
        nombre_especie = request.form.get('Especie')
        
        # Validar que nombre_especie no sea vacío o None
        if not nombre_especie:
            return "El nombre de la especie es obligatorio", 400
        
        # Manejo de la imagen
        file_path = 'img/Especies/default.png'
        imagen = request.files.get('imagen')
        
        if imagen and imagen.filename:
            print(f"Archivo recibido: {imagen.filename}")
    
            # Configurar rutas
            images_dir = os.path.join(current_app.root_path, 'static/img/Especies')
            os.makedirs(images_dir, exist_ok=True)
    
            # Generar nombre seguro
            filename = secure_filename(imagen.filename)
            file_path = os.path.join('img/Especies', filename).replace("\\", "/")
    
            # Guardar imagen
            imagen.save(os.path.join(images_dir, filename))
            print(f"Imagen guardada en: {file_path}")

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO Especie (Especie, imagen) VALUES (%s, %s)",
                    (nombre_especie, file_path)
                )
            connection.commit()
            return redirect(url_for('especie_bp.especie'))
                
        except Exception as e:
            return str(e)

    if id_rol == 1:
        return render_template('Administrador/Crear_Especie.html')
    elif id_rol == 3:
        return render_template('Veterinario/Crear_Especie.html')


@especie_bp.route('/Editar-Especie/<int:id_especie>', methods=['GET', 'POST'])
def modificar_especie(id_especie):
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

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
            cursor.execute("SELECT id, Especie FROM Especie WHERE id = %s", (id_especie,))
            especie = cursor.fetchone()
    except Exception as e:
        return str(e)
        
    if id_rol == 1:
        return render_template('Administrador/Modificar_Especie.html', especie=especie)
    elif id_rol == 3:
        return render_template('Veterinario/Modificar_Especie.html', especie=especie)

@especie_bp.route('/Eliminar-Especie/<int:id_especie>', methods=['GET', 'POST'])
def eliminar_especie(id_especie):
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

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
            cursor.execute("SELECT id, Especie FROM Especie WHERE id = %s", (id_especie,))
            especie = cursor.fetchone()
    except Exception as e:
        return str(e)

    if id_rol == 1:
        return render_template('Administrador/Eliminar_Especie.html', especie=especie)
    elif id_rol == 3:
        return render_template('Veterinario/Eliminar_Especie.html', especie=especie)


@raza_bp.route('/Razas/<int:id_especie>', methods=['GET'])
def razas(id_especie):
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, raza, descripcion, imagen FROM Raza WHERE id_especie = %s", (id_especie,))
            razas = cursor.fetchall()
    except Exception as e:
        return str(e)
    
    if id_rol == 1:
        return render_template('Administrador/Razas.html', razas=razas, id_especie=id_especie)
    elif id_rol == 3:
        return render_template('Veterinario/Razas.html', razas=razas, id_especie=id_especie)
    else:
        return render_template('Cliente/Razas.html', razas=razas, id_especie=id_especie)
    
@raza_bp.route('/Razas-C/<int:id_especie>', methods=['GET'])
def razasC(id_especie):
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, raza, descripcion, imagen FROM Raza WHERE id_especie = %s", (id_especie,))
            razas = cursor.fetchall()
    except Exception as e:
        return str(e)
    
    if id_rol == 1:
        return render_template('Administrador/C-Razas.html', razas=razas, id_especie=id_especie)
    elif id_rol == 3:
        return render_template('Veterinario/C-Razas.html', razas=razas, id_especie=id_especie)

@raza_bp.route('/Crear-Raza/<int:id_especie>', methods=['GET', 'POST'])
def crear_raza(id_especie):
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

    if request.method == 'POST':
        Raza=request.form.get('Raza')
        descripcion=request.form.get('descripcion')

        file_path = 'img/Razas/default.png'
        imagen = request.files.get('imagen')
        
        if imagen and imagen.filename:
            print(f"Archivo recibido: {imagen.filename}")
            
            # Configurar rutas
            images_dir = os.path.join(current_app.root_path, 'static/img/Razas')
            os.makedirs(images_dir, exist_ok=True)
            
            # Generar nombre seguro
            filename = secure_filename(imagen.filename)
            file_path = os.path.join('img/Razas', filename).replace("\\", "/")
            
            # Guardar imagen
            imagen.save(os.path.join(images_dir, filename))
            print(f"Imagen guardada en: {file_path}")

        try:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO Raza (Raza, descripcion, id_especie, imagen) VALUES (%s, %s, %s, %s)", (Raza, descripcion, id_especie, file_path))
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
        
    if id_rol == 1:
        return render_template('Administrador/Crear_Raza.html', especie=especie)
    elif id_rol == 3:
        return render_template('Veterinario/Crear_Raza.html', especie=especie)
    

@raza_bp.route('/Editar-raza/<int:id_especie>/<int:id_raza>', methods=['GET', 'POST'])
def modificar_raza(id_especie, id_raza):
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

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
            cursor.execute("SELECT id, raza, descripcion FROM Raza WHERE id = %s and id_especie = %s", (id_raza, id_especie))
            raza = cursor.fetchone()
    except Exception as e:
        return str(e)
    
    if id_rol == 1:
        return render_template('Administrador/Modificar_Raza.html', especie=especie, raza=raza)
    elif id_rol == 3:
        return render_template('Veterinario/Modificar_Raza.html', especie=especie, raza=raza)

@raza_bp.route('/Eliminar-Especie/<int:id_especie>/<int:id_raza>', methods=['GET', 'POST'])
def eliminar_raza(id_especie, id_raza):
    if not is_authenticated():
        return redirect(url_for('user_bp.login'))

    connection = current_app.connection
    id_rol = session.get('id_rol')

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
            cursor.execute("SELECT id, raza FROM Raza WHERE id = %s and id_especie = %s", (id_raza, id_especie))
            raza = cursor.fetchone()
    except Exception as e:
        return str(e)

    if id_rol == 1:
        return render_template('Administrador/Eliminar_Raza.html', especie=especie, raza=raza)
    elif id_rol == 3:
        return render_template('Veterinario/Eliminar_Raza.html', especie=especie, raza=raza)
