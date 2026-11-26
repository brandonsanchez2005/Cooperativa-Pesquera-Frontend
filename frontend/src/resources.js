const relation = (key, label, endpoint, required = true) => ({ key, label, type: 'relation', endpoint, required });
const text = (key, label, required = true) => ({ key, label, type: 'text', required });
const number = (key, label, required = true, step = '0.01', min = '0.01') => ({ key, label, type: 'number', required, step, min });
const date = (key, label, required = true) => ({ key, label, type: 'date', required });
const choice = (key, label, options, required = true) => ({ key, label, type: 'choice', options, required });
const boolean = (key, label) => ({ key, label, type: 'boolean', required: false });

const PRODUCTOS = [
  { value: 'FILETE', label: 'Filete' },
  { value: 'POSTA', label: 'Posta' },
  { value: 'ENTERO', label: 'Entero' },
  { value: 'OTRO', label: 'Otro' },
];

export const MODULES = [
  { key: 'faenas', title: 'Faenas y capturas', eyebrow: 'Operación pesquera', icon: 'FP', resources: ['pescadores', 'embarcaciones', 'especies', 'faenas', 'capturas'] },
  { key: 'inventario', title: 'Inventario', eyebrow: 'Cadena de frío', icon: 'IN', resources: ['camaras', 'lotes', 'alertas'] },
  { key: 'procesamiento', title: 'Procesamiento', eyebrow: 'Transformación', icon: 'PR', resources: ['procesamientos'] },
  { key: 'pedidos', title: 'Pedidos', eyebrow: 'Ventas mayoristas', icon: 'PE', resources: ['clientes', 'precios', 'ordenes', 'detalles'] },
  { key: 'liquidaciones', title: 'Liquidaciones', eyebrow: 'Cierre de faena', icon: 'LI', resources: ['gastos', 'liquidaciones'] },
];

