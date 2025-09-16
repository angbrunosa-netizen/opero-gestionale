// #####################################################################
// # Configurazione Centralizzata del Database - v4.0 (con Knex)
// # File: opero/config/db.js
// #####################################################################
require('dotenv').config();
const mysql = require('mysql2/promise');

// --- 1. Inizializzazione del Pool di Connessioni Nativo (dbPool) ---
let dbPool;
// ... (la logica per creare dbPool per produzione o sviluppo rimane invariata)
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    // Logica per PostgreSQL in produzione...
    const { Pool } = require('pg');
    dbPool = new Pool({ /* ... configurazione ... */ });
} else {
    // Logica per MySQL in sviluppo
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


// <span style="color:red;">// NUOVO: Inizializzazione di Knex.js</span>
// Questa è la parte mancante che causava l'errore.
// Ora creiamo l'istanza di Knex leggendo la configurazione dal file knexfile.js.

// 2.1. Importiamo Knex e il suo file di configurazione
const knexInitializer = require('knex');
const knexConfig = require('../knexfile'); // Assumiamo che knexfile.js sia nella root del progetto

// 2.2. Determiniamo l'ambiente corrente (sviluppo o produzione)
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// 2.3. Creiamo l'istanza di Knex
const knex = knexInitializer(config);


// <span style="color:green;">// MODIFICA: Esportiamo ANCHE l'istanza di Knex</span>
// Ora l'oggetto esportato contiene sia dbPool che knex, rendendoli entrambi
// disponibili per l'importazione nel resto dell'applicazione.
module.exports = { dbPool, knex };
