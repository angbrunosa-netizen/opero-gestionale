// knexfile.js
require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    pool: {
      min: 2,
      max: 10, // Per sviluppo 10 connessioni sono sufficienti
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      createRetryIntervalMillis: 200,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    // Debug logging in sviluppo
    log: {
      warn(message) {
        console.log('[Knex Warning]', message);
      },
      error(message) {
        console.error('[Knex Error]', message);
      },
      deprecate(message) {
        console.log('[Knex Deprecation]', message);
      },
      debug(message) {
        console.log('[Knex Debug]', message);
      }
    }
  },

  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    pool: {
      min: 5, // Mantieni almeno 5 connessioni pronte
      max: 100, // 100 connessioni per produzione - gestisce traffico elevato
      acquireTimeoutMillis: 60000, // 60 secondi per acquisire connessione
      idleTimeoutMillis: 30000, // 30 secondi idle prima di rilasciare
      reapIntervalMillis: 1000, // Controlla ogni secondo connessioni idle
      createTimeoutMillis: 30000, // 30 secondi per creare nuova connessione
      destroyTimeoutMillis: 5000, // 5 secondi per distruggere connessione
      createRetryIntervalMillis: 100, // Retry più veloce tra tentativi
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    // Logging in produzione (solo errori)
    log: {
      warn(message) {
        console.log('[Knex Warning]', message);
      },
      error(message) {
        console.error('[Knex Error]', message);
      },
      deprecate(message) {
        console.log('[Knex Deprecation]', message);
      },
      debug(message) {
        // Disabilita debug in produzione
      }
    }
  }
};