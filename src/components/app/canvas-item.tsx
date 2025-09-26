"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { CanvasItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { RotateCw } from 'lucide-react';

interface CanvasItemProps {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<CanvasItem>) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const Handle = ({ onMouseDown, className, cursor }: { onMouseDown: (e: React.MouseEvent) => void, className: string, cursor: string }) => (
  <div
    className={cn("absolute bg-primary border-2 border-primary-foreground rounded-full size-3 -m-1.5", className)}
    style={{ cursor }}
    onMouseDown={onMouseDown}
  />
);

export default function CanvasItemComponent({ item, isSelected, onSelect, onUpdate, canvasRef }: CanvasItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  const handleInteractionStart = (
    e: React.MouseEvent,
    interaction: 'move' | 'resize' | 'rotate',
    cursor: string | null = null
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(item.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const { x, y, width, height, rotation } = item;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (interaction === 'move') {
        onUpdate(item.id, { x: x + dx, y: y + dy });
      } else if (interaction === 'rotate') {
        const itemRect = itemRef.current!.getBoundingClientRect();
        const centerX = itemRect.left + itemRect.width / 2 - canvasRect.left;
        const centerY = itemRect.top + itemRect.height / 2 - canvasRect.top;

        const startAngle = Math.atan2(startY - canvasRect.top - centerY, startX - canvasRect.left - centerX);
        const currentAngle = Math.atan2(moveEvent.clientY - canvasRect.top - centerY, moveEvent.clientX - canvasRect.left - centerX);
        const newRotation = rotation + (currentAngle - startAngle) * (180 / Math.PI);
        onUpdate(item.id, { rotation: newRotation });
      } else if (interaction === 'resize' && cursor) {
        const rad = rotation * (Math.PI / 180);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const rotatedDx = dx * cos + dy * sin;
        const rotatedDy = dy * cos - dx * sin;
        
        let newX = x, newY = y, newWidth = width, newHeight = height;

        if (cursor.includes('e')) {
            newWidth = width + rotatedDx;
        }
        if (cursor.includes('w')) {
            newWidth = width - rotatedDx;
            newX = x + dx;
            newY = y + dy;
        }
        if (cursor.includes('s')) {
            newHeight = height + rotatedDy;
        }
        if (cursor.includes('n')) {
            newHeight = height - rotatedDy;
            newX = x + dx;
            newY = y + dy;
        }

        if (newWidth > 20 && newHeight > 20) {
            onUpdate(item.id, { x: newX, y: newY, width: newWidth, height: newHeight });
        }
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handles = [
    { name: 'top-left', cursor: 'nwse-resize', className: 'top-0 left-0' },
    { name: 'top-right', cursor: 'nesw-resize', className: 'top-0 right-0' },
    { name: 'bottom-left', cursor: 'nesw-resize', className: 'bottom-0 left-0' },
    { name: 'bottom-right', cursor: 'nwse-resize', className: 'bottom-0 right-0' },
  ];

  return (
    <div
      ref={itemRef}
      className={cn(
        "absolute p-1 transition-opacity",
        isSelected && "outline-dashed outline-1 outline-primary",
        !item.visible && 'opacity-50'
      )}
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
        width: `${item.width}px`,
        height: `${item.height}px`,
        transform: `rotate(${item.rotation}deg)`,
        zIndex: item.zIndex,
        cursor: 'move',
      }}
      onMouseDown={(e) => handleInteractionStart(e, 'move')}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full h-full">
          <Image src={item.imageUrl} alt={item.prompt} layout="fill" objectFit="contain" draggable={false} />
      </div>

      {isSelected && (
        <>
          {handles.map(({ name, cursor, className }) => (
            <Handle
              key={name}
              className={className}
              cursor={cursor}
              onMouseDown={(e) => handleInteractionStart(e, 'resize', cursor)}
            />
          ))}
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 p-1 cursor-alias bg-primary/10 rounded-full"
            onMouseDown={(e) => handleInteractionStart(e, 'rotate')}
          >
            <RotateCw className="size-4 text-primary" />
          </div>
        </>
      )}
    </div>
  );
}
