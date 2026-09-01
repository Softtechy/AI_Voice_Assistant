'use client';

import { Sparkles, Volume2, VolumeX, Settings, Trash2 } from 'lucide-react';

export default function Header({
  autoSpeak,
  setAutoSpeak,
  onOpenSettings,
  onClearChat,
  isSpeaking,
  onStopSpeaking,
}) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon">
          <Sparkles size={22} className="sparkle-glow" />
        </div>
        <div>
          <h1 className="brand-title">AI Voice Assistant</h1>
          <span className="brand-subtitle">Speech Recognition & Text-to-Speech</span>
        </div>
      </div>

      <div className="header-actions">
        {isSpeaking && (
          <button
            onClick={onStopSpeaking}
            className="header-btn speaking-pulse"
            title="Stop Speaking"
          >
            <VolumeX size={18} />
            <span className="btn-text">Stop Audio</span>
          </button>
        )}

        <button
          onClick={() => setAutoSpeak(!autoSpeak)}
          className={`header-btn ${autoSpeak ? 'active-toggle' : ''}`}
          title={autoSpeak ? 'Auto-Voice: Enabled' : 'Auto-Voice: Muted'}
        >
          {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span className="btn-text">{autoSpeak ? 'Voice On' : 'Voice Off'}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="header-btn"
          title="Voice & Audio Settings"
        >
          <Settings size={18} />
        </button>

        <button
          onClick={onClearChat}
          className="header-btn"
          title="Clear Conversation"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </header>
  );
}
