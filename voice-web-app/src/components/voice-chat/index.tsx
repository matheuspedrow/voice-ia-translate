'use client';

import { useCallback, useEffect, useState } from 'react';
import { sendVoiceMessage } from '@/services/chat.service';
import type { ConversationMessage } from '@/models/chat.types';
import { MIN_RECORDING_SIZE } from '@/constants';
import { getErrorMessage } from '@/utils';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { ConversationHistory } from '../conversation-history';
import { RecordButton } from '../record-button';
import styles from './voice-chat.module.css';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function VoiceChat() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const {
    isRecording,
    state: recordState,
    startRecording,
    stopRecording,
    error: recorderError,
    clearError: clearRecorderError,
  } = useAudioRecorder();

  const { speak, stop, state: ttsState } = useTextToSpeech();

  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
      return;
    }
    setRecordingSeconds(0);
    const interval = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleRecordStart = useCallback(() => {
    setError(null);
    startRecording();
  }, [startRecording]);

  const handleRecordStop = useCallback(async () => {
    const blob = await stopRecording();
    if (!blob || blob.size < MIN_RECORDING_SIZE) {
      setError('Gravação muito curta. Tente novamente.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    clearRecorderError();

    try {
      const response = await sendVoiceMessage(blob, messages);

      if (response.error) {
        setError(response.error);
      } else {
        const newMessages: ConversationMessage[] = [
          ...messages,
          { role: 'user', content: response.userTranscript },
          { role: 'assistant', content: response.assistantResponse },
        ];
        setMessages(newMessages);
        speak(response.assistantResponse);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao processar áudio'));
    } finally {
      setIsProcessing(false);
    }
  }, [messages, stopRecording, speak, clearRecorderError]);

  const isDisabled = isProcessing || recordState === 'recording';

  const displayError = error ?? recorderError;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Voice Chat</h2>
        <p className={styles.subtitle}>Segure para gravar · Solte para enviar</p>
      </div>

      <ConversationHistory messages={messages} isLoading={isProcessing} />

      {displayError && (
        <div className={styles.error}>{displayError}</div>
      )}

      <div className={styles.footer}>
        <div className={styles.recordRow}>
          <RecordButton
            isRecording={isRecording}
            isDisabled={isDisabled}
            onStart={handleRecordStart}
            onStop={handleRecordStop}
          />
          {isRecording && (
            <span className={styles.recordingTimer} aria-live="polite">
              {formatDuration(recordingSeconds)}
            </span>
          )}
          {isProcessing && (
            <span className={styles.processingLabel}>Processando...</span>
          )}
        </div>
        {(ttsState === 'speaking' || ttsState === 'paused') && (
          <button
            type="button"
            onClick={stop}
            className={styles.stopButton}
          >
            Parar áudio
          </button>
        )}
      </div>
    </div>
  );
}
