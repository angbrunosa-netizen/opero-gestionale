// #####################################################################
// # Componente ComposeView - v2.2 (con Fix Invio Email)
// # File: opero-frontend/src/components/ComposeView.js
// #####################################################################

import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const API_URL = 'http://localhost:3001';

const extractEmail = (str) => {
    if (!str) return '';
    const match = str.match(/<([^>]+)>/);
    return match ? match[1] : str;
};

// CORREZIONE: Riceve accountId come prop
function ComposeView({ session, accountId, emailToReply, replyType, onCancel, onSent }) {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        let newTo = '';
        let newSubject = '';
        let newBody = '';

        if (emailToReply) {
            const originalMessage = `<br><br><br><p>---- Messaggio Originale ----</p><blockquote>${emailToReply.body.replace(/\n/g, '<br>')}</blockquote>`;
            
            if (replyType === 'reply') {
                newTo = extractEmail(emailToReply.from);
                newSubject = `Re: ${emailToReply.subject}`;
                newBody = `<p></p>${session.user.firma ? `<br><br>${session.user.firma}`: ''}` + originalMessage;
            } else if (replyType === 'replyAll') {
                const allRecipients = new Set();
                emailToReply.from_structured.forEach(addr => allRecipients.add(addr.address));
                emailToReply.to_structured.forEach(addr => allRecipients.add(addr.address));
                emailToReply.cc_structured.forEach(addr => allRecipients.add(addr.address));
                
                const currentUserEmail = session.user.email.toLowerCase();
                const finalRecipients = Array.from(allRecipients).filter(email => email.toLowerCase() !== currentUserEmail);

                newTo = finalRecipients.join(', ');
                newSubject = `Re: ${emailToReply.subject}`;
                newBody = `<p></p>${session.user.firma ? `<br><br>${session.user.firma}`: ''}` + originalMessage;
            } else if (replyType === 'forward') {
                newTo = '';
                newSubject = `Fwd: ${emailToReply.subject}`;
                newBody = `<p></p>${session.user.firma ? `<br><br>${session.user.firma}`: ''}<br><p>---- Messaggio Inoltrato ----</p><blockquote>${originalMessage.trim()}</blockquote>`;
            }
        } else {
            newBody = `<p></p><br><br>${session.user.firma || ''}`;
        }
        
        setTo(newTo);
        setSubject(newSubject);
        setBody(newBody);
    }, [emailToReply, replyType, session.user.email, session.user.firma]);

    const handleAttachmentChange = (e) => {
        setAttachments([...e.target.files]);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setIsSending(true);

        const formData = new FormData();
        formData.append('to', to);
        formData.append('subject', subject);
        formData.append('text', body);
        // CORREZIONE: Aggiunge l'accountId al form data
        formData.append('accountId', accountId); 
        attachments.forEach(file => {
            formData.append('attachments', file);
        });

        try {
            const response = await fetch(`${API_URL}/api/mail/send-email`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.token}` },
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                alert('Email inviata con successo!');
                onSent();
            } else {
                alert(`Errore: ${data.message}`);
            }
        } catch (error) {
            alert(`Errore di connessione: ${error.message}`);
        }
        setIsSending(false);
    };

    return (
        <div className="p-8 w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{emailToReply ? 'Rispondi' : 'Nuovo Messaggio'}</h2>
            <form onSubmit={handleSend} className="flex flex-col gap-4">
                <input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="A:" required className="p-2 border rounded-md" />
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Oggetto:" required className="p-2 border rounded-md" />
                <div className="h-64 mb-10">
                    <ReactQuill
                        theme="snow"
                        value={body}
                        onChange={setBody}
                        readOnly={isSending}
                        className="h-full"
                    />
                </div>
                
                <div>
                    <label className="font-medium">Allegati:</label>
                    <input type="file" multiple onChange={handleAttachmentChange} className="mt-2" />
                    <div className="mt-2 text-sm text-slate-500">
                        {attachments.map((file, index) => (
                            <div key={index}>{file.name}</div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 justify-end mt-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md hover:bg-slate-100">Annulla</button>
                    <button type="submit" disabled={isSending} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isSending ? 'Invio...' : 'Invia'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ComposeView;
