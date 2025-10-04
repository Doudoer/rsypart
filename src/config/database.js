const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'vendedor', 'dueño')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Clients table
    db.run(`CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      telefono TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Sales table
    db.run(`CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      parte TEXT NOT NULL,
      precio REAL NOT NULL,
      fecha DATE NOT NULL,
      year TEXT,
      marca TEXT,
      modelo TEXT,
      estatus TEXT NOT NULL DEFAULT 'buscando' CHECK(estatus IN ('buscando', 'listo', 'entregado', 'reembolsado')),
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`);

    // Claims table
    db.run(`CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('cambio', 'reembolso')),
      descripcion TEXT NOT NULL,
      estatus TEXT NOT NULL DEFAULT 'pendiente' CHECK(estatus IN ('pendiente', 'resuelto', 'rechazado')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (sale_id) REFERENCES sales(id)
    )`);

    // Create default admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    db.run(
      `INSERT OR IGNORE INTO users (id, username, password, role) VALUES (1, 'admin', ?, 'admin')`,
      [defaultPassword],
      (err) => {
        if (!err) {
          console.log('Default admin user created (username: admin, password: admin123)');
        }
      }
    );
  });
}

module.exports = db;
