'use client';

import { useCallback, useState } from 'react';
import type { ConversationMessage } from '@/models/chat.types';
import { copyToClipboard } from '@/utils';
import styles from './conversation-history.module.css';

interface ConversationHistoryProps {
  messages: ConversationMessage[];
  isLoading?: boolean;
}

const COPIED_RESET_MS = 2000;

export function ConversationHistory({
  messages,
  isLoading,
}: ConversationHistoryProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = useCallback(async (content: string, index: number) => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), COPIED_RESET_MS);
    }
  }, []);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Grave um áudio para começar a conversa</p>
        <p className={styles.emptyHint}>Segure o botão para gravar, solte para enviar</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`${styles.bubbleWrapper} ${msg.role === 'user' ? styles.bubbleWrapperUser : styles.bubbleWrapperAssistant}`}
        >
          <div
            className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}
          >
            <div className={styles.bubbleHeader}>
              <span className={styles.bubbleLabel}>
                {msg.role === 'user' ? 'Você' : 'Assistente'}
              </span>
              {msg.role === 'assistant' && (
                <button
                  type="button"
                  onClick={() => handleCopy(msg.content, index)}
                  className={styles.copyButton}
                  title={copiedIndex === index ? 'Copiado!' : 'Copiar resposta'}
                  aria-label={copiedIndex === index ? 'Copiado!' : 'Copiar resposta'}
                >
                  {copiedIndex === index ? (
                    <svg className={styles.copyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className={styles.copyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            <p className={styles.bubbleContent}>{msg.content}</p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingBubble}>
            <div className={styles.loadingContent}>
              <span className={styles.bubbleLabel}>Assistente</span>
              <div className={styles.loadingDots}>
                <span className={styles.loadingDot} />
                <span className={styles.loadingDot} />
                <span className={styles.loadingDot} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
