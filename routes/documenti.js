/**
 * File: /routes/documenti.js
 *
 * Versione: 1.0.0
 *
 * Descrizione: Questo file di rotte definisce le API per il
 * Modulo Gestione Documentale (DMS). Gestisce la logica per:
 * - Generare URL di upload sicuri (pre-firmati) per S3
 * - Finalizzare l'upload e salvare i metadati nel DB
 * - Elencare i file collegati a un'entità
 * - Generare URL di download sicuri (pre-firmati)
 * - Eliminare i collegamenti ai file ed eliminare i file orfani
 *
 * Include controlli di permesso (tramite checkPermission) e
 * gestione delle quote di storage per ditta.
 *
 * Percorso base: /api/documenti
 */

const express = require('express');
const router = express.Router();
const knex = require('../config/db');
const { verifyToken, checkPermission,logAzione } = require('../utils/auth');
const { v4: uuidv4 } = require('uuid');

// Importa il client S3 e i comandi dal nostro helper
const {
  s3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  getSignedUrl,
  S3_BUCKET_NAME
} = require('../utils/s3Client');

// --- API 1: Genera URL per l'Upload (Passo 1 dell'Upload) ---
// Il frontend chiede "posso caricare questo file?"
router.post('/generate-upload-url', verifyToken, checkPermission('DM_FILE_UPLOAD'), async (req, res) => {
  const { fileName, fileSize, mimeType } = req.body;
  const idDitta = req.ditta.id;
  
  if (!fileName || !fileSize || !mimeType) {
    return res.status(400).json({ error: 'Dati del file mancanti (fileName, fileSize, mimeType).' });
  }
  
  try {
    // --- CONTROLLO QUOTA (PIANI) ---
    const ditta = await knex('ditte').where({ id: idDitta }).first();
    const maxSizeInBytes = (ditta.max_storage_mb || 0) * 1024 * 1024;
    const currentSizeInBytes = ditta.current_storage_bytes || 0;
    
    // Converte fileSize (che arriva come stringa) in numero
    const fileSizeNum = parseInt(fileSize, 10);
    
    if (currentSizeInBytes + fileSizeNum > maxSizeInBytes) {
      return res.status(403).json({ 
        error: `Spazio di archiviazione insufficiente. Spazio utilizzato: ${Math.round(currentSizeInBytes / (1024*1024))}MB / ${ditta.max_storage_mb}MB.` 
      });
    }
    
    // --- Generazione Chiave S3 ---
    // Crea un nome file univoco per S3 per evitare sovrascritture
    // Formato: ditta_ID/uuid_v4
    const s3Key = `ditta_${idDitta}/${uuidv4()}`;
    
    // Prepara il comando per S3
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      ContentType: mimeType,
      ContentLength: fileSizeNum
    });
    
    // Genera l'URL pre-firmato valido per 5 minuti (300 secondi)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    
    res.json({ uploadUrl, s3Key });
    
  } catch (error) {
    console.error("Errore durante la generazione dell'URL di upload S3:", error);
    res.status(500).json({ error: "Impossibile generare l'URL di upload." });
  }
});


// --- API 2: Finalizza Upload (Passo 2 dell'Upload) ---
// Il frontend dice "OK, ho caricato il file su S3. Ora salvalo nel DB."
router.post('/finalize-upload', verifyToken, checkPermission('DM_FILE_UPLOAD'), async (req, res) => {
  const { s3Key, fileName, fileSize, mimeType, entita_tipo, entita_id } = req.body;
  const idDitta = req.ditta.id;
  const idUtente = req.user.id;
  
  if (!s3Key || !fileName || !fileSize || !entita_tipo || !entita_id) {
    return res.status(400).json({ error: 'Dati di finalizzazione mancanti (s3Key, fileName, fileSize, entita_tipo, entita_id).' });
  }
  
  const fileSizeNum = parseInt(fileSize, 10);
  
  // Usiamo una transazione per garantire l'integrità dei dati
  const trx = await knex.transaction();
  try {
    
    // 1. Inserisci i metadati del file in 'dm_files'
    const [fileId] = await trx('dm_files').insert({
      id_ditta: idDitta,
      id_utente_upload: idUtente,
      file_name_originale: fileName,
      file_size_bytes: fileSizeNum,
      mime_type: mimeType,
      s3_key: s3Key
    });
    
    // 2. Collega il file all'entità (es. scrittura contabile, bene strumentale)
    await trx('dm_allegati_link').insert({
      id_ditta: idDitta,
      id_file: fileId,
      entita_tipo: entita_tipo,
      entita_id: entita_id
    });
    
    // 3. Aggiorna il contatore dello spazio utilizzato per la ditta
    await trx('ditte')
      .where({ id: idDitta })
      .increment('current_storage_bytes', fileSizeNum);
      
    // 4. Log Azione Obbligatorio
    await logAzione(
      trx,
      'DM_FILE_UPLOAD',
      idUtente,
      idDitta,
      'dm_files',
      fileId,
      `Caricato file: ${fileName} (ID: ${fileId}, Entità: ${entita_tipo}:${entita_id})`
    );
    
    // Se tutto è andato bene, conferma la transazione
    await trx.commit();
    
    res.status(201).json({ success: true, message: 'File registrato con successo.', id_file: fileId });
    
  } catch (error) {
    // In caso di errore, annulla tutte le operazioni
    await trx.rollback();
    console.error("Errore durante la finalizzazione dell'upload:", error);
    res.status(500).json({ error: "Impossibile registrare il file nel database." });
  }
});


