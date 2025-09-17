// #####################################################################
// # Utility per la Gestione Centralizzata dei Progressivi v2.2
// # File: opero-gestionale-main/utils/progressivi.js
// #####################################################################
const { dbPool } = require('../config/db');

/**
 * Recupera il prossimo numero per un dato progressivo, garantendo la coerenza cronologica.
 * Questa funzione gestisce la propria transazione per garantire che un numero,
 * una volta generato, non venga mai riutilizzato.
 * @param {string} codiceProgressivo Il codice del contatore (es. 'PROT_CONT').
 * @param {number} idDitta L'ID della ditta.
 * @param {string | Date} dataDocumento La data del documento (es. '2025-09-17') a cui associare il progressivo.
 * @returns {Promise<number>} Il nuovo numero progressivo.
 * @throws {Error} Se il progressivo non è definito, se la data è antecedente all'ultima registrata, o per altri errori.
 */
async function getNextProgressivo(codiceProgressivo, idDitta, dataDocumento) {
    if (!dataDocumento) {
        throw new Error("La data del documento è obbligatoria per generare un progressivo.");
    }
    
    // Converte l'input in un oggetto Date per confronti sicuri
    const dataDocumentoObj = new Date(dataDocumento);
    // Azzera l'ora per evitare problemi di fuso orario nei confronti
    dataDocumentoObj.setHours(0, 0, 0, 0);

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // <span style="color:green;">// MODIFICATO: Seleziona anche data_ult per il controllo di coerenza.</span>
        const [rows] = await connection.query(
            'SELECT ultimo_numero, data_ult FROM an_progressivi WHERE id_ditta = ? AND codice_progressivo = ? FOR UPDATE',
            [idDitta, codiceProgressivo]
        );

        if (rows.length === 0) {
            throw new Error(`Progressivo con codice '${codiceProgressivo}' non trovato per la ditta ID ${idDitta}.`);
        }

        const { ultimo_numero, data_ult } = rows[0];

        // <span style="color:green;">// NUOVO: Controllo di coerenza cronologica.</span>
        // Se esiste una data precedente, la nuova data non può essere anteriore.
        if (data_ult) {
            const dataUltObj = new Date(data_ult);
            dataUltObj.setHours(0, 0, 0, 0);
            
            if (dataDocumentoObj < dataUltObj) {
                throw new Error(`La data del documento (${dataDocumentoObj.toLocaleDateString('it-IT')}) non può essere antecedente all'ultima data registrata (${dataUltObj.toLocaleDateString('it-IT')}).`);
            }
        }

        const nuovoNumero = ultimo_numero + 1;
        const dataPerQuery = dataDocumentoObj.toISOString().slice(0, 10); // Formato YYYY-MM-DD

        await connection.query(
            'UPDATE an_progressivi SET ultimo_numero = ?, data_ult = ? WHERE id_ditta = ? AND codice_progressivo = ?',
            [nuovoNumero, dataPerQuery, idDitta, codiceProgressivo]
        );

        await connection.commit();
        return nuovoNumero;
    } catch (error) {
        await connection.rollback();
        console.error("Errore in getNextProgressivo:", error.message);
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { getNextProgressivo };

