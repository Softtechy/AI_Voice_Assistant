'use client';

import { X, Sliders, Volume2 } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  voices,
  selectedVoice,
  setSelectedVoice,
  rate,
  setRate,
  pitch,
  setPitch,
  autoSpeak,
  setAutoSpeak,
  speechLang,
  setSpeechLang,
}) {
  if (!isOpen) return null;

  const supportedLanguages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'en-IN', name: 'English (India)' },
    { code: 'hi-IN', name: 'Hindi (India)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'ja-JP', name: 'Japanese' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Sliders size={20} />
            <h2>Voice & Assistant Settings</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="setting-group">
            <label className="setting-label">
              <span>Auto-Speak AI Responses</span>
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="toggle-checkbox"
              />
            </label>
            <p className="setting-desc">
              Automatically reads AI answers out loud when received.
            </p>
          </div>

          <div className="setting-group">
            <label className="setting-label">Speech Recognition Language</label>
            <select
              value={speechLang}
              onChange={(e) => setSpeechLang(e.target.value)}
              className="select-input"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </div>

          <div className="setting-group">
            <label className="setting-label">Voice Model (Text-to-Speech)</label>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = voices.find((v) => v.name === e.target.value);
                if (voice) setSelectedVoice(voice);
              }}
              className="select-input"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="setting-group">
            <div className="range-header">
              <span>Speech Speed (Rate): {rate}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.6"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="range-slider"
            />
          </div>

          <div className="setting-group">
            <div className="range-header">
              <span>Speech Pitch: {pitch}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="range-slider"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
