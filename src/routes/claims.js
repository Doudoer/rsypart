const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all claims
router.get('/', authMiddleware, (req, res) => {
  db.all(
    `SELECT cl.*, s.parte, s.precio, c.nombre as client_nombre 
     FROM claims cl 
     JOIN sales s ON cl.sale_id = s.id 
     JOIN clients c ON s.client_id = c.id 
     ORDER BY cl.created_at DESC`,
    [],
    (err, claims) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(claims);
    }
  );
});

// Get claims for a specific sale
router.get('/sale/:saleId', authMiddleware, (req, res) => {
  const { saleId } = req.params;

  db.all(
    'SELECT * FROM claims WHERE sale_id = ? ORDER BY created_at DESC',
    [saleId],
    (err, claims) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(claims);
    }
  );
});

// Create claim
router.post('/', authMiddleware, (req, res) => {
  const { sale_id, tipo, descripcion } = req.body;

  if (!sale_id || !tipo || !descripcion) {
    return res.status(400).json({ error: 'sale_id, tipo, and descripcion are required' });
  }

  if (!['cambio', 'reembolso'].includes(tipo)) {
    return res.status(400).json({ error: 'Invalid tipo. Must be "cambio" or "reembolso"' });
  }

  db.run(
    'INSERT INTO claims (sale_id, tipo, descripcion) VALUES (?, ?, ?)',
    [sale_id, tipo, descripcion],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ 
        id: this.lastID, 
        message: 'Claim created successfully' 
      });
    }
  );
});

// Update claim status
router.patch('/:id/status', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { estatus } = req.body;

  if (!estatus) {
    return res.status(400).json({ error: 'estatus is required' });
  }

  if (!['pendiente', 'resuelto', 'rechazado'].includes(estatus)) {
    return res.status(400).json({ error: 'Invalid estatus' });
  }

  const resolved_at = estatus === 'resuelto' ? new Date().toISOString() : null;

  db.run(
    'UPDATE claims SET estatus = ?, resolved_at = ? WHERE id = ?',
    [estatus, resolved_at, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      // If claim is resolved as reembolso, update sale status
      if (estatus === 'resuelto') {
        db.get('SELECT tipo, sale_id FROM claims WHERE id = ?', [id], (err, claim) => {
          if (!err && claim && claim.tipo === 'reembolso') {
            db.run('UPDATE sales SET estatus = ? WHERE id = ?', ['reembolsado', claim.sale_id]);
          }
        });
      }

      res.json({ message: 'Claim status updated successfully' });
    }
  );
});

// Delete claim
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM claims WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    res.json({ message: 'Claim deleted successfully' });
  });
});

module.exports = router;
