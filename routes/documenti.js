/**
 * File: /routes/documenti.js
 *
 * Versione: 1.1.0 (Correzione SuperAdmin + Ripristino)
 *
 * Descrizione: Questo file di rotte gestisce tutte le API
 * per il Modulo Gestione Documentale (DMS).
 * Include la generazione di URL pre-firmati S3 per upload/download,
 * la finalizzazione (registrazione DB) e l'eliminazione dei file.
 *
 * Include il fix per il crash `Cannot read 'id' of undefined`
 * controllando l'esistenza di `req.ditta` (necessario per i SuperAdmin).
 */

const express = require('express');
const router = express.Router();
const knex = require('../config/db'); // Importa Knex
const { v4: uuidv4 } = require('uuid'); // Per generare nomi file univoci

// Import middleware di autenticazione e permessi
// logAzione è in auth.js (come da correzione precedente)
const { verifyToken, checkPermission, logAzione } = require('../utils/auth');

// Import del nostro client S3 e dei comandi
const {
  s3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  getSignedUrl,
  S3_BUCKET_NAME
} = require('../utils/s3Client');

// --- API 1: GENERARE URL PER UPLOAD (CHIEDE PERMESSO) ---
// Il frontend chiama questa API PRIMA di caricare un file.
router.post('/generate-upload-url', verifyToken, checkPermission('DM_FILE_UPLOAD'), async (req, res) => {
  try {
    // --- CONTROLLO DI SICUREZZA DITTA (Fix SuperAdmin) ---
    if (!req.ditta || !req.ditta.id) {
      return res.status(400).json({ error: 'Nessuna ditta selezionata. Se sei un SuperAdmin, seleziona una ditta prima di procedere.' });
    }
    const idDitta = req.ditta.id;
    // --- FINE CONTROLLO ---

    const { fileName, fileSize, mimeType } = req.body;

    if (!fileName || !fileSize || !mimeType) {
      return res.status(400).json({ error: 'Dati file (fileName, fileSize, mimeType) mancanti.' });
    }

    // --- CONTROLLO QUOTA (PIANI) ---
    const ditta = await knex('ditte').where({ id: idDitta }).first();
    const maxSizeByte = (ditta.max_storage_mb || 0) * 1024 * 1024;
    const currentSizeByte = ditta.current_storage_bytes || 0;

    if (currentSizeByte + fileSize > maxSizeByte) {
      return res.status(402).json({ // 402 Payment Required è un codice appropriato per "Quota superata"
        error: `Quota di archiviazione superata. Spazio utilizzato: ${formatFileSize(currentSizeByte)} / ${formatFileSize(maxSizeByte)}`
      });
    }
    // --- FINE CONTROLLO QUOTA ---

    // Genera una chiave (percorso) univoca per S3
    // Es: ditta_1/allegati/a1b2c3d4-e5f6-....pdf
    const s3Key = `ditta_${idDitta}/allegati/${uuidv4()}-${fileName}`;

    // Crea il comando per un PUT (caricamento)
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      ContentType: mimeType,
      ContentLength: fileSize
    });

    // Genera l'URL pre-firmato valido per 5 minuti
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    res.json({ uploadUrl, s3Key });

  } catch (error) {
    console.error("Errore generazione URL upload S3:", error);
    res.status(500).json({ error: "Errore interno del server (S3 Upload URL)." });
  }
});


// --- API 2: FINALIZZAZIONE UPLOAD (REGISTRAZIONE DB) ---
// Il frontend chiama questa API DOPO aver caricato il file su S3.
router.post('/finalize-upload', verifyToken, checkPermission('DM_FILE_UPLOAD'), async (req, res) => {
  
  // --- CONTROLLO DI SICUREZZA DITTA (Fix SuperAdmin) ---
  if (!req.ditta || !req.ditta.id) {
    return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
  }
  const idDitta = req.ditta.id;
  // --- FINE CONTROLLO ---

  const { s3Key, fileName, fileSize, mimeType, entita_tipo, entita_id } = req.body;

  if (!s3Key || !fileName || !fileSize || !entita_tipo || !entita_id) {
    return res.status(400).json({ error: 'Dati di finalizzazione (s3Key, fileName, fileSize, entita_tipo, entita_id) mancanti.' });
  }

  const trx = await knex.transaction(); // OBBLIGO TRANSAZIONE
  
  try {
    // 1. Inserisci il file fisico in dm_files
    const [insertedFile] = await trx('dm_files').insert({
      id_ditta: idDitta,
      id_utente_upload: req.user.id,
      file_name_originale: fileName,
      file_size_bytes: fileSize,
      mime_type: mimeType,
      s3_key: s3Key
    }).returning('*'); // Restituisce l'oggetto inserito

    // 2. Collega il file all'entità
    await trx('dm_allegati_link').insert({
      id_ditta: idDitta,
      id_file: insertedFile.id,
      entita_tipo: entita_tipo,
      entita_id: entita_id
    });

    // 3. Aggiorna la quota disco della ditta
    await trx('ditte')
      .where({ id: idDitta })
      .increment('current_storage_bytes', fileSize);

    // 4. Log azione
    await logAzione(
      trx,
      'DM_FILE_UPLOAD',
      req.user.id,
      idDitta,
      'dm_files',
      insertedFile.id,
      `Caricato file: ${fileName} (${formatFileSize(fileSize)}) per ${entita_tipo}:${entita_id}`
    );

    await trx.commit();
    res.status(201).json(insertedFile);

  } catch (error) {
    await trx.rollback();
    console.error("Errore finalizzazione upload:", error);
    res.status(500).json({ error: "Errore interno del server (DB Finalize)." });
  }
});


