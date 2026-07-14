import re
from pydantic import BaseModel, Field, model_validator
from services.tax_service import ServicioImpuestos

class ClienteBase(BaseModel):
    nombre_empresa: str = Field(..., min_length=1, max_length=150)
    identificador_fiscal: str = Field(..., min_length=5, max_length=50)
    correo: str = Field(...)
    pais: str = Field(..., min_length=2, max_length=100)
    plan: str = Field(..., min_length=2, max_length=50)

    @model_validator(mode='after')
    def validar_campos(self) -> 'ClienteBase':
        # Limpiar el Identificador Fiscal
        self.identificador_fiscal = ServicioImpuestos.limpiar_id_fiscal(self.identificador_fiscal)
        
        # Validación básica de formato de correo
        patron_correo = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(patron_correo, self.correo):
            raise ValueError("El correo proporcionado no tiene un formato válido.")

        # Validación estricta del Identificador Fiscal si el país es España
        pais_minusculas = self.pais.strip().lower()
        if pais_minusculas in ["spain", "españa", "es"]:
            if not ServicioImpuestos.validar_id_fiscal_espanol(self.identificador_fiscal):
                raise ValueError("El Identificador Fiscal (DNI/NIF/CIF) no es válido para España.")

        return self

class ClienteCrear(ClienteBase):
    pass

class ClienteRespuesta(ClienteBase):
    id: int

    class Config:
        from_attributes = True
