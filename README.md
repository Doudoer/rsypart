# rsypart - Sistema G-Partes

Sistema de Gestión de Ventas de Partes Automotrices

## Descripción

G-Partes es un sistema web completo para la gestión de ventas de partes automotrices con control de acceso basado en roles, gestión de clientes, seguimiento de estatus y módulo de reclamos post-venta.

## Características

### Sistema de Autenticación
- Login seguro con JWT
- Tres roles de usuario:
  - **Admin**: Acceso completo (CRUD de ventas, usuarios y gestión de reclamos)
  - **Vendedor**: Crear ventas
  - **Dueño**: Actualizar estatus de ventas

### Gestión de Ventas
- Registro de ventas con información del cliente (Nombre, Teléfono)
- Información de la parte: Año, Marca, Modelo, Parte
- Precio y fecha de venta
- Sistema de estatus:
  - **Pendientes**: Buscando, Listo
  - **Archivados**: Entregado, Reembolsado (no aparecen en el dashboard por defecto)

### Módulo de Reclamos
- Gestión post-venta para cambios y reembolsos
- Seguimiento de estatus: Pendiente, Resuelto, Rechazado
- Vinculación automática con ventas

### Gestión de Usuarios
- Solo Admin puede crear usuarios
- CRUD completo de usuarios

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Doudoer/rsypart.git
cd rsypart
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (opcional):
```bash
# Editar .env si necesario
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
```

4. Iniciar el servidor:
```bash
npm start
```

5. Acceder a la aplicación:
```
http://localhost:3000
```

## Credenciales Predeterminadas

- **Usuario**: admin
- **Contraseña**: admin123

**Importante**: Cambiar la contraseña del admin después del primer inicio de sesión.

## Estructura del Proyecto

```
rsypart/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de SQLite
│   ├── middleware/
│   │   └── auth.js               # Middleware de autenticación
│   ├── routes/
│   │   ├── auth.js               # Rutas de autenticación
│   │   ├── users.js              # Rutas de usuarios
│   │   ├── sales.js              # Rutas de ventas
│   │   ├── claims.js             # Rutas de reclamos
│   │   └── parts.js              # Validación de partes
│   └── server.js                 # Servidor Express
├── public/
│   ├── css/
│   │   └── styles.css            # Estilos de la aplicación
│   ├── js/
│   │   └── app.js                # Lógica del frontend
│   └── index.html                # Interfaz de usuario
├── .env                          # Variables de entorno
├── .gitignore                    # Archivos ignorados por Git
├── package.json                  # Dependencias del proyecto
└── README.md                     # Documentación
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Usuarios (Solo Admin)
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Ventas
- `GET /api/sales` - Listar ventas (query: includeArchived=true para ver archivados)
- `GET /api/sales/:id` - Obtener venta específica
- `POST /api/sales` - Crear venta (Vendedor y Admin)
- `PATCH /api/sales/:id/status` - Actualizar estatus (Dueño y Admin)
- `PUT /api/sales/:id` - Actualizar venta completa (Solo Admin)
- `DELETE /api/sales/:id` - Eliminar venta (Solo Admin)

### Reclamos
- `GET /api/claims` - Listar todos los reclamos
- `GET /api/claims/sale/:saleId` - Obtener reclamos de una venta
- `POST /api/claims` - Crear reclamo
- `PATCH /api/claims/:id/status` - Actualizar estatus del reclamo
- `DELETE /api/claims/:id` - Eliminar reclamo

### Validación de Partes
- `POST /api/parts/validate` - Validar información de parte (Año/Marca/Modelo/Parte)

## Uso

### Crear una Venta (Vendedor)
1. Iniciar sesión con credenciales de Vendedor
2. Ir a la sección "Ventas"
3. Hacer clic en "Nueva Venta"
4. Llenar el formulario con información del cliente y la parte
5. Guardar

### Actualizar Estatus (Dueño)
1. Iniciar sesión con credenciales de Dueño
2. En la lista de ventas, usar el selector de estatus
3. Cambiar entre: Buscando → Listo → Entregado/Reembolsado

### Gestionar Reclamos
1. Ir a la sección "Reclamos"
2. Hacer clic en "Nuevo Reclamo"
3. Ingresar ID de venta, tipo (Cambio/Reembolso) y descripción
4. El estatus se puede actualizar: Pendiente → Resuelto/Rechazado
5. Los reembolsos resueltos actualizan automáticamente el estatus de la venta a "Reembolsado"

### Crear Usuarios (Admin)
1. Iniciar sesión como Admin
2. Ir a la sección "Usuarios"
3. Hacer clic en "Nuevo Usuario"
4. Completar formulario con usuario, contraseña y rol
5. Guardar

## Tecnologías Utilizadas

- **Backend**: Node.js, Express 5
- **Base de Datos**: SQLite
- **Autenticación**: JWT (JSON Web Tokens)
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Seguridad**: bcryptjs para hash de contraseñas

## Base de Datos

El sistema utiliza SQLite con las siguientes tablas:

- `users` - Usuarios del sistema
- `clients` - Información de clientes
- `sales` - Registro de ventas
- `claims` - Reclamos post-venta

La base de datos se crea automáticamente al iniciar la aplicación por primera vez.

## Consideraciones de Seguridad

- Las contraseñas se almacenan hasheadas con bcrypt
- JWT para autenticación stateless
- Validación de roles en cada endpoint
- Variables de entorno para secretos
- **Importante**: Cambiar JWT_SECRET en producción

## Desarrollo Futuro

- Implementación de API real para validación de partes
- Reportes y estadísticas
- Notificaciones por email
- Exportación de datos (CSV, PDF)
- Filtros avanzados en el dashboard
- Historial de cambios de estatus

## Testing

El sistema incluye una suite completa de pruebas automatizadas. Ver [TESTING.md](TESTING.md) para más detalles.

Para ejecutar las pruebas:
```bash
# Asegurarse de que el servidor esté corriendo
npm start

# En otra terminal, ejecutar las pruebas
./tests/test-api.sh
./tests/test-roles.sh
./tests/test-archived.sh
./tests/test-refund.sh
```

Todas las pruebas pasan exitosamente (12/12 - 100% de cobertura de requisitos).

## Licencia

ISC

## Soporte

Para reportar problemas o sugerencias, crear un issue en el repositorio de GitHub.
