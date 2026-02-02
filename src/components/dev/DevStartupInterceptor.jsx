import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function DevStartupInterceptor({ children }) {
  const isDev = import.meta.env.DEV;

  const [showInterceptor, setShowInterceptor] = useState(false);
  const [selectionMade, setSelectionMade] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0); // 0: Show, 1: Skip
  const [openDevTools, setOpenDevTools] = useState(false);

  useEffect(() => {
    if (!isDev) return;

    // Force focus to the window so keyboard events work immediately
    window.focus();

    const choiceMade = sessionStorage.getItem('dev_choice_made');
    if (!choiceMade) {
      setShowInterceptor(true);
    }
  }, [isDev]);

  const handleChoice = (skipOnboarding) => {
    sessionStorage.setItem('dev_choice_made', 'true');
    if (skipOnboarding) {
      sessionStorage.setItem('onboarding_complete', 'true');
    } else {
      sessionStorage.removeItem('onboarding_complete');
    }

    if (openDevTools) {
      if (window.electronAPI && window.electronAPI.openDevTools) {
        window.electronAPI.openDevTools();
      }
    }

    setSelectionMade(true);
    setTimeout(() => setShowInterceptor(false), 300);
  };

  useEffect(() => {
    if (!showInterceptor || selectionMade) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setSelectedIndex(0);
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex(1);
      } else if (e.key === 'Enter') {
        handleChoice(selectedIndex === 1); // Confirm choice
      } else if (e.key === ' ') {
        // Space to toggle DevTools
        setOpenDevTools((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInterceptor, selectionMade, selectedIndex, openDevTools]);

  if (!isDev || (!showInterceptor && !selectionMade)) {
    return <>{children}</>;
  }

  return (
    <>
      <AnimatePresence>
        {showInterceptor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-neutral-950/90 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-neutral-950/50 p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Icon icon="mdi:console" className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold tracking-wider">DEV MODE SETUP</span>
                </div>
                <div className="text-xs text-neutral-600 font-mono">USE ARROW KEYS, SPACE & ENTER</div>
              </div>

              {/* Content */}
              <div className="flex h-64">
                {/* Left Option: Show Onboarding */}
                <button
                  onClick={() => handleChoice(false)}
                  onMouseEnter={() => setSelectedIndex(0)}
                  className={`flex-1 flex flex-col items-center justify-center p-8 transition-all relative group
                        ${selectedIndex === 0 ? 'bg-neutral-800/50' : 'bg-transparent hover:bg-neutral-800/30'}
                      `}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300
                          ${selectedIndex === 0 ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/20' : 'bg-neutral-800 text-neutral-500'}
                        `}
                  >
                    <Icon icon="mdi:rocket-launch" className="w-8 h-8" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 transition-colors ${selectedIndex === 0 ? 'text-white' : 'text-neutral-500'}`}>Show Onboarding</h3>
                  <p className="text-sm text-neutral-500 text-center max-w-[200px]">Run the full intro experience</p>

                  {selectedIndex === 0 && <motion.div layoutId="indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />}
                </button>

                {/* Divider */}
                <div className="w-px bg-neutral-800 my-8" />

                {/* Right Option: Skip Onboarding */}
                <button
                  onClick={() => handleChoice(true)}
                  onMouseEnter={() => setSelectedIndex(1)}
                  className={`flex-1 flex flex-col items-center justify-center p-8 transition-all relative group
                        ${selectedIndex === 1 ? 'bg-neutral-800/50' : 'bg-transparent hover:bg-neutral-800/30'}
                      `}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300
                          ${selectedIndex === 1 ? 'bg-purple-500 text-white scale-110 shadow-lg shadow-purple-500/20' : 'bg-neutral-800 text-neutral-500'}
                        `}
                  >
                    <Icon icon="mdi:fast-forward" className="w-8 h-8" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 transition-colors ${selectedIndex === 1 ? 'text-white' : 'text-neutral-500'}`}>Skip Onboarding</h3>
                  <p className="text-sm text-neutral-500 text-center max-w-[200px]">Go directly to dashboard</p>

                  {selectedIndex === 1 && <motion.div layoutId="indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />}
                </button>
              </div>

              {/* Footer / Settings */}
              <div className="bg-neutral-950/30 p-4 border-t border-neutral-800 flex items-center justify-center">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                         ${openDevTools ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-neutral-600 group-hover:border-neutral-500'}
                      `}
                  >
                    {openDevTools && <Icon icon="mdi:check" className="w-3 h-3 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={openDevTools} onChange={(e) => setOpenDevTools(e.target.checked)} />
                  <span className={`text-sm font-medium transition-colors ${openDevTools ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-400'}`}>Open DevTools</span>
                </label>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {!showInterceptor && children}
    </>
  );
}
