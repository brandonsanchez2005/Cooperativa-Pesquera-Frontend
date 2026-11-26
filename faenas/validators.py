import re

from django.core.exceptions import ValidationError


def validar_telefono(valor):
    """Acepta teléfonos de 8 a 15 dígitos con separadores habituales."""
    telefono = valor.strip()
    digitos = sum(caracter.isdigit() for caracter in telefono)

    if not re.fullmatch(r"\+?[0-9\s().-]+", telefono) or not 8 <= digitos <= 15:
        raise ValidationError(
            "Ingrese un teléfono de 8 a 15 dígitos. Puede usar +, espacios, "
            "paréntesis, puntos o guiones como separadores."
        )
