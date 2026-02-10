import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store';
import { triggerExplosion, triggerSelection } from '../utils/confetti';
import { ClassName, Student } from '../types';
import { Play, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

enum CeremonyState {
  IDLE = 'IDLE',
  COUNTDOWN = 'COUNTDOWN',
  SELECTING_FILLEUL = 'SELECTING_FILLEUL',
  TRANSITION_TO_PARRAIN = 'TRANSITION_TO_PARRAIN',
  SELECTING_PARRAIN = 'SELECTING_PARRAIN',
  REVEAL = 'REVEAL',
  HANDSHAKE = 'HANDSHAKE',
  FINISHED = 'FINISHED'
}

const CeremonyStage: React.FC = () => {
  const { getPossiblePairing, getAvailableFilleuls, getAvailableParrains, createMatch, settings } = useApp();
  const [state, setState] = useState<CeremonyState>(CeremonyState.IDLE);
  const [countdown, setCountdown] = useState(5);
  
  // Selection logic
  const [currentPairing, setCurrentPairing] = useState<{ source: ClassName, target: ClassName } | null>(null);
  const [selectedFilleul, setSelectedFilleul] = useState<Student | null>(null);
  const [selectedParrain, setSelectedParrain] = useState<Student | null>(null);
  const [displayedFilleul, setDisplayedFilleul] = useState<Student | null>(null);
  const [displayedParrain, setDisplayedParrain] = useState<Student | null>(null);
  const [flashEffect, setFlashEffect] = useState<'FILLEUL' | 'PARRAIN' | null>(null);

  const logoSrc = settings.logoUrl || "/logo_ae2i.png";

  const startCeremony = () => {
    const pairing = getPossiblePairing();
    if (!pairing) return;

    setCurrentPairing({ source: pairing.source, target: pairing.target });
    
    const filleuls = getAvailableFilleuls(pairing.source);
    const parrains = getAvailableParrains(pairing.target);
    
    if (filleuls.length === 0 || parrains.length === 0) return;

    const winnerFilleul = filleuls[Math.floor(Math.random() * filleuls.length)];
    const winnerParrain = parrains[Math.floor(Math.random() * parrains.length)];
    
    setSelectedFilleul(winnerFilleul);
    setSelectedParrain(winnerParrain);
    setFlashEffect(null);
    
    setCountdown(5);
    setState(CeremonyState.COUNTDOWN);
  };

  const handleNextDraw = () => {
    setDisplayedFilleul(null);
    setDisplayedParrain(null);
    startCeremony();
  };

  const hasNextPairing = getPossiblePairing() !== null;

  // Animation variants
  const shakeVariant = {
    shake: {
      x: [0, -3, 3, -3, 3, 0],
      transition: { duration: 0.1, repeat: Infinity }
    },
    pulse: {
        scale: [1, 1.05, 1],
        boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 30px rgba(255,255,255,0.5)", "0px 0px 0px rgba(0,0,0,0)"],
        transition: { duration: 1.5, repeat: Infinity }
    },
    idle: { scale: 1, x: 0 }
  };

  useEffect(() => {
    let timer: any;

    if (state === CeremonyState.COUNTDOWN) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        setState(CeremonyState.SELECTING_FILLEUL);
      }
    }

    if (state === CeremonyState.SELECTING_FILLEUL && currentPairing) {
        const candidates = getAvailableFilleuls(currentPairing.source);
        let shuffles = 0;
        const maxShuffles = 30; // 30 * 100ms = 3 seconds
        
        timer = setInterval(() => {
            // Ensure visual change even if random picks same index
            let nextCandidate;
            do {
                const randomIndex = Math.floor(Math.random() * candidates.length);
                nextCandidate = candidates[randomIndex];
            } while (candidates.length > 1 && nextCandidate === displayedFilleul);

            setDisplayedFilleul(nextCandidate);
            
            shuffles++;
            if (shuffles >= maxShuffles) {
                clearInterval(timer);
                setDisplayedFilleul(selectedFilleul);
                setFlashEffect('FILLEUL'); 
                triggerSelection(0.3);
                setTimeout(() => {
                    setFlashEffect(null);
                    setState(CeremonyState.TRANSITION_TO_PARRAIN);
                }, 1500); 
            }
        }, 100); // 100ms is better for visual recognition than 80ms
    }

    if (state === CeremonyState.TRANSITION_TO_PARRAIN) {
        timer = setTimeout(() => setState(CeremonyState.SELECTING_PARRAIN), 3000);
    }

    if (state === CeremonyState.SELECTING_PARRAIN && currentPairing) {
         const candidates = getAvailableParrains(currentPairing.target);
         let shuffles = 0;
         const maxShuffles = 50; // 50 * 100ms = 5 seconds
         
         timer = setInterval(() => {
             let nextCandidate;
             do {
                 const randomIndex = Math.floor(Math.random() * candidates.length);
                 nextCandidate = candidates[randomIndex];
             } while (candidates.length > 1 && nextCandidate === displayedParrain);

             setDisplayedParrain(nextCandidate);

             shuffles++;
             if (shuffles >= maxShuffles) {
                 clearInterval(timer);
                 setDisplayedParrain(selectedParrain);
                 setFlashEffect('PARRAIN');
                 triggerSelection(0.7); 
                 setTimeout(() => {
                     setFlashEffect(null);
                     triggerExplosion();
                     setState(CeremonyState.REVEAL);
                 }, 1000);
             }
         }, 100);
    }

    if (state === CeremonyState.REVEAL) {
        timer = setTimeout(() => setState(CeremonyState.HANDSHAKE), 1500);
    }

    if (state === CeremonyState.HANDSHAKE) {
        timer = setTimeout(() => {
            if (selectedFilleul && selectedParrain) {
                createMatch(selectedFilleul.id, selectedParrain.id);
            }
            setState(CeremonyState.FINISHED);
        }, 2500);
    }

    return () => clearTimeout(timer);
  }, [state, countdown]);

  const resetCeremony = () => {
    setState(CeremonyState.IDLE);
    setSelectedFilleul(null);
    setSelectedParrain(null);
    setDisplayedFilleul(null);
    setDisplayedParrain(null);
  };

  return (
    <div className="relative w-full min-h-[600px] bg-slate-900/80 rounded-3xl overflow-hidden border border-slate-700 flex flex-col items-center justify-center p-4 shadow-2xl backdrop-blur-sm">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black -z-10"></div>
      
      {/* Logo Watermark inside stage */}
      <div className="absolute inset-0 flex items-center justify-center z-0 opacity-10 pointer-events-none">
          <img 
            src={logoSrc} 
            alt="Logo AE2I" 
            className="w-[60%] max-w-[500px] object-contain" 
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
      </div>
      
      {/* Controls */}
      {state === CeremonyState.IDLE && (
        <div className="text-center z-10 animate-in zoom-in duration-500">
          <div className="mb-12">
            <Sparkles className="w-24 h-24 text-brand-fire mx-auto mb-6 animate-pulse-fast drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <h2 className="text-6xl md:text-7xl font-display text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 drop-shadow-sm">
              Prêt pour le Parrainage ?
            </h2>
            <p className="text-slate-300 mt-4 text-xl max-w-2xl mx-auto">Le système sélectionnera automatiquement les prochaines correspondances.</p>
          </div>
          
          {hasNextPairing ? (
            <button 
              onClick={startCeremony}
              className="group relative inline-flex items-center justify-center px-10 py-5 text-2xl font-bold text-white transition-all duration-200 bg-brand-purple font-display rounded-full focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-brand-purple hover:bg-violet-600 hover:scale-105 shadow-[0_0_30px_rgba(124,58,237,0.5)]"
            >
              <Play className="w-8 h-8 mr-3 fill-current" />
              LANCER LE TIRAGE
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-30 group-hover:opacity-50 blur-lg transition-opacity duration-200" />
            </button>
          ) : (
             <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700">
                 <p className="text-2xl text-green-400 font-display flex items-center justify-center gap-2">
                     <CheckCircle2 className="w-8 h-8"/> Tous les étudiants sont parrainés !
                 </p>
             </div>
          )}
        </div>
      )}

      {/* Countdown */}
      {state === CeremonyState.COUNTDOWN && (
        <motion.div 
            key="countdown"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 3, opacity: 0 }}
            className="text-[12rem] font-display text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-600 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]"
        >
            {countdown}
        </motion.div>
      )}

      {/* Main Stage */}
      <div className="flex w-full justify-center items-center gap-8 md:gap-16 max-w-7xl relative z-10 px-4">
        
        {/* Filleul Side */}
        {(state === CeremonyState.SELECTING_FILLEUL || state === CeremonyState.TRANSITION_TO_PARRAIN || state === CeremonyState.SELECTING_PARRAIN || state === CeremonyState.REVEAL || state === CeremonyState.HANDSHAKE || state === CeremonyState.FINISHED) && (
            <div className="flex flex-col items-center gap-4 w-[45%] md:w-[300px]">
                <h3 className="text-xl md:text-2xl font-display text-blue-400 tracking-wider drop-shadow-md">FILLEUL ({currentPairing?.source})</h3>
                <motion.div 
                    key="filleul-card-container"
                    variants={shakeVariant}
                    animate={state === CeremonyState.SELECTING_FILLEUL ? "shake" : (flashEffect === 'FILLEUL' || state === CeremonyState.TRANSITION_TO_PARRAIN) ? "pulse" : "idle"}
                    className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-4 bg-slate-800 ${state === CeremonyState.SELECTING_FILLEUL ? 'border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.6)]' : 'border-blue-500 shadow-2xl'}`}
                >
                    {/* Flash Overlay */}
                    {flashEffect === 'FILLEUL' && (
                        <motion.div 
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-white z-50 pointer-events-none"
                        />
                    )}

                    {displayedFilleul ? (
                        <>
                            {/* Key is crucial here to force React to replace the img element when student changes */}
                            <img 
                                key={displayedFilleul.id} 
                                src={displayedFilleul.photoUrl} 
                                alt="Filleul" 
                                className="w-full h-full object-cover animate-in fade-in duration-75" 
                            />
                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4 text-center pt-10">
                                <p className="text-2xl font-display text-white truncate drop-shadow-md">{displayedFilleul.name}</p>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl text-slate-600 font-display">?</span>
                        </div>
                    )}
                    
                    {/* Fire Effect Overlay during selection */}
                    {state === CeremonyState.SELECTING_FILLEUL && (
                        <motion.div 
                            layoutId="fireball-overlay"
                            className="absolute inset-0 bg-orange-500/20 mix-blend-overlay z-20"
                        />
                    )}
                </motion.div>
            </div>
        )}

        {/* Traveling Fireball */}
        {state === CeremonyState.TRANSITION_TO_PARRAIN && (
            <motion.div
                layoutId="fireball"
                initial={{ x: '-150%', scale: 0.5, opacity: 0 }}
                animate={{ x: '150%', scale: 2.5, opacity: 1 }}
                transition={{ duration: 3, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
            >
                <div className="relative">
                     <div className="w-40 h-40 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 blur-lg shadow-[0_0_120px_rgba(249,115,22,1)] animate-spin-slow"></div>
                     <div className="absolute inset-0 w-40 h-40 rounded-full bg-white opacity-20 blur-xl animate-pulse"></div>
                </div>
            </motion.div>
        )}

        {/* Parrain Side */}
        {(state === CeremonyState.SELECTING_PARRAIN || state === CeremonyState.REVEAL || state === CeremonyState.HANDSHAKE || state === CeremonyState.FINISHED) && (
            <div className="flex flex-col items-center gap-4 w-[45%] md:w-[300px]">
                <h3 className="text-xl md:text-2xl font-display text-green-400 tracking-wider drop-shadow-md">PARRAIN ({currentPairing?.target})</h3>
                <motion.div 
                    key="parrain-card-container"
                    variants={shakeVariant}
                    animate={state === CeremonyState.SELECTING_PARRAIN ? "shake" : (flashEffect === 'PARRAIN' || state === CeremonyState.REVEAL) ? "pulse" : "idle"}
                    className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-4 bg-slate-800 ${state === CeremonyState.SELECTING_PARRAIN ? 'border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.6)]' : 'border-green-500 shadow-2xl'}`}
                >
                        {/* Flash Overlay */}
                        {flashEffect === 'PARRAIN' && (
                        <motion.div 
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-white z-50 pointer-events-none"
                        />
                    )}

                    {displayedParrain ? (
                        <>
                             {/* Key is crucial here to force React to replace the img element when student changes */}
                            <img 
                                key={displayedParrain.id}
                                src={displayedParrain.photoUrl} 
                                alt="Parrain" 
                                className="w-full h-full object-cover animate-in fade-in duration-75" 
                            />
                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4 text-center pt-10">
                                <p className="text-2xl font-display text-white truncate drop-shadow-md">{displayedParrain.name}</p>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl text-slate-600 font-display">?</span>
                        </div>
                    )}
                    
                        {/* Fire Effect Overlay during selection */}
                        {state === CeremonyState.SELECTING_PARRAIN && (
                        <motion.div 
                            layoutId="fireball-overlay"
                            className="absolute inset-0 bg-orange-500/20 mix-blend-overlay z-20"
                        />
                    )}
                </motion.div>
            </div>
        )}
      </div>

      {/* Handshake Animation Overlay */}
      {state === CeremonyState.HANDSHAKE && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[2px]">
              <motion.div 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1.5, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="text-[150px] drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"
              >
                  🤝
              </motion.div>
          </div>
      )}

      {/* Finished State Modal */}
      {state === CeremonyState.FINISHED && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
              <motion.h2 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-5xl md:text-7xl font-display text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-500 to-teal-500 mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] text-center px-4 tracking-wider uppercase"
              >
                  PARRAINAGE VALIDÉ !
              </motion.h2>
              
              <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center mb-10 w-full max-w-4xl justify-center">
                  <motion.div 
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center"
                  >
                      <div className="relative">
                        <img src={selectedFilleul?.photoUrl} className="w-40 h-40 md:w-60 md:h-60 rounded-full border-8 border-blue-500 object-cover shadow-[0_0_60px_rgba(59,130,246,0.8)]" />
                        <div className="absolute -bottom-4 bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg text-lg border-2 border-white">Filleul</div>
                      </div>
                      <p className="text-2xl md:text-3xl font-display mt-8 text-white text-center">{selectedFilleul?.name}</p>
                      <p className="text-blue-400 text-lg font-bold">{selectedFilleul?.className}</p>
                  </motion.div>

                  <div className="text-6xl text-slate-500 animate-pulse hidden md:block">➜</div>

                  <motion.div 
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center"
                  >
                      <div className="relative">
                        <img src={selectedParrain?.photoUrl} className="w-40 h-40 md:w-60 md:h-60 rounded-full border-8 border-green-500 object-cover shadow-[0_0_60px_rgba(34,197,94,0.8)]" />
                        <div className="absolute -bottom-4 bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-lg text-lg border-2 border-white">Parrain</div>
                      </div>
                      <p className="text-2xl md:text-3xl font-display mt-8 text-white text-center">{selectedParrain?.name}</p>
                      <p className="text-green-400 text-lg font-bold">{selectedParrain?.className}</p>
                  </motion.div>
              </div>

              <div className="flex gap-4">
                  <button 
                    onClick={resetCeremony}
                    className="px-6 py-3 rounded-full font-bold text-slate-400 hover:text-white hover:bg-white/10 transition border border-transparent hover:border-white/20"
                  >
                      Retour Accueil
                  </button>
                  
                  {hasNextPairing ? (
                      <button 
                        onClick={handleNextDraw}
                        className="group flex items-center gap-3 bg-brand-purple hover:bg-violet-600 text-white px-10 py-4 rounded-full font-bold text-xl shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] hover:scale-105 transition-all"
                      >
                          PROCHAIN TIRAGE <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </button>
                  ) : (
                      <div className="bg-slate-800 text-green-400 px-8 py-4 rounded-full font-bold text-xl border border-green-500/30">
                          Session Terminée
                      </div>
                  )}
              </div>
          </div>
      )}

    </div>
  );
};

export default CeremonyStage;