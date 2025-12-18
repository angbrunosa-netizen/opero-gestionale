/**
 * Nome File: admin_blog.js
 * Percorso: opero-gestionale/routes/admin_blog.js
 * Data: 18/12/2025
 * Descrizione: API di amministrazione per il sistema blog multi-tenant
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;

// Importazioni AWS con gestione errori
let S3Client, PutObjectCommand, DeleteObjectCommand;
try {
  const aws = require('@aws-sdk/client-s3');
  S3Client = aws.S3Client;
  PutObjectCommand = aws.PutObjectCommand;
  DeleteObjectCommand = aws.DeleteObjectCommand;
  console.log('✅ AWS SDK caricato correttamente');
} catch (error) {
  console.error('❌ Errore caricamento AWS SDK:', error.message);
  console.warn('⚠️ Upload S3 disabilitato, i file verranno salvati localmente');
}

// Importazioni database - FIX ERRORE req.dbPool undefined
const { dbPool, knex } = require('../config/db');

// Configurazione S3 (stessa configurazione di uploads.js)
let s3Client;
try {
  if (S3Client && process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    console.log('✅ S3 Client inizializzato correttamente');
  } else {
    console.warn('⚠️ S3 Client non inizializzato: AWS SDK o credenziali mancanti');
  }
} catch (error) {
  console.error('❌ Errore inizializzazione S3 Client:', error.message);
}

// Funzione fallback per salvare file localmente quando S3 non è disponibile
async function saveFileLocally(buffer, filename, subfolder = 'blog') {
  try {
    const uploadDir = path.join(__dirname, '../uploads', subfolder);

    // Crea la cartella se non esiste
    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueFilename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${filename}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    await fs.writeFile(filePath, buffer);

    // Restituisce URL relativo per accesso web
    const relativeUrl = `/uploads/${subfolder}/${uniqueFilename}`;
    console.log(`✅ File salvato localmente: ${relativeUrl}`);

    return relativeUrl;
  } catch (error) {
    console.error('❌ Errore salvataggio file locale:', error.message);
    return null;
  }
}

// Configurazione Multer per upload PDF e immagini in memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max per file
    files: 2 // Massimo 2 file (immagine + PDF)
  },
  fileFilter: (req, file, cb) => {
    // Accetta sia PDF che immagini comuni
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo file non supportato: ${file.mimetype}. Tipi supportati: PDF, JPEG, PNG, WebP, GIF`), false);
    }
  }
});

// FUNZIONI HELPER

/**
 * Genera slug univoco per categoria/post
 */
async function generateUniqueSlug(dbPool, idDitta, slug, table, column = 'slug') {
  let originalSlug = slug;
  let counter = 1;

  while (true) {
    const [existing] = await dbPool.query(
      `SELECT id FROM ${table} WHERE id_ditta = ? AND ${column} = ?`,
      [idDitta, slug]
    );

    if (existing.length === 0) {
      return slug;
    }

    slug = `${originalSlug}-${counter}`;
    counter++;
  }
}

/**
 * Upload PDF su S3 con gestione errori migliorata
 */
