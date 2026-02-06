import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

// === VARIANTS (Moved outside) ===
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const contentContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  },
};

const stepContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.6,
      delayChildren: 0.4,
    }
  }
};

// === HELPERS (Moved outside) ===
const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  e.currentTarget.style.setProperty('--x', `${x}px`);
  e.currentTarget.style.setProperty('--y', `${y}px`);
};

// === COMPONENTS (Moved outside) ===
const Card = ({ icon, title, children, onMouseMove }) => (
  <motion.div
    variants={itemVariants}
    className="group relative p-4 bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col items-center gap-3 overflow-hidden transition-colors hover:border-neutral-700"
    onMouseMove={onMouseMove}
  >
    <div
      className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
      style={{
        background: `radial-gradient(600px circle at var(--x) var(--y), rgba(255,255,255,0.06), transparent 40%)`,
      }}
    />
    <div className="relative z-10 flex flex-col items-center gap-3 w-full">
      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
        <Icon icon={icon} className="text-xl text-neutral-400" />
      </div>
      <span className="text-xs font-medium text-neutral-500">{title}</span>
      {children}
    </div>
  </motion.div>
);

const RequirementItem = ({ label, icon, status, link, linkLabel, checking, onMouseMove }) => (
  <motion.div
    variants={itemVariants}
    className="group relative flex items-center justify-between p-4 bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden transition-colors hover:border-neutral-700"
    onMouseMove={onMouseMove}
  >
    <div
      className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
      style={{
        background: `radial-gradient(600px circle at var(--x) var(--y), rgba(255,255,255,0.06), transparent 40%)`,
      }}
    />
    <div className="relative z-10 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
         <Icon icon={icon} className="text-xl text-neutral-400" />
      </div>
      <div>
        <div className="text-neutral-300 font-medium">{label}</div>
        <a 
          href={link} 
          target="_blank" 
          rel="noreferrer"
          className="text-xs text-emerald-500 hover:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
          onClick={(e) => {
             e.preventDefault();
             window.electronAPI?.openRepoUrl?.(link);
          }}
        >
          {linkLabel} <Icon icon="mdi:open-in-new" className="text-[10px]" />
        </a>
      </div>
    </div>
    <div className="relative z-10">
      {checking ? (
         <Icon icon="mdi:loading" className="animate-spin text-neutral-500" />
      ) : status ? (
         <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
           <Icon icon="mdi:check" className="text-emerald-500 text-sm" />
         </div>
      ) : (
         <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
           <Icon icon="mdi:close" className="text-red-500 text-sm" />
         </div>
      )}
    </div>
  </motion.div>
);

