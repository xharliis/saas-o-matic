from flask import Blueprint, request, jsonify
from models.database import db
from models.customer import Cliente
from models.simulation import Simulacion
from schemas.simulation_schema import SimulacionCrear
from services.pricing_service import ServicioPrecios
from pydantic import ValidationError

simulacion_bp = Blueprint('simulacion_bp', __name__)

@simulacion_bp.route('/simulaciones', methods=['POST'])
def crear_simulacion():
    try:
        datos = request.get_json() or {}
        # Validar la entrada de datos con el esquema de Pydantic
        datos_validados = SimulacionCrear(**datos)
        
        # Verificar si el cliente existe
        cliente = Cliente.query.get(datos_validados.cliente_id)
        if not cliente:
            return jsonify({
                "error": "Not Found",
                "message": "El cliente especificado no existe."
            }), 404
            
        # Calcular la tarificación por tramos e impuestos asociados al país del cliente
        costes = ServicioPrecios.calcular_costes_simulacion(
            usuarios_activos=datos_validados.usuarios_activos,
            pais=cliente.pais
        )
        
        # Crear el registro de la simulación
        nueva_simulacion = Simulacion(
            cliente_id=datos_validados.cliente_id,
            usuarios_activos=datos_validados.usuarios_activos,
            almacenamiento_gb=datos_validados.almacenamiento_gb,
            llamadas_api=datos_validados.llamadas_api,
            coste_base=costes['coste_base'],
            coste_impuesto=costes['coste_impuesto'],
            coste_total=costes['coste_total']
        )
        
        db.session.add(nueva_simulacion)
        db.session.commit()
        
        return jsonify(nueva_simulacion.a_diccionario()), 201
        
    except ValidationError as e:
        errores = [err['msg'] for err in e.errors()]
        return jsonify({
            "error": "Bad Request",
            "message": errores[0] if errores else "Error de validación de datos de simulación."
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e)
        }), 500

@simulacion_bp.route('/clientes/<int:cliente_id>/simulaciones', methods=['GET'])
def obtener_simulaciones_cliente(cliente_id):
    try:
        cliente = Cliente.query.get(cliente_id)
        if not cliente:
            return jsonify({
                "error": "Not Found",
                "message": "Cliente no encontrado."
            }), 404
            
        # Obtener las simulaciones ordenadas por fecha de forma descendente
        simulaciones = Simulacion.query.filter_by(cliente_id=cliente_id).order_by(Simulacion.creado_en.desc()).all()
        return jsonify([sim.a_diccionario() for sim in simulaciones]), 200
        
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e)
        }), 500

@simulacion_bp.route('/preview-simulacion', methods=['GET'])
def preview_simulacion():
    try:
        usuarios = int(request.args.get('usuarios_activos', 1))
        pais = request.args.get('pais', 'España')
        
        costes = ServicioPrecios.calcular_costes_simulacion(usuarios, pais)
        return jsonify(costes), 200
    except ValueError:
        return jsonify({"error": "Bad Request", "message": "El parámetro usuarios_activos debe ser un número."}), 400
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