async function uploadPDFToS3(buffer, filename, idDitta) {
  try {
    // Verifica che S3Client sia disponibile e configurazione S3
    if (!s3Client || !process.env.AWS_S3_BUCKET || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('⚠️ Configurazione S3 incompleta o S3Client non disponibile, salto upload PDF');
      return null;
    }

    const fileExtension = path.extname(filename);
    const uniqueFilename = `blog/pdfs/${idDitta}/${Date.now()}-${crypto.randomBytes(16).toString('hex')}${fileExtension}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: uniqueFilename,
      Body: buffer,
      ContentType: 'application/pdf',
      ServerSideEncryption: 'AES256'
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const pdfUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;
    console.log('✅ PDF caricato su S3:', pdfUrl);
    return pdfUrl;

  } catch (error) {
    console.error('❌ Errore upload PDF su S3:', error.message);
    console.warn('⚠️ Tentativo salvataggio PDF come fallback locale...');

    // Fallback: salva localmente
    try {
      const localUrl = await saveFileLocally(buffer, filename, 'blog/pdfs');
      return localUrl;
    } catch (localError) {
      console.error('❌ Errore anche salvataggio locale:', localError.message);
      return null;
    }
  }
}

/**
 * Upload immagine su S3 con gestione errori migliorata
 */
async function uploadImageToS3(buffer, filename, idDitta) {
  try {
    // Verifica che S3Client sia disponibile e configurazione S3
    if (!s3Client || !process.env.AWS_S3_BUCKET || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('⚠️ Configurazione S3 incompleta o S3Client non disponibile, salto upload immagine');
      return null;
    }

    const fileExtension = path.extname(filename).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error('Estensione immagine non supportata');
    }

    const uniqueFilename = `blog/images/${idDitta}/${Date.now()}-${crypto.randomBytes(16).toString('hex')}${fileExtension}`;

    // Determina il content type corretto per l'immagine
    let contentType = 'image/jpeg';
    if (fileExtension === '.png') contentType = 'image/png';
    else if (fileExtension === '.webp') contentType = 'image/webp';
    else if (fileExtension === '.gif') contentType = 'image/gif';

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: uniqueFilename,
      Body: buffer,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
      CacheControl: 'public, max-age=31536000' // Cache di 1 anno per immagini
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;
    console.log('✅ Immagine caricata su S3:', imageUrl);
    return imageUrl;

  } catch (error) {
    console.error('❌ Errore upload immagine su S3:', error.message);
    console.warn('⚠️ Tentativo salvataggio immagine come fallback locale...');

    // Fallback: salva localmente
    try {
      const localUrl = await saveFileLocally(buffer, filename, 'blog/images');
      return localUrl;
    } catch (localError) {
      console.error('❌ Errore anche salvataggio locale:', localError.message);
      return null;
    }
  }
}

// API CATEGORIE

// GET /api/admin/blog/categories/:idDitta - Lista categorie
router.get('/categories/:idDitta', async (req, res) => {
  try {
    const { idDitta } = req.params;

    const [categories] = await dbPool.query(
      `SELECT * FROM web_blog_categories
       WHERE id_ditta = ? AND attivo = 1
       ORDER BY ordine ASC, nome ASC`,
      [idDitta]
    );

    res.json({
      success: true,
      categories: categories || []
    });
  } catch (error) {
    console.error("Errore nel caricare categorie:", error);
    res.status(500).json({
      success: false,
      error: 'Errore nel caricare le categorie'
    });
  }
});

// POST /api/admin/blog/categories - Crea/Aggiorna categoria
router.post('/categories', async (req, res) => {
  try {
    const { id_ditta, nome, colore, descrizione, ordine } = req.body;

    // Validazione
    if (!id_ditta || !nome) {
      return res.status(400).json({
        success: false,
        error: 'Nome e ID ditta sono obbligatori'
      });
    }

    // Genera slug dal nome
    let slug = nome
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Assicura slug univoco
    slug = await generateUniqueSlug(dbPool, id_ditta, slug, 'web_blog_categories');

    const [result] = await dbPool.query(
      `INSERT INTO web_blog_categories (id_ditta, nome, slug, colore, descrizione, ordine)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_ditta, nome, slug, colore || '#2563eb', descrizione, ordine || 0]
    );

    res.json({
      success: true,
      category: {
        id: result.insertId,
        id_ditta,
        nome,
        slug,
        colore: colore || '#2563eb',
        descrizione,
        ordine: ordine || 0
      }
    });
  } catch (error) {
    console.error("Errore nel creare categoria:", error);
    res.status(500).json({
      success: false,
      error: 'Errore nel creare la categoria'
    });
  }
});

// API POST

