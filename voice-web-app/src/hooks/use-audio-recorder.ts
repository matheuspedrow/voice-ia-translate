'use client';

import { useCallback, useRef, useState } from 'react';
import { getErrorMessage } from '@/utils';

type RecordingState = 'idle' | 'recording' | 'processing';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  state: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  error: string | null;
  clearError: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setState('recording');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao acessar microfone'));
      setState('idle');
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || state !== 'recording') {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        const blob =
          chunksRef.current.length > 0
            ? new Blob(chunksRef.current, { type: 'audio/webm' })
            : null;
        setState('idle');
        mediaRecorderRef.current = null;
        resolve(blob);
      };

      mediaRecorder.stop();
    });
  }, [state]);

  const clearError = useCallback(() => setError(null), []);

  return {
    isRecording: state === 'recording',
    state,
    startRecording,
    stopRecording,
    error,
    clearError,
  };
}