export const RESOURCES = {
  pescadores: {
    title: 'Pescadores', endpoint: '/pescadores/', consulta: true,
    fields: [text('nombre', 'Nombre'), text('identificacion', 'Identificación'), { key: 'telefono', label: 'Teléfono', type: 'tel', required: false }, boolean('activo', 'Activo')],
    columns: ['id', 'nombre', 'identificacion', 'telefono', 'activo'], search: 'Buscar por nombre o identificación',
    ordering: [['nombre', 'Nombre'], ['identificacion', 'Identificación']],
  },
  embarcaciones: {
    title: 'Embarcaciones', endpoint: '/embarcaciones/', consulta: true,
    fields: [text('nombre', 'Nombre'), text('matricula', 'Matrícula'), number('capacidad_kg', 'Capacidad (kg)'), boolean('activa', 'Activa')],
    columns: ['id', 'nombre', 'matricula', 'capacidad_kg', 'activa'], search: 'Buscar por nombre o matrícula',
    ordering: [['nombre', 'Nombre'], ['matricula', 'Matrícula']],
  },
  especies: {
    title: 'Especies', endpoint: '/especies/', consulta: true,
    fields: [text('nombre', 'Nombre'), number('temperatura_maxima', 'Temperatura máxima (°C)', true, '0.01', null), boolean('activa', 'Activa')],
    columns: ['id', 'nombre', 'temperatura_maxima', 'activa'], search: 'Buscar especie',
    ordering: [['nombre', 'Nombre']],
  },
  faenas: {
    title: 'Faenas', endpoint: '/faenas/', consulta: true,
    fields: [relation('pescador', 'Pescador', '/pescadores/'), relation('embarcacion', 'Embarcación', '/embarcaciones/'), { key: 'fecha_salida', label: 'Salida', type: 'datetime-local', required: true }, { key: 'fecha_regreso', label: 'Regreso', type: 'datetime-local', required: true }, text('zona', 'Zona')],
    columns: ['id', 'pescador', 'embarcacion', 'fecha_salida', 'fecha_regreso', 'zona'], search: 'Buscar pescador, embarcación o zona',
    filters: [relation('pescador', 'Pescador', '/pescadores/', false), relation('embarcacion', 'Embarcación', '/embarcaciones/', false), text('zona', 'Zona', false)],
    ordering: [['-fecha_salida', 'Más recientes'], ['fecha_salida', 'Más antiguas'], ['zona', 'Zona']],
  },
  capturas: {
    title: 'Capturas', endpoint: '/capturas/', consulta: true,
    fields: [relation('faena', 'Faena', '/faenas/'), relation('especie', 'Especie', '/especies/'), number('kilogramos', 'Kilogramos'), number('precio_kg', 'Precio por kg')],
    columns: ['id', 'faena', 'especie', 'kilogramos', 'precio_kg'], search: 'Buscar por especie o zona',
    filters: [relation('faena', 'Faena', '/faenas/', false), relation('especie', 'Especie', '/especies/', false)],
    ordering: [['-kilogramos', 'Más kg'], ['kilogramos', 'Menos kg'], ['precio_kg', 'Precio por kg']],
  },
  camaras: {
    title: 'Cámaras frías', endpoint: '/inventario/camaras/', consulta: true,
    fields: [text('codigo', 'Código'), text('nombre', 'Nombre'), number('temperatura_actual', 'Temperatura actual (°C)', true, '0.01', null), number('capacidad_kg', 'Capacidad (kg)'), boolean('activa', 'Activa')],
    columns: ['id', 'codigo', 'nombre', 'temperatura_actual', 'capacidad_kg', 'activa'], search: 'Buscar por código o nombre',
    ordering: [['nombre', 'Nombre'], ['codigo', 'Código']],
  },
  lotes: {
    title: 'Lotes de inventario', endpoint: '/inventario/lotes/', consulta: true,
    fields: [text('codigo', 'Código'), relation('captura', 'Captura', '/capturas/'), relation('camara', 'Cámara', '/inventario/camaras/'), date('fecha_ingreso', 'Ingreso'), date('fecha_vencimiento', 'Vencimiento'), number('kilogramos_iniciales', 'Kilogramos iniciales')],
    columns: ['id', 'codigo', 'captura', 'camara', 'fecha_ingreso', 'fecha_vencimiento', 'kilogramos_iniciales', 'kilogramos_disponibles', 'estado'], search: 'Buscar código, especie o cámara',
    filters: [relation('captura', 'Captura', '/capturas/', false), relation('camara', 'Cámara', '/inventario/camaras/', false), relation('especie', 'Especie', '/especies/', false)],
    ordering: [['-fecha_ingreso', 'Ingreso reciente'], ['fecha_ingreso', 'Ingreso antiguo'], ['fecha_vencimiento', 'Vencimiento']],
  },
  alertas: {
    title: 'Alertas de vencimiento', endpoint: '/inventario/alertas/', consulta: true, readOnly: true,
    fields: [text('codigo', 'Código'), relation('captura', 'Captura', '/capturas/'), relation('camara', 'Cámara', '/inventario/camaras/'), date('fecha_ingreso', 'Ingreso', false), date('fecha_vencimiento', 'Vencimiento', false)],
    columns: ['id', 'codigo', 'captura', 'camara', 'fecha_vencimiento', 'kilogramos_disponibles', 'estado'],
  },
  procesamientos: {
    title: 'Procesamientos', endpoint: '/procesamiento/', consulta: true,
    fields: [relation('lote_inventario', 'Lote', '/inventario/lotes/'), choice('producto', 'Presentación', PRODUCTOS), date('fecha_procesamiento', 'Fecha'), number('kilogramos_procesados', 'Kg procesados'), number('kilogramos_obtenidos', 'Kg obtenidos'), { key: 'observaciones', label: 'Observaciones', type: 'textarea', required: false }],
    columns: ['id', 'lote_inventario', 'producto', 'fecha_procesamiento', 'kilogramos_procesados', 'kilogramos_obtenidos', 'merma_kg'], search: 'Buscar producto o especie',
    filters: [relation('lote', 'Lote', '/inventario/lotes/', false), choice('producto', 'Presentación', PRODUCTOS, false), relation('especie', 'Especie', '/especies/', false)],
    ordering: [['-fecha_procesamiento', 'Más recientes'], ['fecha_procesamiento', 'Más antiguos'], ['producto', 'Producto']],
  },
  clientes: {
    title: 'Clientes mayoristas', endpoint: '/pedidos/clientes/',
    fields: [text('nombre', 'Nombre'), text('identificacion', 'Identificación'), choice('tipo', 'Tipo', [['RESTAURANTE', 'Restaurante'], ['HOTEL', 'Hotel'], ['PESCADERIA', 'Pescadería'], ['OTRO', 'Otro']]), { key: 'correo', label: 'Correo', type: 'email', required: false }, { key: 'telefono', label: 'Teléfono', type: 'tel', required: false }, boolean('activo', 'Activo')],
    columns: ['id', 'nombre', 'identificacion', 'tipo', 'correo', 'telefono', 'activo'], search: 'Buscar por nombre o identificación',
    ordering: [['nombre', 'Nombre'], ['identificacion', 'Identificación']],
  },
  precios: {
    title: 'Precios semanales', endpoint: '/pedidos/precios/',
    fields: [relation('especie', 'Especie', '/especies/'), choice('producto', 'Presentación', PRODUCTOS), number('precio_kg', 'Precio por kg'), date('vigente_desde', 'Vigente desde'), date('vigente_hasta', 'Vigente hasta')],
    columns: ['id', 'especie', 'producto', 'precio_kg', 'vigente_desde', 'vigente_hasta'], search: 'Buscar especie o presentación',
    filters: [relation('especie', 'Especie', '/especies/', false), choice('producto', 'Presentación', PRODUCTOS, false)],
    ordering: [['-vigente_desde', 'Más recientes'], ['vigente_desde', 'Más antiguos'], ['precio_kg', 'Precio']],
  },
  ordenes: {
    title: 'Órdenes', endpoint: '/pedidos/ordenes/',
    fields: [relation('cliente', 'Cliente', '/pedidos/clientes/'), date('fecha_pedido', 'Fecha del pedido'), choice('estado', 'Estado', [['PENDIENTE', 'Pendiente'], ['CONFIRMADO', 'Confirmado'], ['ENTREGADO', 'Entregado'], ['CANCELADO', 'Cancelado']])],
    columns: ['id', 'cliente', 'fecha_pedido', 'estado', 'total'], search: 'Buscar cliente o identificación',
    filters: [relation('cliente', 'Cliente', '/pedidos/clientes/', false), choice('estado', 'Estado', [['PENDIENTE', 'Pendiente'], ['CONFIRMADO', 'Confirmado'], ['ENTREGADO', 'Entregado'], ['CANCELADO', 'Cancelado']], false)],
    ordering: [['-fecha_pedido', 'Más recientes'], ['fecha_pedido', 'Más antiguos'], ['estado', 'Estado']],
  },
  detalles: {
    title: 'Detalles de pedido', endpoint: '/pedidos/detalles/',
    fields: [relation('pedido', 'Orden', '/pedidos/ordenes/'), relation('procesamiento', 'Procesamiento', '/procesamiento/'), number('kilogramos', 'Kilogramos')],
    columns: ['id', 'pedido', 'procesamiento', 'kilogramos', 'precio_kg', 'total_linea'], search: 'Buscar cliente o presentación',
    filters: [relation('pedido', 'Orden', '/pedidos/ordenes/', false), relation('procesamiento', 'Procesamiento', '/procesamiento/', false), choice('producto', 'Presentación', PRODUCTOS, false)],
    ordering: [['-kilogramos', 'Más kg'], ['kilogramos', 'Menos kg'], ['precio_kg', 'Precio']],
  },
  gastos: {
    title: 'Gastos de faena', endpoint: '/liquidaciones/gastos/', consulta: true,
    fields: [relation('faena', 'Faena', '/faenas/'), choice('tipo', 'Tipo de gasto', [['HIELO', 'Hielo'], ['COMBUSTIBLE', 'Combustible'], ['OTRO', 'Otro']]), text('descripcion', 'Descripción'), number('monto', 'Monto'), date('fecha', 'Fecha')],
    columns: ['id', 'faena', 'tipo', 'descripcion', 'monto', 'fecha'], search: 'Buscar descripción o zona',
    filters: [relation('faena', 'Faena', '/faenas/', false), choice('tipo', 'Tipo de gasto', [['HIELO', 'Hielo'], ['COMBUSTIBLE', 'Combustible'], ['OTRO', 'Otro']], false)],
    ordering: [['-fecha', 'Más recientes'], ['fecha', 'Más antiguos'], ['monto', 'Monto']],
  },
  liquidaciones: {
    title: 'Liquidaciones', endpoint: '/liquidaciones/', consulta: true,
    fields: [relation('faena', 'Faena', '/faenas/'), date('fecha_liquidacion', 'Fecha'), choice('estado', 'Estado', [['PENDIENTE', 'Pendiente'], ['PAGADA', 'Pagada']])],
    columns: ['id', 'faena', 'fecha_liquidacion', 'estado', 'monto_bruto', 'total_gastos', 'monto_neto'], search: 'Buscar pescador o zona',
    filters: [relation('faena', 'Faena', '/faenas/', false), choice('estado', 'Estado', [['PENDIENTE', 'Pendiente'], ['PAGADA', 'Pagada']], false)],
    ordering: [['-fecha_liquidacion', 'Más recientes'], ['fecha_liquidacion', 'Más antiguos'], ['estado', 'Estado']],
  },
};

