import os

class Config:
    # Directorio base del proyecto
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    
    # URI de conexión a la base de datos SQLite
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f"sqlite:///{os.path.join(BASE_DIR, 'saas_o_matic.db')}"
    )
    
    # Desactivar seguimiento de modificaciones de SQLAlchemy para ahorrar recursos
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Modo depuración activo si el entorno lo define
    DEBUG = os.environ.get('FLASK_DEBUG', 'True') == 'True' 
