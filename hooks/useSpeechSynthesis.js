'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Pick a high-quality default English voice if available
        if (!selectedVoice && availableVoices.length > 0) {
          const naturalOrGoogle = availableVoices.find(
            (v) =>
              (v.name.includes('Natural') ||
               v.name.includes('Google') ||
               v.name.includes('Premium') ||
               v.name.includes('Zira') ||
               v.name.includes('Samantha') ||
               v.name.includes('Jenny')) &&
              v.lang.startsWith('en')
          );
          const anyEn = availableVoices.find((v) => v.lang.startsWith('en'));
          setSelectedVoice(naturalOrGoogle || anyEn || availableVoices[0]);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  const cleanTextForSpeech = (text) => {
    if (!text) return '';
    // Strip markdown formatting like code blocks, asterisks, emojis etc. for smoother speech
    return text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~>]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .trim();
  };

  const speak = useCallback(
    (text) => {
      if (!isSupported || typeof window === 'undefined') return;

      window.speechSynthesis.cancel(); // Stop any currently speaking voice

      const cleanText = cleanTextForSpeech(text);
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, selectedVoice, rate, pitch, volume]
  );

  const stop = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    autoSpeak,
    setAutoSpeak,
    speak,
    stop,
    pause,
    resume,
  };
}
