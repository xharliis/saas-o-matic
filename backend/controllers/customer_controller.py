# pyrefly: ignore [missing-import]
from flask import Blueprint, request, jsonify
from models.database import db
from models.customer import Cliente
from schemas.customer_schema import ClienteCrear
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError

cliente_bp = Blueprint('cliente_bp', __name__)

@cliente_bp.route('/clientes', methods=['POST'])
def crear_cliente():
    try:
        datos = request.get_json() or {}
        # Validar la entrada de datos con el esquema de Pydantic
        datos_validados = ClienteCrear(**datos)
        
        # Verificar si el cliente ya existe por Identificador Fiscal o por Correo
        cliente_existente = Cliente.query.filter_by(identificador_fiscal=datos_validados.identificador_fiscal).first()
        if cliente_existente:
            return jsonify({
                "error": "Conflict",
                "message": f"El cliente con Identificador Fiscal {datos_validados.identificador_fiscal} ya está registrado."
            }), 409

        cliente_existente_correo = Cliente.query.filter_by(correo=datos_validados.correo).first()
        if cliente_existente_correo:
            return jsonify({
                "error": "Conflict",
                "message": f"El cliente con correo {datos_validados.correo} ya está registrado."
            }), 409

        nuevo_cliente = Cliente(
            nombre_empresa=datos_validados.nombre_empresa,
            identificador_fiscal=datos_validados.identificador_fiscal,
            correo=datos_validados.correo,
            pais=datos_validados.pais,
            plan=datos_validados.plan
        )
        db.session.add(nuevo_cliente)
        db.session.commit()
        
        return jsonify(nuevo_cliente.a_diccionario()), 201
        
    except ValidationError as e:
        # Dar formato a los errores de validación de Pydantic
        errores = [err['msg'] for err in e.errors()]
        return jsonify({
            "error": "Bad Request",
            "message": errores[0] if errores else "Error de validación de datos."
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e)
        }), 500

@cliente_bp.route('/clientes', methods=['GET'])
def obtener_clientes():
    """
    Obtiene clientes. Permite búsqueda utilizando el parámetro de consulta 'q' y paginación.
    """
    try:
        consulta_busqueda = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 6, type=int)

        query = Cliente.query
        if consulta_busqueda:
            query = query.filter(
                (Cliente.nombre_empresa.ilike(f"%{consulta_busqueda}%")) | 
                (Cliente.identificador_fiscal.ilike(f"%{consulta_busqueda}%"))
            )
            
        total = query.count()
        clientes = query.offset((page - 1) * per_page).limit(per_page).all()
            
        return jsonify({
            'clientes': [c.a_diccionario() for c in clientes],
            'total': total,
            'paginas': (total + per_page - 1) // per_page if total > 0 else 0,
            'pagina_actual': page,
            'por_pagina': per_page
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e)
        }), 500

@cliente_bp.route('/clientes/<int:cliente_id>', methods=['GET'])
def obtener_detalle_cliente(cliente_id):
    try:
        cliente = Cliente.query.get(cliente_id)
        if not cliente:
            return jsonify({
                "error": "Not Found",
                "message": "Cliente no encontrado."
            }), 404
            
        return jsonify(cliente.a_diccionario()), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e)
        }), 500

@cliente_bp.route('/clientes/<int:cliente_id>', methods=['PUT'])
def actualizar_cliente(cliente_id):
    try:
        cliente = Cliente.query.get(cliente_id)
        if not cliente:
            return jsonify({"error": "Not Found", "message": "Cliente no encontrado."}), 404

        datos = request.get_json() or {}
        # Exclude 'id' for validation
        if 'id' in datos:
            del datos['id']
            
        datos_validados = ClienteCrear(**datos)

        # Check for unique tax id if changed
        if cliente.identificador_fiscal != datos_validados.identificador_fiscal:
            cliente_existente = Cliente.query.filter_by(identificador_fiscal=datos_validados.identificador_fiscal).first()
            if cliente_existente:
                return jsonify({"error": "Conflict", "message": "El Identificador Fiscal ya existe."}), 409

        # Check for unique email if changed
        if cliente.correo != datos_validados.correo:
            cliente_existente_correo = Cliente.query.filter_by(correo=datos_validados.correo).first()
            if cliente_existente_correo:
                return jsonify({"error": "Conflict", "message": "El correo ya está registrado por otro cliente."}), 409

        cliente.nombre_empresa = datos_validados.nombre_empresa
        cliente.identificador_fiscal = datos_validados.identificador_fiscal
        cliente.correo = datos_validados.correo
        cliente.pais = datos_validados.pais
        cliente.plan = datos_validados.plan

        db.session.commit()
        return jsonify(cliente.a_diccionario()), 200
    except ValidationError as e:
        errores = [err['msg'] for err in e.errors()]
        return jsonify({"error": "Bad Request", "message": errores[0] if errores else "Error de validación."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

@cliente_bp.route('/clientes/<int:cliente_id>', methods=['DELETE'])
def eliminar_cliente(cliente_id):
    try:
        cliente = Cliente.query.get(cliente_id)
        if not cliente:
            return jsonify({"error": "Not Found", "message": "Cliente no encontrado."}), 404

        db.session.delete(cliente)
        db.session.commit()
        return jsonify({"message": "Cliente eliminado exitosamente."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
