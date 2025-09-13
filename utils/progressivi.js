// #####################################################################
// # Utility per la Gestione Centralizzata dei Progressivi v2.0
// # File: opero-gestionale-main/utils/progressivi.js
// #####################################################################
const { dbPool } = require('../config/db');

/**
 * Recupera il prossimo numero per un dato progressivo in modo atomico e sicuro.
 * Questa funzione gestisce la propria transazione per garantire che un numero,
 * una volta generato, non venga mai riutilizzato, anche se l'operazione
 * principale che lo richiede dovesse fallire.
 * @param {string} codiceProgressivo Il codice del contatore (es. 'PROT_CONT').
 * @param {number} idDitta L'ID della ditta.
 * @returns {Promise<number>} Il nuovo numero progressivo.
 * @throws {Error} Se il progressivo non è definito o si verifica un errore.
 */
async function getNextProgressivo(codiceProgressivo, idDitta) {
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            'SELECT ultimo_numero FROM an_progressivi WHERE id_ditta = ? AND codice_progressivo = ? FOR UPDATE',
            [idDitta, codiceProgressivo]
        );

        if (rows.length === 0) {
            throw new Error(`Progressivo con codice '${codiceProgressivo}' non trovato per la ditta ID ${idDitta}.`);
        }

        const ultimoNumero = rows[0].ultimo_numero;
        const nuovoNumero = ultimoNumero + 1;

        await connection.query(
            'UPDATE an_progressivi SET ultimo_numero = ? WHERE id_ditta = ? AND codice_progressivo = ?',
            [nuovoNumero, idDitta, codiceProgressivo]
        );

        await connection.commit();
        return nuovoNumero;
    } catch (error) {
        await connection.rollback();
        // Rilancia l'errore per essere gestito dal chiamante (es. la rotta)
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { getNextProgressivo };

