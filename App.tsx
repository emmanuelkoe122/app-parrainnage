import React, { useState } from 'react';
import { AppProvider } from './store';
import SetupPanel from './components/SetupPanel';
import CeremonyStage from './components/CeremonyStage';
import ResultsPanel from './components/ResultsPanel';
import { LayoutDashboard, PlayCircle, Settings, Trophy } from 'lucide-react';

// Use simple internal routing state since no heavy router is needed
enum View {
  SETUP = 'SETUP',
  CEREMONY = 'CEREMONY',
  RESULTS = 'RESULTS'
}

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.CEREMONY);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-brand-purple selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-fire to-brand-red rounded-lg flex items-center justify-center">
                 <span className="font-display text-slate-900 text-xl pt-1">P</span>
              </div>
              <span className="text-xl font-display tracking-wide text-white">Parrainage <span className="text-brand-purple">AE2I</span></span>
            </div>
            
            <div className="flex space-x-1 bg-slate-800 p-1 rounded-full">
              <button 
                onClick={() => setCurrentView(View.SETUP)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${currentView === View.SETUP ? 'bg-brand-purple text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                <Settings className="w-4 h-4" /> Setup
              </button>
              <button 
                onClick={() => setCurrentView(View.CEREMONY)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${currentView === View.CEREMONY ? 'bg-brand-purple text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                <PlayCircle className="w-4 h-4" /> Cérémonie
              </button>
              <button 
                onClick={() => setCurrentView(View.RESULTS)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${currentView === View.RESULTS ? 'bg-brand-purple text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                <Trophy className="w-4 h-4" /> Résultats
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === View.SETUP && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SetupPanel />
            </div>
        )}
        {currentView === View.CEREMONY && (
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col gap-8">
                 <div className="text-center mb-4">
                    <h1 className="text-4xl font-display text-white mb-2">Le Grand Tirage</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Le feu sacré choisira les destins. Les parrains et filleuls seront unis pour une année de succès.
                    </p>
                 </div>
                <CeremonyStage />
                <ResultsPanel />
            </div>
        )}
        {currentView === View.RESULTS && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ResultsPanel />
            </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;