#Este código establece la conexión con la base de datos utilizando PyMySQL
from flask import Flask
import pymysql.cursors
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configuración de la conexión a la base de datos
    connection = pymysql.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        database=app.config['MYSQL_DB'],
        cursorclass=pymysql.cursors.DictCursor
    )
    
    # Importar y registrar los blueprints
    from app.controllers.main_controller import main_bp
    from app.controllers.user_controller import user_bp
    from app.controllers.gestion_controller import gestion_bp
    from app.controllers.reportes_controller import reportes_bp
    from app.controllers.mascota_controller import mascotas_bp
    from app.controllers.especies_controller import especie_bp, raza_bp
    from app.controllers.Enfermedad_controller import enfermedad_bp
    from app.controllers.Citas_controller import citas_bp
    app.register_blueprint(citas_bp)
    app.register_blueprint(enfermedad_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(gestion_bp)
    app.register_blueprint(reportes_bp)
    app.register_blueprint(mascotas_bp)
    app.register_blueprint(especie_bp)
    app.register_blueprint(raza_bp)
    # Agregar la conexión a la base de datos como un atributo de la aplicación
    app.connection = connection

    return app

