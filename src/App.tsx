import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Dashboard } from '@/pages/Dashboard'
import { PWAPrompt } from '@/components/PWAPrompt'
import './App.css'

function App() {
  return (
    <div className="bg-background text-on-surface overflow-x-hidden">
      <Sidebar />
      <TopBar />
      <Dashboard />
      <PWAPrompt />

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-primary text-white w-14 h-14 rounded-[9999px] shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
          <span className="material-symbols-outlined">add_business</span>
        </button>
      </div>
    </div>
  )
}

export default App
