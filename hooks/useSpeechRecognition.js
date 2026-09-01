'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition({ onResult, onError, onFinalSpeech, lang = 'en-US' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const onFinalSpeechRef = useRef(onFinalSpeech);
  const langRef = useRef(lang);
  const silenceTimerRef = useRef(null);

  // Keep refs fresh
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onFinalSpeechRef.current = onFinalSpeech;
  }, [onFinalSpeech]);

  useEffect(() => {
    langRef.current = lang;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = lang;
      } catch (e) {}
    }
  }, [lang]);

  // Clean up silence timer
  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setIsListening(false);
    isListeningRef.current = false;
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    clearSilenceTimer();

    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const msg = 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.';
      setError(msg);
      if (onErrorRef.current) onErrorRef.current(msg);
      return;
    }

    try {
      // Abort any existing instance cleanly
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = langRef.current || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setError(null);
      };

      recognition.onresult = (event) => {
        let accumulatedFinal = '';
        let accumulatedInterim = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            accumulatedFinal += text + ' ';
          } else {
            accumulatedInterim += text;
          }
        }

        const combined = (accumulatedFinal + accumulatedInterim).trim();
        setTranscript(accumulatedFinal.trim());
        setInterimTranscript(accumulatedInterim.trim());

        if (combined && onResultRef.current) {
          onResultRef.current(combined);
        }

        // Restart silence timer on each voice result
        clearSilenceTimer();
        if (combined && onFinalSpeechRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              onFinalSpeechRef.current(combined);
            }
          }, 1800); // 1.8 seconds of silence after speaking triggers auto-submit
        }
      };

      recognition.onerror = (event) => {
        console.warn('[SpeechRecognition] event error:', event.error);
        let errorMsg = null;

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMsg = '🎤 Microphone access blocked. Please click the lock/camera icon in your address bar to allow microphone.';
        } else if (event.error === 'no-speech') {
          // Keep listening during brief pauses
          return;
        } else if (event.error === 'network') {
          errorMsg = '🌐 Network error during speech recognition.';
        } else if (event.error === 'audio-capture') {
          errorMsg = '🎙️ No microphone detected. Please check your mic connection.';
        } else if (event.error !== 'aborted') {
          errorMsg = `Microphone error: ${event.error}`;
        }

        if (errorMsg) {
          setError(errorMsg);
          if (onErrorRef.current) onErrorRef.current(errorMsg);
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;

      // Start synchronously immediately inside user click gesture!
      recognition.start();
    } catch (err) {
      console.error('Instant start error:', err);
      // If already started, don't break
      if (err.name !== 'InvalidStateError') {
        setError(`Failed to start microphone: ${err.message}`);
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    clearSilenceTimer();
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
