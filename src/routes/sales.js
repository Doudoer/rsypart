const express = require('express');
const db = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all sales (filtered based on role)
router.get('/', authMiddleware, (req, res) => {
  const { includeArchived } = req.query;
  
  let query = 'SELECT s.*, c.nombre as client_nombre, c.telefono as client_telefono, u.username as created_by_username FROM sales s JOIN clients c ON s.client_id = c.id JOIN users u ON s.created_by = u.id';
  
  // Filter out archived sales unless explicitly requested
  if (includeArchived !== 'true') {
    query += " WHERE s.estatus NOT IN ('entregado', 'reembolsado')";
  }
  
  query += ' ORDER BY s.created_at DESC';

  db.all(query, [], (err, sales) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(sales);
  });
});

// Get single sale
router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT s.*, c.nombre as client_nombre, c.telefono as client_telefono, u.username as created_by_username 
     FROM sales s 
     JOIN clients c ON s.client_id = c.id 
     JOIN users u ON s.created_by = u.id 
     WHERE s.id = ?`,
    [id],
    (err, sale) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
      }
      res.json(sale);
    }
  );
});

// Create sale (Vendedor and Admin only)
router.post('/', authMiddleware, requireRole('vendedor', 'admin'), (req, res) => {
  const { client_nombre, client_telefono, parte, precio, fecha, year, marca, modelo } = req.body;

  if (!client_nombre || !client_telefono || !parte || !precio || !fecha) {
    return res.status(400).json({ error: 'All fields are required: client_nombre, client_telefono, parte, precio, fecha' });
  }

  // First, create or get client
  db.run(
    'INSERT INTO clients (nombre, telefono) VALUES (?, ?)',
    [client_nombre, client_telefono],
    function(err) {
      const clientId = this.lastID;

      // If client already exists, try to find it
      if (err) {
        db.get('SELECT id FROM clients WHERE nombre = ? AND telefono = ?', 
          [client_nombre, client_telefono], 
          (err, client) => {
            if (err || !client) {
              return res.status(500).json({ error: 'Database error' });
            }
            createSale(client.id);
          }
        );
      } else {
        createSale(clientId);
      }
    }
  );

  function createSale(clientId) {
    db.run(
      'INSERT INTO sales (client_id, parte, precio, fecha, year, marca, modelo, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [clientId, parte, precio, fecha, year, marca, modelo, req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ 
          id: this.lastID, 
          message: 'Sale created successfully' 
        });
      }
    );
  }
});

// Update sale status (Dueño and Admin only)
router.patch('/:id/status', authMiddleware, requireRole('dueño', 'admin'), (req, res) => {
  const { id } = req.params;
  const { estatus } = req.body;

  if (!estatus) {
    return res.status(400).json({ error: 'Status is required' });
  }

  if (!['buscando', 'listo', 'entregado', 'reembolsado'].includes(estatus)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    'UPDATE sales SET estatus = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [estatus, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Sale not found' });
      }
      res.json({ message: 'Status updated successfully' });
    }
  );
});

// Update sale (Admin only for full updates)
router.put('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { parte, precio, fecha, year, marca, modelo, estatus } = req.body;

  const updates = [];
  const params = [];

  if (parte !== undefined) {
    updates.push('parte = ?');
    params.push(parte);
  }
  if (precio !== undefined) {
    updates.push('precio = ?');
    params.push(precio);
  }
  if (fecha !== undefined) {
    updates.push('fecha = ?');
    params.push(fecha);
  }
  if (year !== undefined) {
    updates.push('year = ?');
    params.push(year);
  }
  if (marca !== undefined) {
    updates.push('marca = ?');
    params.push(marca);
  }
  if (modelo !== undefined) {
    updates.push('modelo = ?');
    params.push(modelo);
  }
  if (estatus !== undefined) {
    if (!['buscando', 'listo', 'entregado', 'reembolsado'].includes(estatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    updates.push('estatus = ?');
    params.push(estatus);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  db.run(
    `UPDATE sales SET ${updates.join(', ')} WHERE id = ?`,
    params,
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Sale not found' });
      }
      res.json({ message: 'Sale updated successfully' });
    }
  );
});

// Delete sale (Admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM sales WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    res.json({ message: 'Sale deleted successfully' });
  });
});

module.exports = router;
