import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/pages/Dashboard";
import { Inventory } from "@/pages/Inventory";
import { Reports } from "@/pages/Reports";
import { SalesTransactions } from "@/pages/SalesTransactions";
import { POS } from "@/pages/POS";
import { Alerts } from "@/pages/Alerts";
import { Imports } from "@/pages/Imports";
import { Login } from "@/pages/Login";
import { Dispatches } from "@/pages/Dispatches";
import { Branches } from "@/pages/Branches";
import { PWAPrompt } from "@/components/PWAPrompt";
import { onAuthChanged, signOut, type User } from "@/services/auth";
import { getUserProfile } from "@/services/user";
import type { UserDoc } from "@/types/firestore";
import { UserContext } from "@/contexts/UserContext";
import "./App.css";

function AppLayout({ userDoc }: { userDoc: UserDoc | null }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="bg-background text-on-surface overflow-x-hidden">
      <Sidebar
        role={userDoc?.role ?? "branch"}
        onLogout={signOut}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <TopBar
        userDoc={userDoc}
        onMenuToggle={() => setSidebarOpen((o) => !o)}
      />
      <Outlet />
      <PWAPrompt />
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  return (
    <>
      <Login onLogin={() => navigate("/")} />
      <PWAPrompt />
    </>
  );
}

function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (u) => {
      setUser(u);
      if (u) {
        const profile = await getUserProfile(u.uid);
        setUserDoc(profile);
      } else {
        setUserDoc(null);
      }
    });
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

  return (
    <UserContext.Provider value={userDoc}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Protected routes */}
        <Route
          element={
            user ? (
              <AppLayout userDoc={userDoc} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/dispatches" element={<Dispatches />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/imports" element={<Imports />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/sales-transactions" element={<SalesTransactions />} />
          <Route
            path="*"
            element={
              <main className="md:ml-72 pt-24 px-4 md:px-8 py-12 min-h-screen bg-background">
                <p className="text-on-surface-variant">
                  Trang đang phát triển.
                </p>
              </main>
            }
          />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
}

export default App;
