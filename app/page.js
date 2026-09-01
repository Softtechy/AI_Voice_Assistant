'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import ChatMessage from '../components/ChatMessage';
import VoiceWave from '../components/VoiceWave';
import SettingsModal from '../components/SettingsModal';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { Mic, MicOff, Send, Sparkles, Loader2, AlertCircle, Zap } from 'lucide-react';

const SUGGESTIONS = [
  "Explain quantum computing in simple words",
  "Tell me a fun space fact",
  "Write a 4-line motivational poem",
  "How does Speech-to-Text AI work?"
];

export default function HomePage() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "👋 Hello! I am your **AI Voice Assistant**.\n\nClick the **Microphone (🎙️)** to speak in **one click**, or type below. I will answer with text and speak it out loud!",
      timestamp: null
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [speechLang, setSpeechLang] = useState('en-US');
  const [autoSendOnSilence, setAutoSendOnSilence] = useState(true);

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const handleSendMessageRef = useRef(null);

  // Text to Speech (TTS)
  const {
    isSupported: ttsSupported,
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    autoSpeak,
    setAutoSpeak,
    speak,
    stop: stopSpeaking
  } = useSpeechSynthesis();

  // Stable callback for speech recognition transcript updates
  const handleSpeechResult = useCallback((spokenText) => {
    if (spokenText) {
      setInputText(spokenText);
    }
  }, []);

  // When user pauses for 1.8 seconds, automatically send the voice message
  const handleFinalSpeech = useCallback((spokenText) => {
    if (autoSendOnSilence && spokenText && spokenText.trim().length > 1) {
      if (handleSendMessageRef.current) {
        handleSendMessageRef.current(spokenText);
      }
    }
  }, [autoSendOnSilence]);

  // Speech Recognition (STT)
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: sttSupported,
    error: sttError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    lang: speechLang,
    onResult: handleSpeechResult,
    onFinalSpeech: handleFinalSpeech
  });

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, isListening]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    if (isListening) {
      stopListening();
    }
    stopSpeaking();
    setSpeakingMessageId(null);

    const userMessageId = `user-${Date.now()}`;
    const newMessages = [
      ...messages,
      {
        id: userMessageId,
        role: 'user',
        text: query,
        timestamp: Date.now()
      }
    ];

    setMessages(newMessages);
    setInputText('');
    resetTranscript();
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });

      const data = await res.json();
      const aiText = data.answer || "Sorry, I couldn't generate a response.";
      const aiMessageId = `ai-${Date.now()}`;

      const updatedMessages = [
        ...newMessages,
        {
          id: aiMessageId,
          role: 'assistant',
          text: aiText,
          timestamp: Date.now()
        }
      ];

      setMessages(updatedMessages);

      // Trigger automatic speech if autoSpeak is active
      if (autoSpeak && ttsSupported) {
        setSpeakingMessageId(aiMessageId);
        speak(aiText);
      }
    } catch (err) {
      const errorMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ Network error: Could not reach the AI server. (${err.message})`,
        timestamp: Date.now()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  });

  // 1-Click Mic Handler: immediately unmutes, stops old audio, and starts listening synchronously
  const handleOneClickMic = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      setInputText('');
      resetTranscript();
      startListening();
    }
  };

  const handleSpeakMessage = (messageId, text) => {
    if (isSpeaking && speakingMessageId === messageId) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(messageId);
      speak(text);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    stopSpeaking();
    setSpeakingMessageId(null);
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        text: "✨ Chat cleared! Click the mic or type to start a new conversation.",
        timestamp: Date.now()
      }
    ]);
  };

  return (
    <div className="app-wrapper">
      <div className="assistant-card">
        <Header
          autoSpeak={autoSpeak}
          setAutoSpeak={setAutoSpeak}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onClearChat={clearChat}
          isSpeaking={isSpeaking}
          onStopSpeaking={() => {
            stopSpeaking();
            setSpeakingMessageId(null);
          }}
        />

        {/* Live Voice Visualizer Bar */}
        <VoiceWave isListening={isListening} isSpeaking={isSpeaking} />

        {/* Error notification if speech recognition denied */}
        {sttError && (
          <div className="status-banner error-banner">
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            <span>{sttError}</span>
          </div>
        )}

        {/* Chat Conversation Thread */}
        <div className="chat-thread" ref={chatContainerRef}>
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onSpeak={(text) => handleSpeakMessage(msg.id, text)}
              isSpeakingThis={isSpeaking && speakingMessageId === msg.id}
            />
          ))}

          {isLoading && (
            <div className="message-row ai-row">
              <div className="message-avatar">
                <Sparkles size={18} className="spin-slow" />
              </div>
              <div className="message-bubble loading-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="loading-text">Generating voice answer...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="suggestions-container">
            <span className="suggestions-label">💡 Try asking:</span>
            <div className="suggestions-grid">
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  className="suggestion-chip"
                  onClick={() => handleSendMessage(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voice & Text Input Toolbar */}
        <div className="input-toolbar-wrapper">
          {isListening && (
            <div className="listening-indicator-bar">
              <span className="pulse-dot"></span>
              <span className="listening-text-status">
                {inputText ? `"${inputText}"` : "🎙️ Listening... Speak now"}
              </span>
              <button
                type="button"
                className="send-speech-btn"
                onClick={() => handleSendMessage()}
              >
                Send Now ⏎
              </button>
            </div>
          )}

          <div className={`input-container ${isListening ? 'listening-border' : ''}`}>
            <button
              type="button"
              onClick={handleOneClickMic}
              className={`mic-button ${isListening ? 'mic-active' : ''}`}
              title={isListening ? 'Click to stop listening' : 'One-Click Voice: Click to talk'}
            >
              {isListening ? (
                <MicOff size={22} className="pulse-icon" />
              ) : (
                <Mic size={22} />
              )}
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening to your voice...' : 'Click 🎙️ to talk in 1-click or type here...'}
              className="chat-input"
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="send-button"
              title="Send Message (Enter)"
            >
              {isLoading ? <Loader2 size={20} className="spin-fast" /> : <Send size={20} />}
            </button>
          </div>

          <div className="input-footer">
            <span>⚡ 1-Click Voice Input</span>
            <span>•</span>
            <span>🔊 Auto-Speak Answers</span>
            <span>•</span>
            <span>☁️ Vercel Ready</span>
          </div>
        </div>
      </div>

      {/* Audio & Voice Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        voices={voices}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        rate={rate}
        setRate={setRate}
        pitch={pitch}
        setPitch={setPitch}
        autoSpeak={autoSpeak}
        setAutoSpeak={setAutoSpeak}
        speechLang={speechLang}
        setSpeechLang={setSpeechLang}
      />
    </div>
  );
}
