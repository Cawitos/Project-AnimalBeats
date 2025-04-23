from flask import Blueprint, render_template

Consulta_bp = Blueprint('Consulta_bp', __name__)

@Consulta_bp.route('/consultas')
def Consultas():
    return render_template('Consultas.html')
