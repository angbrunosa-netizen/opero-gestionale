// #####################################################################
// # Componente ComposeView - v2.3 (Refactoring con Servizio API)
// # File: opero-frontend/src/components/ComposeView.js
// #####################################################################

import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { api } from '../services/api';

const extractEmail = (str) => {
    if (!str) return '';
    const match = str.match(/<([^>]+)>/);
    return match ? match[1] : str;
};

function ComposeView({ accountId, emailToReply, replyType, onCancel, onSent }) {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (emailToReply) {
            const originalMessage = `<br><br><br><p>---- Messaggio Originale ----</p><blockquote>${emailToReply.body.replace(/\\n/g, '<br>')}</blockquote>`;
            
            if (replyType === 'reply') {
                setTo(extractEmail(emailToReply.from) || '');
                setSubject(`Re: ${emailToReply.subject}`);
                setBody(originalMessage);
            } else if (replyType === 'replyAll') {
                const allRecipients = [
                    extractEmail(emailToReply.from),
                    ...(emailToReply.to ? emailToReply.to.split(',').map(extractEmail) : [])
                ].filter(Boolean).join(', ');
                setTo(allRecipients);
                setSubject(`Re: ${emailToReply.subject}`);
                setBody(originalMessage);
            } else if (replyType === 'forward') {
                setSubject(`Fw: ${emailToReply.subject}`);
                setBody(originalMessage);
            }
        }
    }, [emailToReply, replyType]);

    const handleAttachmentChange = (e) => {
        setAttachments([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);

        const formData = new FormData();
        formData.append('accountId', accountId);
        formData.append('to', to);
        formData.append('subject', subject);
        formData.append('body', body);
        attachments.forEach(file => {
            formData.append('attachments', file);
        });

        try {
            const { data } = await api.post('/api/mail/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.success) {
                alert('Email inviata con successo!');
                if (onSent) onSent();
            } else {
                alert(`Errore nell'invio: ${data.message}`);
            }
        } catch (error) {
            console.error('Errore durante l\'invio dell\'email:', error);
            alert(error.response?.data?.message || 'Errore di connessione durante l\'invio.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl border w-full h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Componi Messaggio</h2>
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow space-y-4">
                <input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="A:" required className="p-2 border rounded-md" />
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Oggetto:" required className="p-2 border rounded-md" />
                
                <div className="flex-grow h-64 mb-10">
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