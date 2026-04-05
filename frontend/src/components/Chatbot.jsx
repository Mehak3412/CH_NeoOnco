import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Image as ImageIcon } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hello. I am NeoOnco AI. How can I assist you with your oncology scan or general health questions today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, hasImage: false })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'system', text: "Error connecting to AI service." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'system', text: "Network error fetching AI response." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="stellar-btn" 
        style={{ position: 'fixed', bottom: '2rem', right: '2rem', borderRadius: '50%', width: '60px', height: '60px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(138, 43, 226, 0.4)', zIndex: 999 }}
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  return (
    <div className="glass-panel" style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '350px', height: '500px', display: 'flex', flexDirection: 'column', zIndex: 999, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.5)' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <MessageSquare size={20} className="text-accent" /> Medical Assistant
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', background: msg.sender === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.1)', color: msg.sender === 'user' ? '#fff' : 'var(--text)', padding: '0.75rem 1rem', borderRadius: '12px', borderBottomRightRadius: msg.sender === 'user' ? 0 : '12px', borderBottomLeftRadius: msg.sender === 'ai' ? 0 : '12px', fontSize: '0.9rem', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>
            AI is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          placeholder="Ask a medical question..." 
          style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text)' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={!input.trim() || loading} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
