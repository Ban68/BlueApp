import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Paperclip, Image as ImageIcon, Trash2 } from 'lucide-react';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Hola! Soy tu experto en arándanos. Pregúntame sobre inversiones o sube una foto de tu cultivo.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            alert("La imagen es muy grande (Máx 4MB). Por favor intenta con una más pequeña.");
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert("Solo se permiten imágenes.");
            return;
        }

        setSelectedImage(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove data url prefix (e.g. "data:image/jpeg;base64,")
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!input.trim() && !selectedImage) || isLoading) return;

        const userMessage = {
            role: 'user',
            content: input,
            image: imagePreview // Store preview for UI display 
        };

        setMessages(prev => [...prev, userMessage]);

        const currentInput = input;
        const currentImage = selectedImage;
        const currentMimeType = selectedImage?.type;

        setInput('');
        clearImage();
        setIsLoading(true);

        try {
            let body = { messages: [...messages, userMessage] };

            if (currentImage) {
                const base64Image = await convertToBase64(currentImage);
                body.image = base64Image;
                body.mimeType = currentMimeType;
                // Add explicit text if empty so connection doesn't fail
                body.messages[body.messages.length - 1].content = currentInput || "[Análisis de imagen solicitado]";
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Error ${response.status}: ${response.statusText}`);
            }

            // Handle Stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = { role: 'assistant', content: '' };

            setMessages(prev => [...prev, assistantMessage]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value, { stream: true });
                assistantMessage.content += text;

                // Update last message with new content
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { ...assistantMessage };
                    return newMsgs;
                });
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}. Por favor verifica la configuración.` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-widget-container">
            {/* Toggle Button */}
            <button
                className={`chat-toggle ${isOpen ? 'hidden' : ''}`}
                onClick={() => setIsOpen(true)}
            >
                <div className="chat-icon-bg">
                    <Bot size={28} color="white" />
                </div>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window animate-fade-in-up">
                    <div className="chat-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Bot size={20} />
                            <span style={{ fontWeight: 600 }}>BlueInvest AI</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="close-btn">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.role}`}>
                                {msg.role === 'assistant' && <div className="avatar bot"><Bot size={14} /></div>}
                                <div className="bubble-container" style={{ maxWidth: '80%' }}>
                                    {msg.image && (
                                        <img src={msg.image} alt="Upload" className="message-image" />
                                    )}
                                    {msg.content && <div className={`bubble ${msg.role === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                                        {msg.content}
                                    </div>}
                                </div>
                                {msg.role === 'user' && <div className="avatar user"><User size={14} /></div>}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message assistant">
                                <div className="avatar bot"><Bot size={14} /></div>
                                <div className="bubble bot-bubble typing">Analizando...</div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Image Preview Area */}
                    {imagePreview && (
                        <div className="image-preview-area">
                            <div className="preview-container">
                                <img src={imagePreview} alt="Preview" />
                                <button onClick={clearImage} className="remove-image-btn">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="chat-input-area">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <button
                            type="button"
                            className="attach-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Subir foto"
                        >
                            <Paperclip size={20} />
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={selectedImage ? "Describe la foto..." : "Pregunta sobre variedades..."}
                            className="text-input"
                        />
                        <button type="submit" disabled={isLoading || (!input.trim() && !selectedImage)} className="send-btn">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            <style>{`
                .chat-widget-container {
                    position: fixed; bottom: 2rem; right: 2rem; z-index: 1000;
                    font-family: 'Inter', sans-serif;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .chat-toggle {
                    background: none; border: none; cursor: pointer; padding: 0;
                    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .chat-toggle:hover { transform: scale(1.1); }
                .chat-icon-bg {
                    background: var(--primary); width: 60px; height: 60px;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
                }
                
                .chat-window {
                    width: 380px; height: 600px;
                    background: white; border-radius: 1rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    display: flex; flex-direction: column;
                    overflow: hidden; border: 1px solid var(--border);
                }
                
                .chat-header {
                    background: var(--primary); color: white;
                    padding: 1rem; display: flex; justify-content: space-between; align-items: center;
                }
                .close-btn { background: none; border: none; color: white; cursor: pointer; opacity: 0.8; }
                .close-btn:hover { opacity: 1; }

                .chat-messages {
                    flex: 1; padding: 1rem; overflow-y: auto; background: #f8fafc;
                    display: flex; flex-direction: column; gap: 1rem;
                }

                .message { display: flex; gap: 0.5rem; align-items: flex-end; }
                .message.user { justify-content: flex-end; }
                
                .avatar {
                    width: 28px; height: 28px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                    font-size: 12px;
                }
                .avatar.bot { background: var(--primary); color: white; }
                .avatar.user { background: var(--secondary); color: #1e293b; }

                .bubble-container { display: flex; flex-direction: column; gap: 0.25rem; }
                .message.user .bubble-container { align-items: flex-end; }

                .bubble {
                    padding: 0.75rem 1rem; border-radius: 1rem; font-size: 0.95rem; line-height: 1.5;
                    word-wrap: break-word; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }
                .bot-bubble {
                    background: white; border: 1px solid #e2e8f0; color: #1e293b;
                    border-bottom-left-radius: 4px;
                }
                .user-bubble {
                    background: var(--primary); color: white;
                    border-bottom-right-radius: 4px;
                }
                .bubble.typing { color: #64748b; letter-spacing: 2px; font-size: 0.8rem; background: transparent; border: none; box-shadow: none; padding-left: 0;}
                
                .message-image {
                    max-width: 100%; border-radius: 0.75rem; border: 1px solid #e2e8f0;
                    margin-bottom: 0.25rem; display: block;
                }

                .image-preview-area {
                    padding: 0.75rem 1rem; background: #f8fafc; border-top: 1px solid #e2e8f0;
                }
                .preview-container {
                    position: relative; display: inline-block;
                }
                .preview-container img {
                    height: 80px; border-radius: 0.75rem; border: 1px solid #cbd5e1; object-fit: cover;
                }
                .remove-image-btn {
                    position: absolute; top: -8px; right: -8px;
                    background: #ef4444; color: white; border-radius: 50%;
                    width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
                    border: 2px solid white; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .chat-input-area {
                    padding: 1rem; border-top: 1px solid #e2e8f0; background: white;
                    display: flex; gap: 0.75rem; align-items: center;
                }
                .text-input {
                    flex: 1; padding: 0.75rem 1rem; border: 1px solid #cbd5e1; border-radius: 9999px;
                    outline: none; font-size: 0.95rem; transition: border-color 0.2s;
                }
                .text-input:focus { border-color: var(--primary); ring: 2px solid var(--primary-light); }
                
                .attach-btn {
                    background: #f1f5f9; border: none; color: #64748b; cursor: pointer;
                    padding: 0.6rem; border-radius: 50%; transition: all 0.2s;
                    display: flex; align-items: center; justify-content: center;
                }
                .attach-btn:hover { background: #e2e8f0; color: var(--primary); }
                
                .send-btn {
                    background: var(--primary); color: white; border: none;
                    width: 42px; height: 42px; border-radius: 50%;
                    cursor: pointer; display: flex; align-items: center; justify-content: center;
                    transition: transform 0.1s, background 0.2s;
                    box-shadow: 0 2px 5px rgba(37, 99, 235, 0.3);
                }
                .send-btn:hover { background: var(--primary-dark); transform: translateY(-1px); }
                .send-btn:active { transform: translateY(1px); }
                .send-btn:disabled { background: #cbd5e1; cursor: not-allowed; box-shadow: none; transform: none; }

                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); scale: 0.95; }
                    to { opacity: 1; transform: translateY(0); scale: 1; }
                }
                .animate-fade-in-up { animation: fade-in-up 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
};

export default ChatWidget;
