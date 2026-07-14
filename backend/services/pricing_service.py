from .tax_service import ServicioImpuestos

class ServicioPrecios:
    @staticmethod
    def calcular_coste_usuario_base(usuarios_activos: int) -> float:
        """
        Calcula el coste base por usuarios activos aplicando la tarifa por tramos:
        - Tramo 1: 0 a 10 usuarios -> 10 € / usuario
        - Tramo 2: 11 a 50 usuarios -> 8 € / usuario
        - Tramo 3: > 50 usuarios -> 5 € / usuario
        """
        if usuarios_activos <= 0:
            return 0.0

        coste_base = 0.0
        usuarios_restantes = usuarios_activos

        # Tramo 1: 0 a 10 usuarios
        usuarios_tramo1 = min(usuarios_restantes, 10)
        coste_base += usuarios_tramo1 * 10.0
        usuarios_restantes -= usuarios_tramo1

        if usuarios_restantes > 0:
            # Tramo 2: 11 a 50 usuarios (siguientes 40 usuarios)
            usuarios_tramo2 = min(usuarios_restantes, 40)
            coste_base += usuarios_tramo2 * 8.0
            usuarios_restantes -= usuarios_tramo2

        if usuarios_restantes > 0:
            # Tramo 3: > 50 usuarios
            coste_base += usuarios_restantes * 5.0

        return coste_base

    @classmethod
    def calcular_costes_simulacion(cls, usuarios_activos: int, pais: str) -> dict:
        """
        Calcula el coste base de usuarios, el importe de impuestos y el coste total.
        """
        coste_base = cls.calcular_coste_usuario_base(usuarios_activos)
        tipo_impositivo = ServicioImpuestos.obtener_tipo_impositivo(pais)
        coste_impuesto = coste_base * tipo_impositivo
        coste_total = coste_base + coste_impuesto

        return {
            'coste_base': round(coste_base, 2),
            'tipo_impositivo': tipo_impositivo,
            'coste_impuesto': round(coste_impuesto, 2),
            'coste_total': round(coste_total, 2)
        }
