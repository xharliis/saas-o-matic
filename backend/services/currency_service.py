import requests
import time

class ServicioDivisas:
    _cache_tasas = {}
    _tiempo_cache = 0
    DURACION_CACHE = 3600  # Duración de caché de 1 hora
    API_URL = "https://open.er-api.com/v6/latest/EUR"

    @classmethod
    def obtener_tasas(cls) -> dict:
        """
        Obtiene los tipos de cambio relativos al EUR. Cachea la respuesta por 1 hora.
        """
        tiempo_actual = time.time()
        if cls._cache_tasas and (tiempo_actual - cls._tiempo_cache < cls.DURACION_CACHE):
            return cls._cache_tasas

        try:
            respuesta = requests.get(cls.API_URL, timeout=5)
            if respuesta.status_code == 200:
                datos = respuesta.json()
                if datos.get("result") == "success":
                    cls._cache_tasas = datos.get("rates", {})
                    cls._tiempo_cache = tiempo_actual
                    return cls._cache_tasas
        except Exception as e:
            # Fallar en silencio si la API tiene problemas y usar el caché existente
            print(f"Error al obtener tipos de cambio: {e}")
            
        # Tasas de respaldo en caso de que la API externa falle
        return cls._cache_tasas or {
            "EUR": 1.0,
            "USD": 1.09,
            "GBP": 0.85,
            "JPY": 170.0,
            "CAD": 1.48
        }

    @classmethod
    def convertir(cls, cantidad: float, divisa_destino: str) -> float:
        """
        Convierte un importe en EUR a otra divisa seleccionada.
        """
        tasas = cls.obtener_tasas()
        tasa = tasas.get(divisa_destino.upper(), 1.0)
        return round(cantidad * tasa, 2)
