import unittest
from services.pricing_service import ServicioPrecios

class TestServicioPrecios(unittest.TestCase):
    def test_tarifas_por_tramos(self):
        # 0 usuarios
        self.assertEqual(ServicioPrecios.calcular_coste_usuario_base(0), 0.0)
        self.assertEqual(ServicioPrecios.calcular_coste_usuario_base(-5), 0.0)
        
        # Tramo 1 (1 a 10 usuarios: 10 EUR cada uno)
        self.assertEqual(ServicioPrecios.calcular_coste_usuario_base(5), 50.0)
        self.assertEqual(ServicioPrecios.calcular_coste_usuario_base(10), 100.0)
        
        # Tramo 2 (11 a 50 usuarios: 8 EUR cada uno)
        # 15 usuarios = 10 * 10 + 5 * 8 = 140.0
        self.assertEqual(ServicioPrecios.calcular_coste_usuario_base(15), 140.0)
        # 50 usuarios = 10 * 10 + 40 * 8 = 420.0
        self.assertEqual(ServicioPrecios.calcular_coste_usuario_base(50), 420.0)
        
        # Tramo 3 (> 50 usuarios: 5 EUR cada uno)
        # 60 usuarios = 10 * 10 + 40 * 8 + 10 * 5 = 470.0
        self.assertEqual(ServicioPrecios.calcular_coste_usuario_base(60), 470.0)

    def test_coste_simulacion_con_impuestos(self):
        # España (21% de IVA)
        # 15 usuarios -> base=140, IVA=29.4, total=169.4
        costes_es = ServicioPrecios.calcular_costes_simulacion(15, "España")
        self.assertEqual(costes_es['coste_base'], 140.0)
        self.assertEqual(costes_es['tipo_impositivo'], 0.21)
        self.assertEqual(costes_es['coste_impuesto'], 29.40)
        self.assertEqual(costes_es['coste_total'], 169.40)
        
        # USA (0% de IVA)
        # 15 usuarios -> base=140, IVA=0, total=140
        costes_us = ServicioPrecios.calcular_costes_simulacion(15, "United States")
        self.assertEqual(costes_us['coste_base'], 140.0)
        self.assertEqual(costes_us['tipo_impositivo'], 0.0)
        self.assertEqual(costes_us['coste_impuesto'], 0.0)
        self.assertEqual(costes_us['coste_total'], 140.0)

if __name__ == '__main__':
    unittest.main()