// --- API 3: LISTA ALLEGATI PER ENTITÀ ---
router.get('/list/:entita_tipo/:entita_id', verifyToken, checkPermission('DM_FILE_VIEW'), async (req, res) => {
  try {
    // --- CONTROLLO DI SICUREZZA DITTA (Fix SuperAdmin) ---
    if (!req.ditta || !req.ditta.id) {
      return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }
    const idDitta = req.ditta.id;
    // --- FINE CONTROLLO ---

    const { entita_tipo, entita_id } = req.params;

    const allegati = await knex('dm_allegati_link as link')
      .join('dm_files as file', 'link.id_file', 'file.id')
      .leftJoin('utenti as u', 'file.id_utente_upload', 'u.id') // Join con utenti per nome
      .where({
        'link.id_ditta': idDitta,
        'link.entita_tipo': entita_tipo,
        'link.entita_id': entita_id
      })
      .select(
        'link.id as id_link', // ID del collegamento
        'file.id as id_file', // ID del file fisico
        'file.file_name_originale',
        'file.file_size_bytes',
        'file.mime_type',
        'file.created_at',
        knex.raw("CONCAT(u.nome, ' ', u.cognome) as utente_upload") // Nome utente
      )
      .orderBy('file.created_at', 'desc');

    res.json(allegati);

  } catch (error) {
    console.error("Errore lista allegati:", error);
    res.status(500).json({ error: "Errore interno del server (Lista Allegati)." });
  }
});


// --- API 4: GENERARE URL PER DOWNLOAD ---
router.get('/generate-download-url/:id_file', verifyToken, checkPermission('DM_FILE_VIEW'), async (req, res) => {
  try {
    // --- CONTROLLO DI SICUREZZA DITTA (Fix SuperAdmin) ---
    if (!req.ditta || !req.ditta.id) {
      return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }
    const idDitta = req.ditta.id;
    // --- FINE CONTROLLO ---

    const { id_file } = req.params;

    // Controllo sicurezza: verifica che il file appartenga alla ditta dell'utente
    const file = await knex('dm_files')
      .where({ id: id_file, id_ditta: idDitta })
      .first();

    if (!file) {
      return res.status(404).json({ error: 'File non trovato o non appartenente a questa ditta.' });
    }

    // Crea il comando per un GET (download)
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: file.s3_key,
      // Forza il browser a scaricare vs visualizzare
      ResponseContentDisposition: `attachment; filename="${file.file_name_originale}"`
    });

    // Genera l'URL pre-firmato valido per 5 minuti
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    res.json({ downloadUrl });

  } catch (error) {
    console.error("Errore generazione URL download S3:", error);
    res.status(500).json({ error: "Errore interno del server (S3 Download URL)." });
  }
});


// --- API 5: ELIMINAZIONE LINK ALLEGATO (E FILE ORFANO) ---
router.delete('/link/:id_link', verifyToken, checkPermission('DM_FILE_DELETE'), async (req, res) => {
  
  // --- CONTROLLO DI SICUREZZA DITTA (Fix SuperAdmin) ---
  if (!req.ditta || !req.ditta.id) {
    return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
  }
  const idDitta = req.ditta.id;
  // --- FINE CONTROLLO ---

  const { id_link } = req.params;

  const trx = await knex.transaction(); // OBBLIGO TRANSAZIONE

  try {
    // 1. Trova il link e il file associato (verificando la ditta)
    const link = await trx('dm_allegati_link')
      .where({ id: id_link, id_ditta: idDitta })
      .first();

    if (!link) {
      await trx.rollback();
      return res.status(404).json({ error: 'Collegamento non trovato.' });
    }

    const file = await trx('dm_files').where({ id: link.id_file }).first();
    if (!file) {
      // Situazione strana (link esiste ma file no?), cancella comunque il link
      await trx('dm_allegati_link').where({ id: id_link }).del();
      await trx.commit();
      return res.status(404).json({ error: 'File associato non trovato, link rimosso.' });
    }

    // 2. Elimina il collegamento
    await trx('dm_allegati_link').where({ id: id_link }).del();

    // 3. Controlla se il file è orfano (non ha altri link)
    const altriLink = await trx('dm_allegati_link')
      .where({ id_file: file.id })
      .first(); // .first() è più veloce di .count(), ci serve solo sapere se esiste (1) o no (0)

    if (!altriLink) {
      // 4. Se ORFANO: Elimina da S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: file.s3_key
      });
      await s3Client.send(deleteCommand);

      // 5. Se ORFANO: Elimina da dm_files
      await trx('dm_files').where({ id: file.id }).del();

      // 6. Se ORFANO: Aggiorna (decrementa) la quota ditta
      await trx('ditte')
        .where({ id: idDitta })
        .decrement('current_storage_bytes', file.file_size_bytes);
    }
    // Se non è orfano, la transazione si limiterà a cancellare il link.

    // 7. Log azione
    await logAzione(
      trx,
      'DM_FILE_DELETE',
      req.user.id,
      idDitta,
      'dm_allegati_link',
      id_link,
      `Scollegato file: ${file.file_name_originale} (ID File: ${file.id}, ID Link: ${id_link}). ${!altriLink ? 'File orfano eliminato da S3.' : ''}`
    );
    
    await trx.commit();
    res.json({ success: true, message: 'Allegato scollegato con successo.' });

  } catch (error) {
    await trx.rollback();
    console.error("Errore eliminazione allegato:", error);
    // Se l'errore proviene da S3 (es. file non trovato lì),
    // la transazione DB viene annullata e il link *non* viene eliminato.
    // Questo è corretto, meglio avere un link "rotto" che un dato inconsistente.
    res.status(500).json({ error: "Errore interno del server (Eliminazione)." });
  }
});


// Funzione helper per formattare la dimensione (usata solo nei log e errori)
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = router;