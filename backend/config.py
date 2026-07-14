import os

class Config:
    # Clave secreta para la seguridad de la sesión
    SECRET_KEY = os.environ.get('SECRET_KEY', 'clave-secreta-desarrollo-saas-o-matic')
    
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
