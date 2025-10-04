# Quick Start Guide - G-Partes

## Prerequisites
- Node.js 14+ installed
- npm installed

## Installation (3 steps)

1. **Clone and install:**
   ```bash
   git clone https://github.com/Doudoer/rsypart.git
   cd rsypart
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   Server will start at http://localhost:3000

3. **Login:**
   - Open http://localhost:3000 in your browser
   - Username: `admin`
   - Password: `admin123`

## First Steps

### As Admin (full access):
1. **Create users** - Go to "Usuarios" tab → Click "Nuevo Usuario"
2. **Create a sale** - Go to "Ventas" tab → Click "Nueva Venta"
3. **Update status** - Use dropdown in sales table
4. **Create claim** - Go to "Reclamos" tab → Click "Nuevo Reclamo"

### As Vendedor (sales only):
1. Login with vendedor credentials
2. Create new sales
3. View existing sales

### As Dueño (status updates):
1. Login with dueño credentials
2. Update sale status using dropdowns
3. View all sales

## Key Features

### Sales Workflow
1. Vendedor creates sale → Status: "Buscando"
2. Dueño finds part → Status: "Listo"
3. Customer receives → Status: "Entregado" (archived)
4. Or refund → Status: "Reembolsado" (archived)

### Claims Workflow
1. Create claim (type: Cambio or Reembolso)
2. Update status: Pendiente → Resuelto/Rechazado
3. If refund is resolved, sale status auto-updates to "Reembolsado"

### Viewing Archived Sales
- By default, archived sales (Entregado, Reembolsado) are hidden
- Check "Mostrar Archivados" to see all sales

## Testing

Run automated tests:
```bash
# Make sure server is running first
npm start

# In another terminal:
./tests/test-api.sh
./tests/test-roles.sh  
./tests/test-archived.sh
./tests/test-refund.sh
```

All tests should pass (12/12).

## Configuration

Edit `.env` file to customize:
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret for JWT tokens (change in production!)
- `NODE_ENV` - Environment (development/production)

## Common Tasks

### Create a new Vendedor user:
1. Login as admin
2. Go to Usuarios → Nuevo Usuario
3. Username: `vendedor1`, Password: `test123`, Role: `vendedor`

### Create a new Dueño user:
1. Login as admin
2. Go to Usuarios → Nuevo Usuario
3. Username: `dueno1`, Password: `test123`, Role: `dueño`

### Archive a sale:
1. Login as admin or dueño
2. Change sale status to "Entregado" or "Reembolsado"
3. Sale disappears from main view (check "Mostrar Archivados" to see it)

### Process a refund:
1. Go to Reclamos → Nuevo Reclamo
2. Enter Sale ID, Type: `reembolso`, Description
3. Save claim
4. Update claim status to "Resuelto"
5. Sale status automatically changes to "Reembolsado"

## Troubleshooting

**Server won't start:**
- Check if port 3000 is already in use
- Try changing PORT in .env file

**Can't login:**
- Make sure you're using correct credentials (admin/admin123)
- Check browser console for errors

**Database errors:**
- Delete `database.sqlite` file
- Restart server (will recreate with default admin)

**Tests fail:**
- Make sure server is running on port 3000
- Check if database has expected data

## Support

See documentation:
- [README.md](README.md) - Full documentation
- [TESTING.md](TESTING.md) - Testing guide
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Technical overview

## Next Steps

1. Change default admin password
2. Create your users (vendedores, dueños)
3. Start creating sales
4. Set up production deployment
5. Configure real parts validation API

Enjoy using G-Partes! 🚀
