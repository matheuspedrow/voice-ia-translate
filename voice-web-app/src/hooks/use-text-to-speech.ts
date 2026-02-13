'use client';

import { useCallback, useRef, useState } from 'react';

type TtsState = 'idle' | 'speaking' | 'paused';

interface UseTextToSpeechReturn {
  state: TtsState;
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [state, setState] = useState<TtsState>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API não suportada no navegador');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setState('speaking');
    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('idle');

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setState('idle');
    utteranceRef.current = null;
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    setState('paused');
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
    setState('speaking');
  }, []);

  return {
    state,
    speak,
    stop,
    pause,
    resume,
  };
}
