import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("[PWA] Service Worker registered:", r);
    },
    onRegisterError(error) {
      console.error("[PWA] Service Worker registration failed:", error);
    },
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    const promptEvent = installPrompt as BeforeInstallPromptEvent;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
      setIsInstallable(false);
    }
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
    setNeedRefresh(false);
  };

  return { needRefresh, isInstallable, installApp, handleUpdate };
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
