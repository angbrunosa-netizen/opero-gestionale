/**
 * Nome File: admin_blog.js
 * Percorso: opero-gestionale/routes/admin_blog.js
 * Data: 18/12/2025
 * Descrizione: API di amministrazione per il sistema blog multi-tenant
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');

// Configurazione S3 (stessa configurazione di uploads.js)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configurazione Multer per upload PDF in memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max per PDF
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Sono ammessi solo file PDF'), false);
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
 * Upload PDF su S3
 */
async function uploadPDFToS3(buffer, filename, idDitta) {
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

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;
}

// API CATEGORIE

// GET /api/admin/blog/categories/:idDitta - Lista categorie
router.get('/categories/:idDitta', async (req, res) => {
  try {
    const { idDitta } = req.params;

    const [categories] = await req.dbPool.query(
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
    slug = await generateUniqueSlug(req.dbPool, id_ditta, slug, 'web_blog_categories');

    const [result] = await req.dbPool.query(
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

    const [posts] = await req.dbPool.query(
      `SELECT p.*, c.nome as categoria_nome, c.colore as categoria_colore
       FROM web_blog_posts p
       LEFT JOIN web_blog_categories c ON p.id_category = c.id
       ${whereClause}
       ORDER BY p.data_pubblicazione DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Conteggio totale per paginazione
    const [countResult] = await req.dbPool.query(
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
router.post('/posts', upload.single('pdf'), async (req, res) => {
  try {
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

    // Gestione PDF upload
    let pdf_url = null;
    let pdf_filename = null;

    if (req.file) {
      try {
        pdf_url = await uploadPDFToS3(req.file.buffer, req.file.originalname, id_ditta);
        pdf_filename = req.file.originalname;
      } catch (uploadError) {
        console.error("Errore upload PDF:", uploadError);
        return res.status(500).json({
          success: false,
          error: 'Errore nel caricare il file PDF'
        });
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
    slug = await generateUniqueSlug(req.dbPool, id_ditta, slug, 'web_blog_posts');

    // Insert o Update
    if (id && id !== 'null') {
      // UPDATE - Mantieni PDF esistente se non ne viene caricato uno nuovo
      const [existingPost] = await req.dbPool.query(
        'SELECT pdf_url, pdf_filename FROM web_blog_posts WHERE id = ? AND id_ditta = ?',
        [id, id_ditta]
      );

      if (existingPost.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Post non trovato'
        });
      }

      await req.dbPool.query(
        `UPDATE web_blog_posts SET
         titolo = ?, slug = ?, contenuto_html = ?, descrizione_breve = ?,
         id_category = ?, pubblicato = ?, in_evidenza = ?, data_pubblicazione = ?,
         autore = ?, meta_titolo = ?, meta_descrizione = ?,
         pdf_url = COALESCE(?, pdf_url), pdf_filename = COALESCE(?, pdf_filename)
         WHERE id = ? AND id_ditta = ?`,
        [
          titolo, slug, contenuto_html, descrizione_breve,
          id_category || null, pubblicato ? 1 : 0, in_evidenza ? 1 : 0,
          data_pubblicazione || new Date(), autore, meta_titolo, meta_descrizione,
          pdf_url, pdf_filename, id, id_ditta
        ]
      );

      res.json({
        success: true,
        message: 'Post aggiornato con successo'
      });
    } else {
      // INSERT
      const [result] = await req.dbPool.query(
        `INSERT INTO web_blog_posts
         (id_ditta, id_category, titolo, slug, contenuto_html, descrizione_breve,
          copertina_url, pdf_url, pdf_filename, pubblicato, in_evidenza,
          data_pubblicazione, autore, meta_titolo, meta_descrizione)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_ditta, id_category || null, titolo, slug, contenuto_html,
          descrizione_breve, null, pdf_url, pdf_filename, pubblicato ? 1 : 0,
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
    console.error("Errore nel salvare post:", error);
    res.status(500).json({
      success: false,
      error: 'Errore nel salvare il post'
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
    const [post] = await req.dbPool.query(
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
    await req.dbPool.query(
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

module.exports = router;