export function visibleModules(user) {
  if (!user) return [];
  if (user.rol !== 'Consulta') return MODULES;
  return MODULES.filter((module) => module.key !== 'pedidos');
}

export function canWrite(user) {
  return ['Administrador', 'Operador'].includes(user?.rol);
}

export function canDelete(user) {
  return user?.rol === 'Administrador';
}

export function labelFor(resourceKey, row) {
  if (!row) return '';
  switch (resourceKey) {
    case 'pescadores': return `${row.nombre || 'Pescador'} · ${row.identificacion || row.id}`;
    case 'embarcaciones': return `${row.nombre || 'Embarcación'} · ${row.matricula || row.id}`;
    case 'especies': return row.nombre || `Especie ${row.id}`;
    case 'faenas': return `Faena ${row.id} · ${row.zona || 'Sin zona'}`;
    case 'capturas': return `Captura ${row.id} · ${row.kilogramos ?? ''} kg`;
    case 'camaras': return `${row.nombre || 'Cámara'} · ${row.codigo || row.id}`;
    case 'lotes': return `${row.codigo || `Lote ${row.id}`} · ${row.estado || ''}`;
    case 'procesamientos': return `Proc. ${row.id} · ${row.producto || ''} · ${row.fecha_procesamiento || ''}`;
    case 'clientes': return `${row.nombre || 'Cliente'} · ${row.identificacion || row.id}`;
    case 'precios': return `Precio ${row.id} · ${row.producto || ''} · ₡${row.precio_kg ?? ''}`;
    case 'ordenes': return `Orden ${row.id} · ${row.estado || ''}`;
    case 'detalles': return `Detalle ${row.id} · ${row.kilogramos ?? ''} kg`;
    case 'gastos': return `${row.tipo || 'Gasto'} ${row.id} · ₡${row.monto ?? ''}`;
    case 'liquidaciones': return `Liquidación ${row.id} · ${row.estado || ''}`;
    default: return `${resourceKey} ${row.id ?? ''}`;
  }
}

export function moduleForResource(resourceKey) {
  return MODULES.find((module) => module.resources.includes(resourceKey));
}
