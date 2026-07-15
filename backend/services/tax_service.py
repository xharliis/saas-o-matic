import re

class ServicioImpuestos:
    @staticmethod
    def limpiar_id_fiscal(id_fiscal: str) -> str:
        """Limpia espacios en blanco, guiones y convierte a mayúsculas."""
        if not id_fiscal:
            return ""
        return re.sub(r'[\s\-]', '', id_fiscal).upper()

    @classmethod
    def validar_id_fiscal_espanol(cls, id_fiscal: str) -> bool:
        """
        Valida un Identificador Fiscal español (DNI, NIE o CIF).
        """
        id_limpio = cls.limpiar_id_fiscal(id_fiscal)
        if len(id_limpio) != 9:
            return False

        # Identificar tipo de documento
        # DNI: 8 dígitos + 1 letra
        if re.match(r'^\d{8}[A-Z]$', id_limpio):
            return cls._validar_dni(id_limpio)
        
        # NIE: X/Y/Z + 7 dígitos + 1 letra
        elif re.match(r'^[XYZ]\d{7}[A-Z]$', id_limpio):
            return cls._validar_nie(id_limpio)
        
        # CIF: 1 letra (A-H, J-N, P-S, U-W) + 7 dígitos + 1 carácter de control (dígito o letra)
        elif re.match(r'^[ABCDEFGHJNPQRSTUVW]\d{7}[A-Z0-9]$', id_limpio):
            return cls._validar_cif(id_limpio)

        return False

    @staticmethod
    def _validar_dni(dni_str: str) -> bool:
        letras = "TRWAGMYFPDXBNJZSQVHLCKE"
        numero = int(dni_str[:-1])
        letra_control = dni_str[-1]
        return letras[numero % 23] == letra_control

    @classmethod
    def _validar_nie(cls, nie_str: str) -> bool:
        # Reemplazar la letra del prefijo por el dígito correspondiente
        prefijo = nie_str[0]
        reemplazo = {"X": "0", "Y": "1", "Z": "2"}[prefijo]
        equivalente_dni = reemplazo + nie_str[1:]
        return cls._validar_dni(equivalente_dni)

    @staticmethod
    def _validar_cif(cif_str: str) -> bool:
        primer_caracter = cif_str[0]
        digitos_str = cif_str[1:8]
        caracter_control = cif_str[8]

        # Calcular suma de control
        suma_pares = 0
        suma_impares = 0

        for indice, caracter in enumerate(digitos_str):
            digito = int(caracter)
            if (indice + 1) % 2 == 0:
                # Posición par (2ª, 4ª, 6ª)
                suma_pares += digito
            else:
                # Posición impar (1ª, 3ª, 5ª, 7ª)
                duplicado = digito * 2
                suma_impares += (duplicado // 10) + (duplicado % 10)

        suma_total = suma_pares + suma_impares
        ultimo_digito_suma = suma_total % 10
        
        if ultimo_digito_suma == 0:
            numero_control = 0
        else:
            numero_control = 10 - ultimo_digito_suma

        # Mapeo de caracteres de control
        letras_control = "JABCDEFGHI"  # 0->J, 1->A, 2->B...
        letra_control_esperada = letras_control[numero_control]
        digito_control_esperado = str(numero_control)

        # Clasificar según la letra de prefijo
        # K, P, Q, S, W -> El carácter de control debe ser una letra
        if primer_caracter in "KPQSW":
            return caracter_control == letra_control_esperada
        # A, B, E, H -> El carácter de control debe ser un dígito
        elif primer_caracter in "ABEH":
            return caracter_control == digito_control_esperado
        # Resto (C, D, F, G, J, N, R, U, V) -> Puede ser dígito o letra
        else:
            return caracter_control == letra_control_esperada or caracter_control == digito_control_esperado

    @staticmethod
    def obtener_tipo_impositivo(pais: str) -> float:
        """Retorna el tipo impositivo (IVA) en porcentaje para un país."""
        tasas = {
            "spain": 0.21, "españa": 0.21, "es": 0.21,
            "germany": 0.19, "alemania": 0.19, "de": 0.19,
            "france": 0.20, "francia": 0.20, "fr": 0.20,
            "united kingdom": 0.20, "reino unido": 0.20, "uk": 0.20, "gb": 0.20,
            "japan": 0.10, "japon": 0.10, "japón": 0.10, "jp": 0.10,
            "canada": 0.05, "canadá": 0.05, "ca": 0.05,
            "united states": 0.10, "usa": 0.10, "us": 0.10, "eeuu": 0.10, "estados unidos": 0.10, "united states of america": 0.10
        }
        return tasas.get(pais.strip().lower(), 0.0)