// GET /api/admin/blog/posts/:idDitta - Lista post
router.get('/posts/:idDitta', async (req, res) => {
  try {
    const { idDitta } = req.params;
    const { page = 1, limit = 10, category, published } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE p.id_ditta = ?';
    let params = [idDitta];

    if (category) {
      whereClause += ' AND p.id_category = ?';
      params.push(category);
    }

    if (published !== undefined) {
      whereClause += ' AND p.pubblicato = ?';
      params.push(published === 'true' ? 1 : 0);
    }

    const [posts] = await dbPool.query(
      `SELECT p.*, c.nome as categoria_nome, c.colore as categoria_colore
       FROM web_blog_posts p
       LEFT JOIN web_blog_categories c ON p.id_category = c.id
       ${whereClause}
       ORDER BY p.data_pubblicazione DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Conteggio totale per paginazione
    const [countResult] = await dbPool.query(
      `SELECT COUNT(*) as total FROM web_blog_posts p ${whereClause}`,
      params
    );

    res.json({
      success: true,
      posts: posts || [],
      total: countResult[0].total,
      page: parseInt(page),
      totalPages: Math.ceil(countResult[0].total / limit)
    });
  } catch (error) {
    console.error("Errore nel caricare post:", error);
    res.status(500).json({
      success: false,
      error: 'Errore nel caricare i post'
    });
  }
});

// POST /api/admin/blog/posts - Crea/Aggiorna post
router.post('/posts', upload.any(), async (req, res) => {
  // Wrapping try-catch principale per catturare qualsiasi errore
  try {
    console.log('🚀 START POST /api/admin/blog/posts');

    // Limita numero di file per evitare abusi
    if (req.files && req.files.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Troppi file caricati. Massimo 5 file consentiti.'
      });
    }

    // Debug: logga tutto ciò che viene ricevuto
    console.log('📝 DEBUG - Body ricevuto:', Object.keys(req.body));
    console.log('📁 DEBUG - Files ricevuti:', req.files ? req.files.length : 'Nessun file');
    if (req.files) {
      req.files.forEach((file, index) => {
        console.log(`   - File ${index + 1}: ${file.fieldname} (${file.originalname})`);
      });
    }

    const {
      id_ditta, id, titolo, contenuto_html, descrizione_breve,
      id_category, pubblicato, in_evidenza, data_pubblicazione,
      autore, meta_titolo, meta_descrizione
    } = req.body;

    // Validazione base
    if (!id_ditta || !titolo) {
      return res.status(400).json({
        success: false,
        error: 'Titolo e ID ditta sono obbligatori'
      });
    }

    // Gestione upload file (PDF e immagine copertina) con graceful fallback
    let pdf_url = null;
    let pdf_filename = null;
    let copertina_url = null;

    // Con upload.any(), i file sono in un array e dobbiamo filtrarli per fieldname
    if (req.files && req.files.length > 0) {
      console.log('📁 Gestione upload files...');

      // Trova il file PDF
      const pdfFile = req.files.find(file => file.fieldname === 'pdf');
      if (pdfFile) {
        console.log('📁 Gestione upload PDF...');
        pdf_url = await uploadPDFToS3(pdfFile.buffer, pdfFile.originalname, id_ditta);

        if (pdf_url) {
          pdf_filename = pdfFile.originalname;
          console.log('✅ PDF caricato correttamente:', pdf_filename);
        } else {
          console.warn('⚠️ Upload PDF fallito, salvataggio post prosegue senza PDF');
        }
      }

      // Trova il file copertina
      const copertinaFile = req.files.find(file => file.fieldname === 'copertina');
      if (copertinaFile) {
        console.log('📁 Gestione upload immagine copertina...');
        copertina_url = await uploadImageToS3(copertinaFile.buffer, copertinaFile.originalname, id_ditta);

        if (copertina_url) {
          console.log('✅ Immagine copertina caricata correttamente:', copertinaFile.originalname);
        } else {
          console.warn('⚠️ Upload immagine copertina fallito, salvataggio post prosegue senza immagine');
        }
      }
    }

    // Genera slug dal titolo
    let slug = titolo
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Assicura slug univoco
    slug = await generateUniqueSlug(dbPool, id_ditta, slug, 'web_blog_posts');

    // Insert o Update
    if (id && id !== 'null') {
      // UPDATE - Mantieni PDF esistente se non ne viene caricato uno nuovo
      const [existingPost] = await dbPool.query(
        'SELECT pdf_url, pdf_filename FROM web_blog_posts WHERE id = ? AND id_ditta = ?',
        [id, id_ditta]
      );

      if (existingPost.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Post non trovato'
        });
      }

      await dbPool.query(
        `UPDATE web_blog_posts SET
         titolo = ?, slug = ?, contenuto = ?, descrizione_breve = ?,
         id_category = ?, pubblicato = ?, in_evidenza = ?, data_pubblicazione = ?,
         autore = ?, meta_title = ?, meta_description = ?,
         pdf_url = COALESCE(?, pdf_url), pdf_filename = COALESCE(?, pdf_filename),
         copertina_url = COALESCE(?, copertina_url)
         WHERE id = ? AND id_ditta = ?`,
        [
          titolo, slug, contenuto_html, descrizione_breve,
          id_category || null, pubblicato ? 1 : 0, in_evidenza ? 1 : 0,
          data_pubblicazione || new Date(), autore, meta_titolo, meta_descrizione,
          pdf_url, pdf_filename, copertina_url, id, id_ditta
        ]
      );

      res.json({
        success: true,
        message: 'Post aggiornato con successo'
      });
    } else {
      // INSERT
      const [result] = await dbPool.query(
        `INSERT INTO web_blog_posts
         (id_ditta, id_category, titolo, slug, contenuto, descrizione_breve,
          copertina_url, pdf_url, pdf_filename, pubblicato, in_evidenza,
          data_pubblicazione, autore, meta_title, meta_description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_ditta, id_category || null, titolo, slug, contenuto_html,
          descrizione_breve, copertina_url, pdf_url, pdf_filename, pubblicato ? 1 : 0,
          in_evidenza ? 1 : 0, data_pubblicazione || new Date(), autore,
          meta_titolo, meta_descrizione
        ]
      );

      res.json({
        success: true,
        postId: result.insertId,
        message: 'Post creato con successo'
      });
    }
  } catch (error) {
    console.error("💥 ERRORE nel salvare post:", error);
    console.error("💥 Stack trace:", error.stack);
    console.error("💥 Error details:", {
      message: error.message,
      name: error.name,
      code: error.code
    });

    res.status(500).json({
      success: false,
      error: 'Errore nel salvare il post: ' + error.message
    });
  }
});

