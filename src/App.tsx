import { useState, useEffect } from "react";
import { Sidebar, type NavId } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/pages/Dashboard";
import { Inventory } from "@/pages/Inventory";
import { Reports } from "@/pages/Reports";
import { POS } from "@/pages/POS";
import { Alerts } from "@/pages/Alerts";
import { Imports } from "@/pages/Imports";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dispatches } from "@/pages/Dispatches";
import { Branches } from "@/pages/Branches";
import { PWAPrompt } from "@/components/PWAPrompt";
import { onAuthChanged, type User } from "@/services/auth";
import "./App.css";

type AuthView = "login" | "register";

const pages: Partial<Record<NavId, React.ReactNode>> = {
  dashboard: <Dashboard />,
  inventory: <Inventory />,
  reports: <Reports />,
  pos: <POS />,
  alerts: <Alerts />,
  imports: <Imports />,
  medication: <Dispatches />,
  branches: <Branches />,
};

function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [activePage, setActivePage] = useState<NavId>("dashboard");

  useEffect(() => {
    const unsubscribe = onAuthChanged((u) => setUser(u));
    return unsubscribe;
  }, []);

  // Still resolving auth state
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined text-primary animate-spin text-4xl">
          progress_activity
        </span>
      </div>
    );
  }

  if (!user) {
    if (authView === "register") {
      return (
        <>
          <Register
            onNavigateToLogin={() => setAuthView("login")}
            onRegister={() => setAuthView("login")}
          />
          <PWAPrompt />
        </>
      );
    }
    return (
      <>
        <Login
          onNavigateToRegister={() => setAuthView("register")}
          onLogin={() => {}}
        />
        <PWAPrompt />
      </>
    );
  }

  return (
    <div className="bg-background text-on-surface overflow-x-hidden">
      <Sidebar active={activePage} onNavigate={setActivePage} />
      <TopBar />
      {pages[activePage] ?? (
        <main className="ml-72 pt-24 px-8 py-12 min-h-screen bg-background">
          <p className="text-on-surface-variant">Trang đang phát triển.</p>
        </main>
      )}
      <PWAPrompt />

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-primary text-white w-14 h-14 rounded-[9999px] shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
          <span className="material-symbols-outlined">add_business</span>
        </button>
      </div>
    </div>
  );
}

export default App;
