from .database import db

class Cliente(db.Model):
    __tablename__ = 'clientes'

    id = db.Column(db.Integer, primary_key=True)
    nombre_empresa = db.Column(db.String(150), nullable=False)
    identificador_fiscal = db.Column(db.String(50), nullable=False, unique=True)
    correo = db.Column(db.String(120), nullable=False, unique=True)
    pais = db.Column(db.String(100), nullable=False)
    plan = db.Column(db.String(50), nullable=False)

    # Relación uno a muchos con simulaciones
    simulaciones = db.relationship('Simulacion', backref='cliente', lazy=True, cascade="all, delete-orphan")

    def a_diccionario(self):
        """Convierte la entidad Cliente en un diccionario de Python."""
        return {
            'id': self.id,
            'nombre_empresa': self.nombre_empresa,
            'identificador_fiscal': self.identificador_fiscal,
            'correo': self.correo,
            'pais': self.pais,
            'plan': self.plan
        }
