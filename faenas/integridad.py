def tiene_liquidacion_pagada(faena):
    """Indica si una faena ya tiene una liquidación pagada."""
    if faena is None:
        return False

    # Importación local para evitar dependencias circulares durante el inicio
    # de Django, ya que las liquidaciones también dependen de las faenas.
    from liquidaciones.models import Liquidacion

    return Liquidacion.objects.filter(
        faena=faena,
        estado=Liquidacion.Estado.PAGADA,
    ).exists()
