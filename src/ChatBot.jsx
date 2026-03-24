import { useState, useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import "./ROG.css";

const ChatBot = () => {
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hello! I am your Blood Donation Assistant. How can I help you today? (e.g., 'I need A+ blood in Chennai')" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        const userMessage = { sender: "user", text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/ai/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText })
            });
            const data = await response.json();
            const botMessage = { sender: "bot", text: data.response_message };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { sender: "bot", text: "Sorry, I am having trouble connecting to the server. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Chat Messages */}
            <div style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,10,62,0.3) transparent'
            }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                        alignItems: 'flex-start', /* Align avatar with top of text */
                        marginBottom: '8px',
                        gap: '12px'
                    }}>
                        {/* BOT AVATAR */}
                        {(msg.sender === "bot" || msg.sender === "AI") && ( /* Handle both sender types */
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: '#10b981', /* Green background matching the image */
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', flexShrink: 0, marginTop: '2px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                            }}>
                                <img
                                    src="/ai_logo.png"
                                    alt="AI"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        // Hide image and fall back to plain green bubble if not found yet
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '16px',
                            background: msg.sender === "user" ? "var(--rog-red)" : "#000000",
                            color: "#fff",
                            borderTopLeftRadius: msg.sender === "bot" ? '2px' : '16px',
                            borderTopRightRadius: msg.sender === "user" ? '2px' : '16px',
                            borderBottomLeftRadius: '16px',
                            borderBottomRightRadius: '16px',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-line',
                            boxShadow: msg.sender === "user" ? '0 4px 15px rgba(255,10,62,0.4)' : '0 4px 15px rgba(0,0,0,0.6)',
                            fontSize: '1.25rem', /* Increased size */
                            fontFamily: "'Outfit', 'Inter', sans-serif", /* Stylish font */
                            letterSpacing: '0.3px',
                            border: msg.sender === "bot" ? '1px solid rgba(255,255,255,0.1)' : 'none',
                            maxWidth: '80%'
                        }}>
                            {msg.text.replace(/\*/g, '')}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{
                        alignSelf: "flex-start",
                        padding: '12px 18px',
                        borderRadius: '16px',
                        background: "rgba(255,255,255,0.05)",
                        color: "#9ca3af",
                        fontStyle: 'italic',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '1rem'
                    }}>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div style={{
                padding: '0 16px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
            }}>
                {["Find blood donors", "Check donation eligibility", "Blood donation tips"].map((chip) => (
                    <button
                        key={chip}
                        onClick={() => handleSend(chip)}
                        style={{
                            background: 'rgba(255, 10, 62, 0.12)',
                            border: '1px solid rgba(255, 10, 62, 0.35)',
                            color: '#ff8a9e',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            fontFamily: 'inherit'
                        }}
                        onMouseEnter={e => { e.target.style.background = 'var(--rog-red)'; e.target.style.color = '#fff'; }}
                        onMouseLeave={e => { e.target.style.background = 'rgba(255,10,62,0.12)'; e.target.style.color = '#ff8a9e'; }}
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div style={{
                padding: '16px 20px',
                display: 'flex',
                gap: '12px',
                marginTop: '10px'
            }}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        color: '#fff',
                        outline: 'none',
                        fontSize: '1.1rem',
                        fontFamily: 'inherit',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        resize: 'none',
                        height: '60px',
                        overflowY: 'auto'
                    }}
                />
                <button
                    onClick={() => handleSend()}
                    style={{
                        background: 'var(--rog-red)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0 24px', /* Wider button */
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(255,10,62,0.4)',
                        transition: 'all 0.2s'
                    }}
                    disabled={loading}
                >
                    <span style={{ fontSize: '1.5rem', color: 'white' }}>➢</span>
                </button>
            </div>

            <style>{`
                .typing-dot {
                    width: 5px; height: 5px; background: #9ca3af; border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both; display: inline-block;
                }
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            `}</style>
        </div >
    );
};

export default ChatBot;
