import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

export default function Tooltip({ content, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const updatePosition = () => {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left + rect.width / 2
        });
      };
      
      updatePosition();
      // Update on global events to keep attached
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true); // Capture to detect scroll in any parent
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isVisible]);

  return (
    <>
      <div 
        ref={triggerRef}
        className="relative flex items-center justify-center"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {createPortal(
        <AnimatePresence>
          {isVisible && content && (
            <motion.div
              initial={{ opacity: 0, x: "-50%", y: "calc(-100% - 4px)", scale: 0.95 }}
              animate={{ opacity: 1, x: "-50%", y: "calc(-100% - 8px)", scale: 1 }}
              exit={{ opacity: 0, x: "-50%", y: "calc(-100% - 4px)", scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[9999] min-w-[200px] max-w-[300px] pointer-events-none"
              style={{ 
                top: coords.top, 
                left: coords.left
              }}
            >
              <div className="bg-neutral-900/95 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-2xl overflow-hidden p-3 text-xs w-max">
                {content}
              </div>
              {/* Arrow */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-neutral-900/95 border-r border-b border-neutral-800 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
