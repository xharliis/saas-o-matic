import os
# pyrefly: ignore [missing-import]
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models.database import db
from controllers.customer_controller import cliente_bp
from controllers.simulation_controller import simulacion_bp

def crear_app(clase_configuracion=Config):
    app = Flask(__name__)
    app.config.from_object(clase_configuracion)

    # Permitir CORS en todas las rutas para la integración con el frontend
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Inicializar Base de Datos
    db.init_app(app)

    # Registrar Blueprints de Controladores
    app.register_blueprint(cliente_bp, url_prefix='/api')
    app.register_blueprint(simulacion_bp, url_prefix='/api')

    @app.route('/health', methods=['GET'])
    def verificacion_salud():
        return jsonify({"estado": "saludable", "servicio": "saas-o-matic-backend"}), 200

    # Asegurar que se creen las tablas en SQLite
    with app.app_context():
        db.create_all()
        
        # Seed 4 mock clients si no existen
        from models.customer import Cliente
        from models.simulation import Simulacion
        from services.pricing_service import ServicioPrecios
        
        if Cliente.query.count() < 10:
            # Limpiar datos existentes para evitar conflictos de identificador_fiscal o correo único
            Simulacion.query.delete()
            Cliente.query.delete()
            db.session.commit()

            clientes_mock = [
                Cliente(nombre_empresa="Acme Corp", identificador_fiscal="B12345678", correo="contacto@acme.es", pais="España", plan="SaaS Enterprise"),
                Cliente(nombre_empresa="TechFlow LLC", identificador_fiscal="US987654321", correo="billing@techflow.com", pais="Estados Unidos", plan="SaaS Enterprise"),
                Cliente(nombre_empresa="EuroSoft GmbH", identificador_fiscal="DE123456789", correo="info@eurosoft.de", pais="Alemania", plan="SaaS Basic"),
                Cliente(nombre_empresa="Global Logistics", identificador_fiscal="A87654321", correo="admin@globallog.es", pais="España", plan="SaaS Growth"),
                Cliente(nombre_empresa="UK Trading", identificador_fiscal="GB112233445", correo="billing@uktrading.co.uk", pais="Reino Unido", plan="SaaS Basic"),
                Cliente(nombre_empresa="JapanTech Corp", identificador_fiscal="JP123456789", correo="info@japantech.jp", pais="Japón", plan="SaaS Growth"),
                Cliente(nombre_empresa="Maple Syrup Co", identificador_fiscal="CA998877665", correo="contact@maplesyrup.ca", pais="Canadá", plan="SaaS Basic"),
                Cliente(nombre_empresa="Alps Solutions", identificador_fiscal="FR556677889", correo="sales@alpssolutions.fr", pais="Francia", plan="SaaS Growth"),
                Cliente(nombre_empresa="Berlin Startups", identificador_fiscal="DE987654321", correo="hello@berlinstartups.de", pais="Alemania", plan="SaaS Basic"),
                Cliente(nombre_empresa="US Cloud Services", identificador_fiscal="US112233445", correo="support@uscloudservices.com", pais="Estados Unidos", plan="SaaS Enterprise")
            ]
            db.session.add_all(clientes_mock)
            db.session.commit()

            # Seed 1 simulacion por cada cliente
            for c in clientes_mock:
                usuarios = 20 if "Enterprise" in c.plan else (12 if "Growth" in c.plan else 5)
                costes = ServicioPrecios.calcular_costes_simulacion(usuarios, c.pais)
                sim = Simulacion(
                    cliente_id=c.id,
                    usuarios_activos=usuarios,
                    almacenamiento_gb=50,
                    llamadas_api=10000,
                    coste_base=costes['coste_base'],
                    coste_impuesto=costes['coste_impuesto'],
                    coste_total=costes['coste_total']
                )
                db.session.add(sim)
            db.session.commit()
            print("Base de datos inicializada con 10 clientes mock y sus simulaciones.")

    return app

if __name__ == '__main__':
    app = crear_app()
    puerto = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=puerto, debug=app.config['DEBUG'])
