# Matriz de pantallas y endpoints

Todas las llamadas de negocio se realizan a la API del Proyecto 1 con `Authorization: Token <token>`. Las listas usan la respuesta paginada del backend (`resultados`, `pagina_actual`, `total_paginas`, `total_registros`) y cinco filas por página. Los campos de relación se envían como IDs y se muestran con las etiquetas cargadas desde los endpoints relacionados.

| Vista | Datos y acciones de interfaz | Método y endpoint |
|---|---|---|
| Inicio de sesión | Autenticar usuario y obtener token | `POST /api/token/` |
| Perfil de sesión | Mostrar usuario, rol y pescador asociado | `GET /api/usuarios/me/` |
| Dashboard | Indicadores de faenas, capturas y kg capturados | `GET /api/faenas/`, `GET /api/capturas/`, `GET /api/faenas/resumen-capturas/` |
| Faenas / pescadores | Listar, buscar, ordenar, ver detalle, crear, editar y eliminar | `GET/POST /api/pescadores/`; `GET/PUT/PATCH/DELETE /api/pescadores/<id>/` |
| Faenas / embarcaciones | Listar, buscar, ordenar y CRUD | `GET/POST /api/embarcaciones/`; detalle por ID |
| Faenas / especies | Listar, buscar, ordenar y CRUD | `GET/POST /api/especies/`; detalle por ID |
| Faenas / faenas | Listar con filtros de pescador, embarcación y zona; buscar, ordenar y CRUD | `GET/POST /api/faenas/`; detalle por ID |
| Faenas / capturas | Listar con filtros de faena y especie; buscar, ordenar y CRUD | `GET/POST /api/capturas/`; detalle por ID |
| Inventario / cámaras | Listar, buscar, ordenar y CRUD | `GET/POST /api/inventario/camaras/`; detalle por ID |
| Inventario / lotes | Listar con filtros de captura, cámara y especie; buscar, ordenar y CRUD | `GET/POST /api/inventario/lotes/`; detalle por ID |
| Inventario / alertas | Consultar lotes próximos a vencer o vencidos con existencia | `GET /api/inventario/alertas/` |
| Procesamiento | Listar con filtros de lote, producto y especie; buscar, ordenar y CRUD | `GET/POST /api/procesamiento/`; detalle por ID |
| Pedidos / clientes | Listar, buscar, ordenar y CRUD | `GET/POST /api/pedidos/clientes/`; detalle por ID |
| Pedidos / precios | Listar con filtros de especie y producto; buscar, ordenar y CRUD | `GET/POST /api/pedidos/precios/`; detalle por ID |
| Pedidos / órdenes | Listar con filtros de cliente y estado; buscar, ordenar y CRUD | `GET/POST /api/pedidos/ordenes/`; detalle por ID |
| Pedidos / detalles | Listar con filtros de orden, procesamiento y producto; buscar, ordenar y CRUD | `GET/POST /api/pedidos/detalles/`; detalle por ID |
| Liquidaciones / gastos | Listar con filtros de faena y tipo; buscar, ordenar y CRUD | `GET/POST /api/liquidaciones/gastos/`; detalle por ID |
| Liquidaciones / liquidaciones | Listar con filtros de faena y estado; buscar, ordenar y CRUD | `GET/POST /api/liquidaciones/`; detalle por ID |

El frontend usa `PATCH` para editar, `DELETE` para eliminar y muestra las respuestas de validación del backend. El precio histórico del detalle de pedido y los importes calculados por procesamiento/liquidación son de solo lectura en el formulario.
