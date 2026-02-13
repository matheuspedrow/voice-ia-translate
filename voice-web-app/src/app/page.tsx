import { VoiceChat } from '@/components';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.wrapper}>
        <VoiceChat />
      </div>
    </main>
  );
}
