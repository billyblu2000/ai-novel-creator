import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PlotElement } from '../../types';

interface DraggablePlotElementProps {
  element: PlotElement;
  children: React.ReactNode;
  isDragMode: boolean;
}

export const DraggablePlotElement: React.FC<DraggablePlotElementProps> = ({
  element,
  children,
  isDragMode
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: element.id,
    disabled: !isDragMode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isDragMode ? attributes : {})}
      {...(isDragMode ? listeners : {})}
      className={`${isDragMode ? 'cursor-move' : ''} ${isDragging ? 'z-50' : ''}`}
    >
      {children}
    </div>
  );
};