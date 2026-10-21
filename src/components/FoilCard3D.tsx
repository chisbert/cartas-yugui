import React, { useRef, useState } from 'react';
import { soundFx } from '../services/soundFx';

interface FoilCard3DProps {
  children: React.ReactNode;
  isOwned: boolean;
  isDesired: boolean;
  hasSpecialFoil?: boolean;
  className?: string;
}

export const FoilCard3D: React.FC<FoilCard3DProps> = ({
  children,
  isOwned,
  isDesired,
  hasSpecialFoil = false,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('perspective(800px) rotateX(0deg) rotateY(0deg)');
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTransformStyle(`perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`);
    setGlarePosition({ x: glareX, y: glareY, opacity: isOwned || isDesired ? 0.35 : 0.15 });
  };

  const handleMouseEnter = () => {
    if (hasSpecialFoil && (isOwned || isDesired)) {
      soundFx.playFoilChime();
    }
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: 'transform 0.15s ease-out',
        willChange: 'transform',
      }}
      className={`relative select-none ${className}`}
    >
      {children}

      {/* Holographic Foil Glare Light Reflection Overlay */}
      {(isOwned || isDesired) && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden mix-blend-color-dodge transition-opacity duration-300"
          style={{
            opacity: glarePosition.opacity,
            background: hasSpecialFoil
              ? `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(254, 240, 138, 0.7) 0%, rgba(217, 70, 239, 0.4) 30%, rgba(56, 189, 248, 0.3) 60%, transparent 80%)`
              : `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.5) 0%, rgba(251, 191, 36, 0.25) 40%, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
};
