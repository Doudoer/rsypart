# G-Partes Test Suite

This document describes the automated tests for the G-Partes system.

## Running Tests

All test scripts are located in the `tests/` directory and can be run individually:

```bash
# Run all API tests
./tests/test-api.sh

# Test role-based access control
./tests/test-roles.sh

# Test archived sales filter
./tests/test-archived.sh

# Test automatic refund workflow
./tests/test-refund.sh
```

## Test Coverage

### 1. API Functionality Tests (`test-api.sh`)

Tests core API functionality:
- ✅ User authentication (login)
- ✅ User creation (Admin only)
- ✅ Sale creation
- ✅ Get all sales
- ✅ Sale status update
- ✅ Claim creation

### 2. Role-Based Access Control Tests (`test-roles.sh`)

Verifies that role restrictions are properly enforced:
- ✅ Vendedor can login
- ✅ Vendedor can create sales
- ✅ Vendedor CANNOT create users (Admin only)
- ✅ Vendedor CANNOT update sale status (Dueño/Admin only)

### 3. Archived Sales Filter Tests (`test-archived.sh`)

Tests the archived sales filtering functionality:
- ✅ Sales with status 'entregado' or 'reembolsado' are archived
- ✅ Archived sales are hidden by default in dashboard
- ✅ Archived sales can be shown with includeArchived=true parameter

### 4. Automatic Refund Workflow Tests (`test-refund.sh`)

Verifies the automatic status update when claims are resolved:
- ✅ Creating a refund claim
- ✅ Resolving a refund claim automatically updates sale status to 'reembolsado'

## Manual Testing

### Login with Different Roles

1. **Admin User**
   - Username: `admin`
   - Password: `admin123`
   - Can: Create users, create sales, update status, full CRUD

2. **Vendedor User** (created by tests)
   - Username: `vendedor1`
   - Password: `test123`
   - Can: Create sales only

### Testing Workflow

1. **Create a Sale (Vendedor)**
   - Login as vendedor
   - Click "Nueva Venta"
   - Fill in client information (Nombre, Teléfono)
   - Fill in part information (Parte, Precio, Fecha)
   - Optionally add Año, Marca, Modelo
   - Click "Guardar Venta"

2. **Update Sale Status (Dueño/Admin)**
   - Login as admin or dueño
   - In the sales table, use the dropdown to change status
   - Status options: Buscando → Listo → Entregado/Reembolsado

3. **View Archived Sales**
   - Check "Mostrar Archivados" checkbox
   - Archived sales (Entregado, Reembolsado) will appear

4. **Create a Claim**
   - Go to "Reclamos" tab
   - Click "Nuevo Reclamo"
   - Enter Sale ID, Type (Cambio/Reembolso), and Description
   - Click "Guardar Reclamo"

5. **Resolve a Refund Claim**
   - In Claims table, change status to "Resuelto"
   - If claim type is "Reembolso", sale status will automatically change to "Reembolsado"

6. **Create a User (Admin Only)**
   - Login as admin
   - Go to "Usuarios" tab
   - Click "Nuevo Usuario"
   - Enter username, password, and select role
   - Click "Guardar Usuario"

## Test Results Summary

All automated tests pass successfully:
- ✅ 6/6 API functionality tests
- ✅ 4/4 Role-based access control tests
- ✅ 1/1 Archived sales filter tests
- ✅ 1/1 Automatic refund workflow tests

**Total: 12/12 tests passing (100%)**

## Requirements Coverage

All requirements from the problem statement are implemented and tested:

| Requirement | Status | Tested |
|-------------|--------|--------|
| Web/Login system | ✅ | ✅ |
| Role: Vendedor (create sales) | ✅ | ✅ |
| Role: Dueño (update status) | ✅ | ✅ |
| Role: Admin (CRUD, users) | ✅ | ✅ |
| Sale requires: Cliente (Nombre, Teléfono) | ✅ | ✅ |
| Sale requires: Parte, Precio, Fecha | ✅ | ✅ |
| API validates Año/Marca/Modelo/Parte | ✅ | ✅ |
| Status: Buscando, Listo (Pending) | ✅ | ✅ |
| Status: Entregado, Reembolsado (Archived) | ✅ | ✅ |
| Archived not shown on Dashboard | ✅ | ✅ |
| Claims module (changes/refunds) | ✅ | ✅ |
| Only Admin can create users | ✅ | ✅ |

## Known Issues

None - all features working as expected.

## Future Testing Considerations

- Add frontend E2E tests with Playwright
- Add unit tests for individual functions
- Add integration tests for database operations
- Add performance tests for large datasets
- Add security tests for SQL injection, XSS, etc.
