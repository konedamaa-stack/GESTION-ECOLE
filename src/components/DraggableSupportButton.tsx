import React, { useState, useRef, useEffect } from 'react';

interface DraggableSupportButtonProps {
  onClick: () => void;
}

export const DraggableSupportButton: React.FC<DraggableSupportButtonProps> = ({ onClick }) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, initialX: 0, initialY: 0, hasMoved: false });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize position to bottom-right on mount
  useEffect(() => {
    const updateInitialPosition = () => {
      const padding = 24;
      const width = buttonRef.current?.offsetWidth || 160;
      const height = buttonRef.current?.offsetHeight || 48;
      const initialX = Math.max(10, window.innerWidth - width - padding);
      const initialY = Math.max(10, window.innerHeight - height - padding);
      setPosition((prev) => (prev === null ? { x: initialX, y: initialY } : prev));
    };

    updateInitialPosition();
    window.addEventListener('resize', updateInitialPosition);
    return () => window.removeEventListener('resize', updateInitialPosition);
  }, []);

  const handlePointerDown = (clientX: number, clientY: number) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: rect.left,
      initialY: rect.top,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    handlePointerDown(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;

      const deltaX = clientX - dragRef.current.startX;
      const deltaY = clientY - dragRef.current.startY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        dragRef.current.hasMoved = true;
      }

      const width = buttonRef.current?.offsetWidth || 160;
      const height = buttonRef.current?.offsetHeight || 48;
      const maxX = window.innerWidth - width - 8;
      const maxY = window.innerHeight - height - 8;

      const nextX = Math.min(Math.max(8, dragRef.current.initialX + deltaX), maxX);
      const nextY = Math.min(Math.max(8, dragRef.current.initialY + deltaY), maxY);

      setPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
    };

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handlePointerUp();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging]);

  const handleClick = (e: React.MouseEvent) => {
    if (dragRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className="hide-print floating-support-btn"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      style={{
        position: 'fixed',
        left: position ? `${position.x}px` : 'auto',
        top: position ? `${position.y}px` : 'auto',
        right: position ? 'auto' : '24px',
        bottom: position ? 'auto' : '24px',
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
        boxShadow: isDragging 
          ? '0 12px 24px rgba(0,0,0,0.3), 0 0 0 3px rgba(16, 185, 129, 0.4)' 
          : '0 6px 16px rgba(0,0,0,0.2)',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'transform 0.1s ease, box-shadow 0.1s ease' : 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      title="Cliquez pour ouvrir le support (ou glissez pour déplacer sur l'écran)"
    >
      <span className="support-icon" style={{ fontSize: '1.2rem', pointerEvents: 'none' }}>❓</span>
      <span className="support-text" style={{ pointerEvents: 'none', fontWeight: 700 }}>Aide & Support</span>
    </button>
  );
};
