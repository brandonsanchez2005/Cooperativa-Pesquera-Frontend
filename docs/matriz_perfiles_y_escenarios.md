# Matriz de perfiles y escenarios manuales

## Permisos por perfil

| Recurso | Administrador | Operador | Consulta |
|---|---|---|---|
| Pescadores | Ver, crear, editar, eliminar | Ver, crear, editar | Ver su propio registro |
| Embarcaciones y especies | CRUD | Ver, crear, editar | Ver |
| Faenas y capturas | CRUD | Ver, crear, editar | Ver las relacionadas con su pescador |
| Cámaras frías | CRUD | Ver, crear, editar | Ver |
| Lotes y procesamientos | CRUD | Ver, crear, editar | Ver los relacionados con su pescador |
| Clientes, precios, órdenes y detalles | CRUD | Ver, crear, editar | Sin acceso |
| Gastos y liquidaciones | CRUD | Ver, crear, editar | Ver los de sus propias faenas |

El menú y las acciones reflejan el perfil recibido del endpoint de sesión. El backend es la autoridad: respuestas `401` o `403` se muestran aunque la acción aparezca o quede visible por un cambio de estado de la sesión.

## Escenarios para evidencia manual

| # | Perfil | Escenario | Resultado esperado |
|---:|---|---|---|
| 1 | Cualquiera | Abrir una ruta protegida sin sesión | Redirección al inicio de sesión |
| 2 | Administrador | Iniciar sesión con credenciales válidas | Token real, nombre y rol visibles; dashboard con datos de API |
| 3 | Cualquiera | Iniciar sesión con credenciales inválidas | Mensaje claro, sin exponer datos sensibles |
| 4 | Cualquiera | Cerrar sesión y volver a una ruta interna | Token local eliminado y nueva redirección al acceso |
| 5 | Administrador | Navegar por los cinco módulos y sus recursos | Vistas identificables y datos consultados desde la API |
| 6 | Administrador | Crear una embarcación con capacidad positiva | Registro creado y tabla actualizada |
| 7 | Administrador | Editar un registro existente | Formulario precargado y cambios persistidos |
| 8 | Administrador | Eliminar un registro sin relaciones protegidas | Confirmación previa y respuesta visual de éxito |
| 9 | Administrador | Intentar eliminar un registro referenciado | Error del backend presentado sin eliminarlo |
| 10 | Operador | Abrir un listado y combinar dos filtros | API recibe ambos parámetros y muestra resultados coincidentes |
| 11 | Operador | Buscar y cambiar ordenamiento | Resultados y orden corresponden a la API |
| 12 | Operador | Avanzar y retroceder páginas | Indicador de página y resultados cambian desde backend |
| 13 | Operador | Enviar una faena con regreso anterior a la salida | Error de validación comprensible; no se guarda |
| 14 | Consulta | Consultar faenas, lotes, procesamientos y liquidaciones | Solo aparecen registros propios y acciones de escritura no están disponibles |
| 15 | Consulta | Intentar abrir Pedidos por URL directa | Vista no disponible y API niega la lectura con `403` |
| 16 | Consulta | Consultar cámaras y referencias permitidas | Datos legibles, sin crear, editar ni eliminar |
| 17 | Operador | Consultar liquidación con montos calculados | Monto bruto, gastos y neto reflejan la respuesta real |
| 18 | Cualquiera | Apagar Django y ejecutar una consulta | Mensaje de conexión claro; no se muestran datos inventados |

## Evidencias que se deben capturar durante la demostración

- Login válido, usuario/perfil y dashboard con datos reales.
- Una vista representativa de cada módulo.
- Formularios y selectores de relaciones cargados desde la API.
- Un error de validación del backend.
- Un acceso denegado para el perfil Consulta.
- Filtros combinados, búsqueda, ordenamiento y paginación.
- Confirmación de eliminación y cierre de sesión.

Las capturas se deben generar durante una ejecución real; no se sustituyen con datos de ejemplo estáticos.
