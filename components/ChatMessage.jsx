'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Volume2, VolumeX, Copy, Check, Bot, User } from 'lucide-react';

export default function ChatMessage({ message, onSpeak, isSpeakingThis }) {
  const [copied, setCopied] = useState(false);
  const [formattedTime, setFormattedTime] = useState('');
  const isUser = message.role === 'user';

  useEffect(() => {
    if (message.timestamp) {
      try {
        const d = new Date(message.timestamp);
        setFormattedTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (e) {
        setFormattedTime('');
      }
    }
  }, [message.timestamp]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'ai-row'}`}>
      <div className="message-avatar">
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div className="message-bubble">
        <div className="message-header">
          <span className="sender-name">{isUser ? 'You' : 'AI Assistant'}</span>
          <span className="timestamp" suppressHydrationWarning>
            {formattedTime}
          </span>
        </div>

        <div className="message-content">
          {isUser ? (
            <p>{message.text}</p>
          ) : (
            <ReactMarkdown>{message.text}</ReactMarkdown>
          )}
        </div>

        {!isUser && (
          <div className="message-actions">
            <button
              onClick={() => onSpeak(message.text)}
              className={`action-btn ${isSpeakingThis ? 'speaking-active' : ''}`}
              title={isSpeakingThis ? 'Speaking...' : 'Listen to answer'}
            >
              {isSpeakingThis ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isSpeakingThis ? 'Stop' : 'Speak'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="action-btn"
              title="Copy answer"
            >
              {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