// --- API 3: Elenco File per Entità ---
// Ritorna la lista di tutti i file collegati a un oggetto (es. bs_bene: 123)
router.get('/list/:entita_tipo/:entita_id', verifyToken, checkPermission('DM_FILE_VIEW'), async (req, res) => {
  const { entita_tipo, entita_id } = req.params;
  const idDitta = req.ditta.id;
  
  try {
    const allegati = await knex('dm_allegati_link as link')
      .join('dm_files as file', 'link.id_file', 'file.id')
      .leftJoin('utenti as u', 'file.id_utente_upload', 'u.id') // Join con utenti per nome
      .where({
        'link.id_ditta': idDitta,
        'link.entita_tipo': entita_tipo,
        'link.entita_id': entita_id
      })
      .select(
        'link.id as id_link', // ID del collegamento (per eliminazione)
        'file.id as id_file', // ID del file fisico
        'file.file_name_originale',
        'file.file_size_bytes',
        'file.mime_type',
        'file.created_at',
        knex.raw("CONCAT(u.nome, ' ', u.cognome) as utente_upload") // Nome completo utente
      )
      // Evitiamo di ordinare qui per performance,
      // ma se necessario si può aggiungere .orderBy('file.created_at', 'desc')
      
    res.json(allegati);
    
  } catch (error) {
    console.error("Errore nel recuperare l'elenco degli allegati:", error);
    res.status(500).json({ error: "Impossibile recuperare l'elenco dei file." });
  }
});


// --- API 4: Genera URL per il Download ---
// Il frontend chiede "posso scaricare questo file?"
router.get('/generate-download-url/:id_file', verifyToken, checkPermission('DM_FILE_VIEW'), async (req, res) => {
  const { id_file } = req.params;
  const idDitta = req.ditta.id;
  
  try {
    // 1. Trova il file e verifica che appartenga alla ditta (per sicurezza)
    const file = await knex('dm_files')
      .where({
        id: id_file,
        id_ditta: idDitta
      })
      .first();
      
    if (!file) {
      return res.status(404).json({ error: 'File non trovato o accesso negato.' });
    }
    
    // 2. Prepara il comando GET per S3
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: file.s3_key,
      // Forza il browser a scaricare il file col nome originale
      ResponseContentDisposition: `attachment; filename="${file.file_name_originale}"` 
    });
    
    // 3. Genera l'URL pre-firmato valido per 5 minuti (300 secondi)
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    
    res.json({ downloadUrl });
    
  } catch (error) {
    console.error("Errore durante la generazione dell'URL di download S3:", error);
    res.status(500).json({ error: "Impossibile generare l'URL di download." });
  }
});


// --- API 5: Elimina Collegamento (e File se orfano) ---
// Elimina un record 'dm_allegati_link'
router.delete('/link/:id_link', verifyToken, checkPermission('DM_FILE_DELETE'), async (req, res) => {
  const { id_link } = req.params;
  const idDitta = req.ditta.id;
  const idUtente = req.user.id;
  
  const trx = await knex.transaction();
  try {
    // 1. Trova il link e assicurati che appartenga alla ditta (Sicurezza)
    const link = await trx('dm_allegati_link')
      .where({
        id: id_link,
        id_ditta: idDitta
      })
      .first();
      
    if (!link) {
      await trx.rollback();
      return res.status(404).json({ error: 'Collegamento non trovato o accesso negato.' });
    }
    
    // 2. Recupera i dettagli del file PRIMA di cancellare il link
    const file = await trx('dm_files').where({ id: link.id_file }).first();
    if (!file) {
      // Situazione anomala (link esiste ma file no), puliamo e usciamo
      await trx('dm_allegati_link').where({ id: link.id }).del();
      await trx.commit();
      return res.status(404).json({ error: 'File associato non trovato, collegamento rimosso.' });
    }
    
    // 3. Cancella il collegamento
    await trx('dm_allegati_link').where({ id: link.id }).del();
    
    // 4. Controlla se il file è diventato "orfano" (non ha altri link)
    const altriLink = await trx('dm_allegati_link')
      .where({ id_file: file.id })
      .first();
      
    let fileEliminato = false;
      
    if (!altriLink) {
      // 4a. Il file è orfano: eliminiamolo da S3 e dal DB
      
      // Comando di eliminazione per S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: file.s3_key,
      });
      
      // Invia il comando a S3
      await s3Client.send(deleteCommand);
      
      // Elimina dal DB
      await trx('dm_files').where({ id: file.id }).del();
      
      // Aggiorna la quota della ditta
      await trx('ditte')
        .where({ id: idDitta })
        .decrement('current_storage_bytes', file.file_size_bytes);
        
      fileEliminato = true;
    }
    
    // 5. Log Azione
    await logAzione(
      trx,
      'DM_FILE_DELETE',
      idUtente,
      idDitta,
      'dm_allegati_link',
      link.id,
      `Scollegato file: ${file.file_name_originale} (ID File: ${file.id}, Entità: ${link.entita_tipo}:${link.entita_id}). File fisico eliminato: ${fileEliminato}`
    );
    
    // 6. Conferma transazione
    await trx.commit();
    
    res.json({ 
      success: true, 
      message: 'Collegamento eliminato.', 
      fileEliminato: fileEliminato 
    });
    
  } catch (error) {
    await trx.rollback();
    console.error("Errore durante l'eliminazione del link/file:", error);
    
    // Gestione errore S3 (es. file non trovato su S3)
    if (error.name === 'NoSuchKey') {
      await trx.commit(); // Confermiamo comunque l'eliminazione dal DB
      return res.json({ success: true, message: 'Collegamento eliminato. File fisico non trovato su S3.' });
    }
    
    res.status(500).json({ error: "Impossibile eliminare il collegamento." });
  }
});

module.exports = router;
