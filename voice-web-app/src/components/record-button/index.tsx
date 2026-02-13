'use client';

import styles from './record-button.module.css';

interface RecordButtonProps {
  isRecording: boolean;
  isDisabled: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function RecordButton({
  isRecording,
  isDisabled,
  onStart,
  onStop,
}: RecordButtonProps) {
  const handleMouseDown = () => {
    if (!isDisabled) onStart();
  };

  const handleMouseUp = () => {
    if (isRecording) onStop();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDisabled) onStart();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isRecording) onStop();
  };

  const buttonClasses = [
    styles.button,
    isRecording ? styles.buttonRecording : styles.buttonIdle,
    isDisabled ? styles.buttonDisabled : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      disabled={isDisabled}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={buttonClasses}
      aria-label={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
    >
      {isRecording ? (
        <svg
          className={styles.icon}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg
          className={styles.icon}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
          <path d="M19 11a7 7 0 0 1-14 0H3a9 9 0 0 0 18 0h-2z" />
        </svg>
      )}
    </button>
  );
}
