from datetime import datetime
from .database import db

class Simulacion(db.Model):
    __tablename__ = 'simulaciones'

    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    usuarios_activos = db.Column(db.Integer, nullable=False)
    almacenamiento_gb = db.Column(db.Integer, nullable=False)
    llamadas_api = db.Column(db.Integer, nullable=False)
    
    # Proyecciones financieras calculadas
    coste_base = db.Column(db.Float, nullable=False)
    coste_impuesto = db.Column(db.Float, nullable=False)
    coste_total = db.Column(db.Float, nullable=False)
    
    creado_en = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def a_diccionario(self):
        """Convierte la entidad Simulacion en un diccionario de Python."""
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'usuarios_activos': self.usuarios_activos,
            'almacenamiento_gb': self.almacenamiento_gb,
            'llamadas_api': self.llamadas_api,
            'coste_base': self.coste_base,
            'coste_impuesto': self.coste_impuesto,
            'coste_total': self.coste_total,
            'creado_en': self.creado_en.isoformat()
        }
