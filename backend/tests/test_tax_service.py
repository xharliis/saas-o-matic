import unittest
from services.tax_service import ServicioImpuestos

class TestServicioImpuestos(unittest.TestCase):
    def test_validacion_dni(self):
        # DNI Válido
        self.assertTrue(ServicioImpuestos.validar_id_fiscal_espanol("12345678Z"))
        self.assertTrue(ServicioImpuestos.validar_id_fiscal_espanol("12345678-Z"))  # maneja guiones
        self.assertTrue(ServicioImpuestos.validar_id_fiscal_espanol(" 12345678 Z "))  # maneja espacios
        
        # DNI Inválido (letra de control incorrecta)
        self.assertFalse(ServicioImpuestos.validar_id_fiscal_espanol("12345678A"))
        # DNI Inválido (longitud errónea)
        self.assertFalse(ServicioImpuestos.validar_id_fiscal_espanol("1234567Z"))

    def test_validacion_nie(self):
        # NIE Válido
        self.assertTrue(ServicioImpuestos.validar_id_fiscal_espanol("X1234567L"))
        
        # NIE Inválido (letra de control incorrecta)
        self.assertFalse(ServicioImpuestos.validar_id_fiscal_espanol("X1234567A"))

    def test_validacion_cif(self):
        # CIF Válido (A12345674 posee dígito de control)
        self.assertTrue(ServicioImpuestos.validar_id_fiscal_espanol("A12345674"))
        
        # CIF Inválido (dígito de control erróneo)
        self.assertFalse(ServicioImpuestos.validar_id_fiscal_espanol("A12345673"))
        
        # Formato de CIF Inválido
        self.assertFalse(ServicioImpuestos.validar_id_fiscal_espanol("Z1234567A"))

    def test_tipos_impositivos(self):
        self.assertEqual(ServicioImpuestos.obtener_tipo_impositivo("Spain"), 0.21)
        self.assertEqual(ServicioImpuestos.obtener_tipo_impositivo("España"), 0.21)
        self.assertEqual(ServicioImpuestos.obtener_tipo_impositivo("ES"), 0.21)
        self.assertEqual(ServicioImpuestos.obtener_tipo_impositivo("Germany"), 0.19)
        self.assertEqual(ServicioImpuestos.obtener_tipo_impositivo("France"), 0.20)
        self.assertEqual(ServicioImpuestos.obtener_tipo_impositivo("Reino Unido"), 0.20)
        self.assertEqual(ServicioImpuestos.obtener_tipo_impositivo("Japón"), 0.10)
        self.assertEqual(ServicioImpuestos.obtener_tipo_impositivo("Canada"), 0.05)
        self.assertEqual(ServicioImpuestos.obtener_tipo_impositivo("USA"), 0.10)
        self.assertEqual(ServicioImpuestos.obtener_tipo_impositivo("United States"), 0.10)
        self.assertEqual(ServicioImpuestos.obtener_tipo_impositivo("Others"), 0.0)

if __name__ == '__main__':
    unittest.main()
