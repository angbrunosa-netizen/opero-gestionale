// #####################################################################
// # Configurazione Centralizzata del Database
// # File: opero/config/db.js
// #####################################################################
require('dotenv').config();

let dbPool;
let dbType;

// Controlliamo l'ambiente una sola volta
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    console.log('Ambiente di produzione rilevato. Connessione a PostgreSQL...');
    dbType = 'postgres';
    const { Pool } = require('pg');
    dbPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    console.log('Ambiente di sviluppo rilevato. Connessione a MySQL...');
    dbType = 'mysql';
    const mysql = require('mysql2/promise');
    dbPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'operodb',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

// Esportiamo sia il pool di connessioni che il tipo di DB, 
// potrebbe essere utile in futuro per gestire query specifiche.
module.exports = { dbPool, dbType };