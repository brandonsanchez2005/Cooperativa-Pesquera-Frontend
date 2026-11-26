# Cooperativa Pesquera

API REST para gestionar pescadores, faenas, capturas, inventario, procesamiento, pedidos y liquidaciones de una cooperativa pesquera artesanal.

## Requisitos

- Python
- MySQL Server
- Una base de datos MySQL llamada `cooperativa_pesquera`

## Instalación y ejecución

Cree el entorno virtual e instale las dependencias:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Cree la base de datos en MySQL:

```sql
CREATE DATABASE cooperativa_pesquera CHARACTER SET utf8mb4;
```

Copie `.env.example` como `.env` y ajuste la clave secreta y los datos de conexión a MySQL. Para desarrollo local, agregue `DEBUG=True` al archivo `.env`.

```powershell
Copy-Item .env.example .env
```

Aplique las migraciones y cree un usuario administrador:

```powershell
python manage.py migrate
python manage.py createsuperuser
```

Inicie el servidor:

```powershell
python manage.py runserver
```

El panel administrativo está en `http://127.0.0.1:8000/admin/`.

## API y Postman

Obtenga un token con `POST http://127.0.0.1:8000/api/token/`, usando las credenciales de un usuario de Django. Envíe el token en las solicitudes protegidas con el encabezado:

```text
Authorization: Token <token>
```

Para probar la API, importe en Postman los archivos de `postman/` y seleccione el entorno **CooperativaPesquera Local**. Ingrese las credenciales solo en los valores locales del entorno.

## Frontend React

El frontend está en `frontend/` y usa React, Vite, React Router y Bootstrap 5. Requiere Node.js 22 o posterior.

En una terminal, desde la raíz del proyecto, instale y configure el frontend:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
```

El archivo `.env` del frontend define `VITE_API_BASE_URL`. Para desarrollo local, su valor inicial apunta a `http://127.0.0.1:8000/api`. En otra terminal, inicie Django con `python manage.py runserver`, luego ejecute el frontend:

```powershell
npm run dev
```

Vite publica la aplicación en `http://localhost:5173`. Django permite ese origen y `http://127.0.0.1:5173` mediante `django-cors-headers`; si se cambia el host o puerto de Vite, hay que actualizar `CORS_ALLOWED_ORIGINS` en `cooperativa_config/settings.py`. Para producción, agregue únicamente el origen real del frontend.

El acceso utiliza el token de Django REST Framework enviado como `Authorization: Token <token>`. El frontend requiere que el usuario pertenezca a uno de los grupos `Administrador`, `Operador` o `Consulta`. Para que la interfaz muestre el nombre y el perfil, consulta `/api/usuarios/me/`. Asocie el usuario de perfil `Consulta` con su pescador desde el administrador de Django.

### Preparar los tres perfiles

1. Inicie sesión en `/admin/` con el superusuario creado durante la instalación.
2. En **Groups**, cree los grupos `Administrador`, `Operador` y `Consulta`, respetando exactamente las mayúsculas.
3. En **Users**, cree tres usuarios locales, por ejemplo `admin_prueba`, `operador_prueba` y `consulta_prueba`, y asigne a cada uno su grupo. También puede usar el superusuario como perfil Administrador; los superusuarios reciben ese perfil automáticamente.
4. Cree un pescador para `consulta_prueba` y asigne ese usuario en el campo **usuario** del pescador. Esa relación define qué faenas y datos propios puede consultar.
5. Establezca contraseñas locales para las cuentas de demostración y compártalas solo con el equipo. No guarde contraseñas, tokens ni datos reales en GitHub o en `.env.example`.

### Preparar datos para la demostración

Desde `/admin/`, cree los registros en este orden para mantener sus relaciones:

1. Una **Embarcación** activa con capacidad suficiente, por ejemplo 1000 kg.
2. Una **Especie** activa con temperatura máxima, por ejemplo 4 °C.
3. Una **Faena** para el pescador vinculado con `consulta_prueba`, usando la embarcación y fechas válidas.
4. Una **Captura** de esa faena y especie, por ejemplo 20 kg a ₡2500 por kg.
5. Una **Cámara fría** activa, con capacidad suficiente y temperatura dentro del máximo de la especie.
6. Un **Lote de inventario** ligado a la captura y a la cámara, con fecha de vencimiento posterior al ingreso y hasta 20 kg iniciales.
7. Un **Procesamiento** del lote, por ejemplo 5 kg procesados y 4 kg obtenidos.
8. Un **Cliente** activo y un **Precio semanal** para la misma especie y producto, cuya vigencia incluya la fecha del pedido.
9. Cree un **Pedido** pendiente y añádale un **Detalle de pedido** mediante `POST /api/pedidos/detalles/`; el precio se toma del precio semanal vigente.
10. Antes de pagar la faena, cree cualquier **Gasto** y una **Liquidación** pendiente. Después puede cambiar su estado a `PAGADA` para mostrar que los gastos y capturas quedan protegidos.

Use registros ficticios y fechas actuales o futuras según corresponda. Para la prueba del perfil Consulta, la faena debe pertenecer al pescador asociado a esa cuenta; las otras dos cuentas permiten comprobar las acciones de Operador y Administrador.

El cierre de sesión elimina el token guardado por el navegador. El backend actual no tiene un endpoint de revocación, por lo que el token continúa válido en el servidor hasta que se revoque desde Django.

Genere la versión lista para entrega con:

```powershell
npm run build
```

## Matrices y demostración

Las matrices de pantallas, endpoints, permisos y escenarios manuales están en `docs/`.

## Limitaciones conocidas

- Cerrar sesión elimina el token del navegador, pero el backend no ofrece una ruta para revocarlo; continúa válido hasta revocarlo desde Django.
- La API no administra usuarios ni grupos. Las cuentas y perfiles se preparan desde el administrador de Django.
- CORS permite los orígenes locales de Vite para desarrollo. En producción se debe configurar el origen donde se publique el frontend.
- El frontend requiere que Django y la base MySQL estén disponibles; no incluye modo sin conexión.
