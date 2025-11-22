import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '../molecules/ProjectCard';

export default function ProjectGrid({ buttons, loading, activeButtonId, onClone, onOpenColorMenu, effectiveGrid }) {
  const gridClass = effectiveGrid === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={effectiveGrid}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`grid ${gridClass} gap-3`}
      >
        {buttons.map((btn) => (
          <ProjectCard
            key={btn.id}
            btn={btn}
            loading={loading}
            activeButtonId={activeButtonId}
            onClone={onClone}
            onOpenColorMenu={onOpenColorMenu}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
