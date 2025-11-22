import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import ProjectCard from '../molecules/ProjectCard';

export default function ProjectGrid({
  buttons,
  loading,
  activeButtonId,
  onClone,
  onOpenColorMenu,
  effectiveGrid,
  onDragEnd,
}) {
  const gridClass = effectiveGrid === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (prevents accidental drags on click)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={buttons.map((b) => b.id)} strategy={rectSortingStrategy}>
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
      </SortableContext>
    </DndContext>
  );
}
