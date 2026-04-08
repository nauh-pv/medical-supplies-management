import { usePWA } from "@/hooks/usePWA";
import styles from "./PWAPrompt.module.css";

export function PWAPrompt() {
  const { needRefresh, isInstallable, installApp, handleUpdate } = usePWA();

  if (!needRefresh && !isInstallable) return null;

  return (
    <div className={styles.container}>
      {needRefresh && (
        <div className={styles.banner}>
          <span>Có phiên bản mới! </span>
          <button onClick={handleUpdate}>Cập nhật ngay</button>
          <button onClick={() => {}}>✕</button>
        </div>
      )}
      {isInstallable && !needRefresh && (
        <div className={styles.banner}>
          <span>Cài đặt ứng dụng để dùng offline </span>
          <button onClick={installApp}>Cài đặt</button>
        </div>
      )}
    </div>
  );
}
