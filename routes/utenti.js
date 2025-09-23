// NUOVA ROTTA: GET /utenti/interni - Fornisce l'elenco degli utenti interni per i menu di assegnazione
router.get('/utenti/interni', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const [utenti] = await dbPool.query(
            "SELECT id, nome, cognome FROM utenti WHERE id_ditta = ? AND Codice_Tipo_Utente = 'INTERNO' ORDER BY cognome, nome",
            [id_ditta]
        );
        res.json(utenti);
    } catch (error) {
        console.error("Errore nel recupero degli utenti interni:", error);
        res.status(500).json({ message: 'Errore nel recupero degli utenti' });
    }
});

