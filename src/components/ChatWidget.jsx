
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    // We can use useChat hook from Vercel AI SDK which handles stream parsing automatically if backend is compatible.
    // However, since we wrote a custom stream response, let's write a simple fetch handler to be safe or use useChat if standard.
    // Let's try manual handling to match our simple backend first for robustness without complex SDK matching.

    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Hola! Soy tu asistente experto en arándanos. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage] })
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
                                <div className="bubble">
                                    {msg.content}
                                </div>
                                {msg.role === 'user' && <div className="avatar user"><User size={14} /></div>}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message assistant">
                                <div className="avatar bot"><Bot size={14} /></div>
                                <div className="bubble typing">...</div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="chat-input-area">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Pregunta sobre variedades, precios..."
                        />
                        <button type="submit" disabled={isLoading || !input.trim()}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            <style>{`
                .chat-widget-container {
                    position: fixed; bottom: 2rem; right: 2rem; z-index: 1000;
                    font-family: 'Inter', sans-serif;
                }
                .chat-toggle {
                    background: none; border: none; cursor: pointer; padding: 0;
                    transition: transform 0.2s;
                }
                .chat-toggle:hover { transform: scale(1.1); }
                .chat-icon-bg {
                    background: var(--primary); width: 60px; height: 60px;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
                }
                
                .chat-window {
                    width: 350px; height: 500px;
                    background: white; border-radius: 1rem;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
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
                    width: 24px; height: 24px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .avatar.bot { background: var(--primary); color: white; }
                .avatar.user { background: var(--secondary); color: #1e293b; }

                .bubble {
                    padding: 0.75rem; border-radius: 1rem; font-size: 0.9rem; line-height: 1.4;
                    max-width: 80%; word-wrap: break-word;
                }
                .message.assistant .bubble {
                    background: white; border: 1px solid var(--border);
                    border-bottom-left-radius: 4px;
                }
                .message.user .bubble {
                    background: var(--primary); color: white;
                    border-bottom-right-radius: 4px;
                }
                .bubble.typing { color: #94a3b8; letter-spacing: 2px; }

                .chat-input-area {
                    padding: 0.75rem; border-top: 1px solid var(--border); background: white;
                    display: flex; gap: 0.5rem;
                }
                .chat-input-area input {
                    flex: 1; padding: 0.6rem; border: 1px solid var(--border); border-radius: 0.5rem;
                    outline: none; font-size: 0.9rem;
                }
                .chat-input-area input:focus { border-color: var(--primary); }
                .chat-input-area button {
                    background: var(--primary); color: white; border: none;
                    width: 36px; height: 36px; border-radius: 0.5rem;
                    cursor: pointer; display: flex; align-items: center; justify-content: center;
                }
                .chat-input-area button:disabled { background: #cbd5e1; cursor: not-allowed; }

                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default ChatWidget;
