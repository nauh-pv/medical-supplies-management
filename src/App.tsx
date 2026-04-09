import { useState } from "react";
import { Sidebar, type NavId } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/pages/Dashboard";
import { Inventory } from "@/pages/Inventory";
import { Reports } from "@/pages/Reports";
import { POS } from "@/pages/POS";
import { Alerts } from "@/pages/Alerts";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { PWAPrompt } from "@/components/PWAPrompt";
import "./App.css";

type AuthView = "login" | "register" | "app";

const pages: Partial<Record<NavId, React.ReactNode>> = {
  dashboard: <Dashboard />,
  inventory: <Inventory />,
  reports: <Reports />,
  pos: <POS />,
  alerts: <Alerts />,
};

function App() {
  const [authView, setAuthView] = useState<AuthView>("login");
  const [activePage, setActivePage] = useState<NavId>("dashboard");

  if (authView === "login") {
    return (
      <>
        <Login
          onNavigateToRegister={() => setAuthView("register")}
          onLogin={() => setAuthView("app")}
        />
        <PWAPrompt />
      </>
    );
  }

  if (authView === "register") {
    return (
      <>
        <Register
          onNavigateToLogin={() => setAuthView("login")}
          onRegister={() => setAuthView("app")}
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