// === MAIN COMPONENT ===
export default function OnboardingModal({ open, onFinish }) {
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState({ git: false, node: false, code: false });
  const [checking, setChecking] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    setCanProceed(false);
  }, [step]);

  useEffect(() => {
    if (open) {
      checkTools();
    }
  }, [open]);

  const checkTools = async () => {
    if (!window.electronAPI?.checkRequirements) return;
    setChecking(true);
    try {
      const result = await window.electronAPI.checkRequirements();
      setChecks(result);
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  if (!open) return null;

  const steps = [
    {
      title: 'Welcome',
      content: (
        <motion.div 
          className="space-y-6"
          variants={contentContainerVariants}
        >
          <motion.p 
            variants={itemVariants} 
            className="text-neutral-400 text-lg leading-relaxed"
          >
            Simplify your workflow. Manage and clone repositories with Velocity.
          </motion.p>
          <motion.div 
            className="grid grid-cols-3 gap-4 pt-4"
            variants={containerVariants}
          >
            <Card icon="mdi:git" title="Git Clone" onMouseMove={handleMouseMove} />
            <Card icon="mdi:folder-zip-outline" title="Zip" onMouseMove={handleMouseMove} />
            <Card icon="mdi:code-braces" title="Auto Open" onMouseMove={handleMouseMove} />
          </motion.div>
        </motion.div>
      ),
    },
    {
      title: 'Essentials',
      content: (
        <motion.div 
          className="space-y-6"
          variants={contentContainerVariants}
        >
          <motion.p 
            variants={itemVariants}
            className="text-neutral-400 text-lg"
          >
            Ensure these tools are ready for the best experience.
          </motion.p>
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
          >
            <RequirementItem 
              label="Git" 
              icon="mdi:git" 
              status={checks.git} 
              link="https://git-scm.com/"
              linkLabel="git-scm.com"
              checking={checking}
              onMouseMove={handleMouseMove}
            />
            <RequirementItem 
              label="Node.js" 
              icon="mdi:nodejs" 
              status={checks.node} 
              link="https://nodejs.org/"
              linkLabel="nodejs.org"
              checking={checking}
              onMouseMove={handleMouseMove}
            />
            <RequirementItem 
              label="Code Editor" 
              icon="mdi:microsoft-visual-studio-code" 
              status={checks.code} 
              link="https://code.visualstudio.com/"
              linkLabel="code.visualstudio.com"
              checking={checking}
              onMouseMove={handleMouseMove}
            />
          </motion.div>
        </motion.div>
      ),
    },
    {
      title: 'How it Works',
      content: (
        <motion.div 
          className="space-y-8"
          variants={contentContainerVariants}
        >
          <motion.div 
            className="relative pl-8 space-y-8 border-l border-neutral-800 ml-2"
            variants={containerVariants}
          >
            <motion.div className="relative" variants={itemVariants}>
              <div className="absolute -left-[43px] top-0 w-4 h-4 rounded-full bg-neutral-800 border-4 border-black" />
              <h4 className="text-white font-medium mb-1">Setup</h4>
              <p className="text-sm text-neutral-500">Configure your repository buttons.</p>
            </motion.div>
            <motion.div className="relative" variants={itemVariants}>
              <div className="absolute -left-[43px] top-0 w-4 h-4 rounded-full bg-neutral-800 border-4 border-black" />
              <h4 className="text-white font-medium mb-1">Target</h4>
              <p className="text-sm text-neutral-500">Choose your destination folder.</p>
            </motion.div>
            <motion.div className="relative" variants={itemVariants}>
              <div className="absolute -left-[43px] top-0 w-4 h-4 rounded-full bg-neutral-800 border-4 border-black" />
              <h4 className="text-white font-medium mb-1">Clone</h4>
              <p className="text-sm text-neutral-500">One click to clone and open.</p>
            </motion.div>
          </motion.div>
        </motion.div>
      ),
    },
    {
      title: "Ready",
      content: (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-8">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-neutral-500/20 blur-2xl rounded-full" />
            <div className="relative w-32 h-32 bg-neutral-900 rounded-full border border-neutral-800 flex items-center justify-center mb-4 shadow-2xl">
              <Icon icon="mdi:rocket-launch" className="text-5xl text-white" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h3 className="text-3xl font-bold text-white">You're all set!</h3>
            <p className="text-neutral-400 text-lg max-w-xs mx-auto leading-relaxed">
              Your environment is ready. Start cloning and managing your projects.
            </p>
          </motion.div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] bg-black flex overflow-hidden"
      >
        {/* Left Column - Image */}
        <div className="hidden lg:block w-1/2 h-full relative bg-neutral-900">
          <img
            src="./started-background.png"
            alt="Onboarding Background"
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              e.target.style.display = 'none'; // Hide if missing
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80" />
          <div className="absolute bottom-12 left-12 max-w-md">
            <h1 className="text-4xl font-bold text-white mb-4">Velocity</h1>
            <p className="text-neutral-400 text-lg">
              Streamline your development setup.
            </p>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-between p-12 lg:p-24 bg-black relative overflow-hidden">
          {/* Background Gradient */}
          <div 
            className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-40"
            style={{
              background: 'radial-gradient(circle at bottom right, rgba(85, 85, 85, 1), transparent 70%)'
            }}
          />

          {/* Progress Dots */}
          <div className="flex gap-2 mb-12 relative z-10">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === step ? 'w-8 bg-white' : 'w-2 bg-neutral-800'
                }`}
              />
            ))}
          </div>

          {/* Main Content */}
          {/* Main Content & Footer */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              key={step}
              variants={stepContainerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            >
              <motion.h2 variants={itemVariants} className="text-4xl font-bold text-white mb-8">{currentStepData.title}</motion.h2>
              {currentStepData.content}

              {/* Footer Navigation */}
              <motion.div 
                className="flex items-center justify-between mt-12 pt-8 border-t border-neutral-900"
                variants={itemVariants}
                onAnimationComplete={() => {
                  setTimeout(() => {
                    setCanProceed(true);
                  }, 1000);
                }}
              >
                <button
                  onClick={handleBack}
                  className={`text-sm font-medium text-neutral-500 hover:text-white transition-colors cursor-pointer ${
                    step === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  Back
                </button>

                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={`px-8 py-4 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                    canProceed 
                      ? 'bg-white text-black hover:bg-neutral-200 cursor-pointer' 
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  {step === steps.length - 1 ? "Get Started" : 'Next'}
                  {step < steps.length - 1 && <Icon icon="mdi:arrow-right" />}
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
