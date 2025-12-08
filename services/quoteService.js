// backend/services/quoteService.js
const axios = require('axios');

/**
 * Genera un pensiero motivatore utilizzando l'API di Zhipu AI.
 * @returns {Promise<object>} Un oggetto contenente text, author, e source.
 */
const generateQuote = async () => {
    console.log("[QUOTE-SERVICE] Inizio generazione frase...");
    const randomSeed = Math.random().toString(36).substring(7);
    
    const promptText = `Genera un pensiero motivazionale e positivo per affrontare la giornata lavorativa. 
Il pensiero deve essere breve, potente e memorabile.
Ispirati agli stili dei grandi filosofi (sia greci che latini, come Seneca, Marco Aurelio, Epitteto), 
alla saggezza orientale (come Buddha, Confucio, Lao Tzu), 
a testi della religione cristiana  (san Francesco,San Tommaso ) o a grandi leader storici(craxi,Berlusconi).

ID UNICO PER LA RICHIESTA: ${randomSeed}

IMPORTANTE: Rispondi SOLO ed ESCLUSIVAMENTE con un oggetto JSON in questo formato:
{
  "text": "Il testo del pensiero qui.",
  "author": "Nome dell'autore o della fonte (es. 'Pensiero Stoico', 'Saggezza Buddista').",
  "source": "Categoria della fonte (es. 'Filosofia Latina', 'Saggezza Orientale')."
}
Non aggiungere testo prima o dopo l'oggetto JSON.`;

    const payload = {
        // --- CORREZIONE FINALE: Usiamo il nome del modello corretto ---
        model: "GLM-4-32B-0414-128K", 
        messages: [{ role: "user", content: promptText }],
        temperature: 0.8,
    };

    try {
        console.log("[QUOTE-SERVICE] Chiamata API in corso...");
        const response = await axios.post(
            'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            JSON.stringify(payload), 
            {
                headers: {
                    'Authorization': `Bearer ${process.env.ZHIPU_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0].message.content;
        console.log("[QUOTE-SERVICE] Contenuto della risposta (raw):", content);
        
        const quoteData = JSON.parse(content);
        console.log("[QUOTE-SERVICE] JSON parsato con successo:", quoteData);
        
        return quoteData;

    } catch (error) {
        console.error("[QUOTE-SERVICE] Errore durante la generazione:", error.response ? error.response.data : error.message);
        // In caso di errore, restituiamo una frase di default
        return {
            text: "Il successo non è finale, il fallimento non è fatale: è il coraggio di continuare che conta.",
            author: "Winston Churchill",
            source: "Grandi Condottieri"
        };
    }
};

module.exports = {
    generateQuote,
};