import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import ProjectCard from './ProjectCard';
import type { ConfigButton } from '@/types';

export interface ProjectGridProps {
  buttons: ConfigButton[];
  loading: boolean;
  activeButtonId: string | number | null;
  onClone: (btn: ConfigButton) => void;
  onOpenColorMenu?: (btn: ConfigButton, e: React.MouseEvent) => void;
  effectiveGrid: number;
  onDragEnd: (event: DragEndEvent) => void;
  isSelectionMode?: boolean;
  selectedIds?: (string | number)[];
  onToggleSelection?: (id: string | number) => void;
}

export default function ProjectGrid({
  buttons,
  loading,
  activeButtonId,
  onClone,
  onOpenColorMenu,
  effectiveGrid,
  onDragEnd,
  isSelectionMode = false,
  selectedIds = [],
  onToggleSelection,
}: ProjectGridProps) {
  const gridClass =
    effectiveGrid === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.includes(btn.id)}
                onToggleSelection={onToggleSelection}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </SortableContext>
    </DndContext>
  );
}
