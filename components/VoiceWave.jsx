'use client';

export default function VoiceWave({ isListening, isSpeaking }) {
  if (!isListening && !isSpeaking) return null;

  return (
    <div className={`voice-wave-container ${isListening ? 'listening-mode' : 'speaking-mode'}`}>
      <span className="wave-badge">
        {isListening ? '🎙️ Listening to you...' : '🔊 AI is speaking...'}
      </span>
      <div className="wave-bars">
        <span className="bar bar-1"></span>
        <span className="bar bar-2"></span>
        <span className="bar bar-3"></span>
        <span className="bar bar-4"></span>
        <span className="bar bar-5"></span>
        <span className="bar bar-6"></span>
        <span className="bar bar-7"></span>
        <span className="bar bar-8"></span>
      </div>
    </div>
  );
}
