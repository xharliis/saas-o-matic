from pydantic import BaseModel, Field

class SimulacionCrear(BaseModel):
    cliente_id: int
    usuarios_activos: int = Field(..., ge=0, description="Número de usuarios activos")
    almacenamiento_gb: int = Field(..., ge=0, description="Almacenamiento contratado en GB")
    llamadas_api: int = Field(..., ge=0, description="Llamadas estimadas a la API")

class SimulacionRespuesta(BaseModel):
    id: int
    cliente_id: int
    usuarios_activos: int
    almacenamiento_gb: int
    llamadas_api: int
    coste_base: float
    coste_impuesto: float
    coste_total: float
    creado_en: str

    class Config:
        from_attributes = True
