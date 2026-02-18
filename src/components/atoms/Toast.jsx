import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function Toast({ 
  id,
  message, 
  type = 'info', 
  onClose, 
  duration = 5000 
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose, id]);

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500/10 border-red-500/50 text-red-200';
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/50 text-amber-200';
      default:
        return 'bg-neutral-800/90 border-neutral-700 text-neutral-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error': return 'mdi:alert-circle';
      case 'success': return 'mdi:check-circle';
      case 'warning': return 'mdi:alert';
      default: return 'mdi:information';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl min-w-[300px] max-w-md overflow-hidden ${getStyles()} mb-3`}
    >
      <Icon icon={getIcon()} className="text-xl shrink-0" />
      
      <p className="text-sm font-medium flex-1">{message}</p>

      <button
        onClick={() => onClose(id)}
        className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0 z-10"
      >
        <Icon icon="mdi:close" className="text-sm" />
      </button>

      {/* Progress Bar */}
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-1 ${
          type === 'error' ? 'bg-red-500/50' : 
          type === 'success' ? 'bg-emerald-500/50' : 
          type === 'warning' ? 'bg-amber-500/50' : 
          'bg-neutral-500/50'
        }`}
      />
    </motion.div>
  );
}