// DELETE /api/admin/blog/posts/:id - Elimina post
router.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_ditta } = req.body;

    if (!id_ditta) {
      return res.status(400).json({
        success: false,
        error: 'ID ditta obbligatorio'
      });
    }

    // Recupera info post per eliminare PDF da S3
    const [post] = await dbPool.query(
      'SELECT pdf_url FROM web_blog_posts WHERE id = ? AND id_ditta = ?',
      [id, id_ditta]
    );

    if (post.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Post non trovato'
      });
    }

    // Elimina PDF da S3 se presente
    if (post[0].pdf_url) {
      try {
        const urlParts = post[0].pdf_url.split('/');
        const key = urlParts.slice(3).join('/'); // Rimuove dominio bucket

        const deleteParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key
        };

        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3Client.send(deleteCommand);
      } catch (s3Error) {
        console.error("Errore eliminazione PDF da S3:", s3Error);
        // Continua anche se fallisce eliminazione S3
      }
    }

    // Elimina post dal database
    await dbPool.query(
      'DELETE FROM web_blog_posts WHERE id = ? AND id_ditta = ?',
      [id, id_ditta]
    );

    res.json({
      success: true,
      message: 'Post eliminato con successo'
    });
  } catch (error) {
    console.error("Errore nell'eliminare post:", error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'eliminare il post'
    });
  }
});

// TEMP: Endpoint di test senza autenticazione per debug upload
router.post('/test-upload', upload.any(), async (req, res) => {
  console.log('🧪 TEST UPLOAD SENZA AUTENTICAZIONE');

  try {
    console.log('📝 Body:', Object.keys(req.body));
    console.log('📁 Files:', req.files ? Object.keys(req.files) : 'Nessun file');

    if (req.files?.pdf?.[0]) {
      console.log('✅ PDF ricevuto:', req.files.pdf[0].originalname);
    }

    if (req.files?.copertina?.[0]) {
      console.log('✅ Immagine ricevuta:', req.files.copertina[0].originalname);
    }

    res.json({
      success: true,
      message: 'Test upload completato con successo',
      received: {
        body: Object.keys(req.body),
        files: req.files ? Object.keys(req.files) : null,
        pdfName: req.files?.pdf?.[0]?.originalname || null,
        imageName: req.files?.copertina?.[0]?.originalname || null
      }
    });

  } catch (error) {
    console.error('❌ Errore test upload:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel test upload: ' + error.message
    });
  }
});

module.exports = router;