import React from 'react';

interface FlameAnimationProps {
  intensity: number; // 0-100
  size?: 'small' | 'medium' | 'large';
}

const FlameAnimation: React.FC<FlameAnimationProps> = ({ intensity, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-8 h-12',
    medium: 'w-12 h-16',
    large: 'w-16 h-20'
  };

  const getFlameColor = (intensity: number) => {
    if (intensity >= 80) return 'from-yellow-300 via-orange-400 to-red-500';
    if (intensity >= 60) return 'from-yellow-400 via-orange-500 to-red-600';
    if (intensity >= 40) return 'from-orange-400 via-red-500 to-red-700';
    if (intensity >= 20) return 'from-orange-500 via-red-600 to-red-800';
    return 'from-red-600 via-red-700 to-red-900';
  };

  const getAnimationSpeed = (intensity: number) => {
    if (intensity >= 80) return 'animate-pulse duration-500';
    if (intensity >= 60) return 'animate-pulse duration-700';
    if (intensity >= 40) return 'animate-pulse duration-1000';
    if (intensity >= 20) return 'animate-pulse duration-1500';
    return 'animate-pulse duration-2000';
  };

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto`}>
      {/* Main Flame */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t ${getFlameColor(intensity)} rounded-full ${getAnimationSpeed(intensity)} opacity-90`}
        style={{
          clipPath: 'polygon(50% 0%, 20% 40%, 30% 70%, 50% 100%, 70% 70%, 80% 40%)',
          filter: 'blur(1px)'
        }}
      />
      
      {/* Inner Flame */}
      <div 
        className={`absolute inset-2 bg-gradient-to-t from-yellow-200 via-yellow-300 to-orange-400 rounded-full ${getAnimationSpeed(intensity)} opacity-80`}
        style={{
          clipPath: 'polygon(50% 10%, 25% 45%, 35% 75%, 50% 90%, 65% 75%, 75% 45%)',
          filter: 'blur(0.5px)'
        }}
      />
      
      {/* Core Flame */}
      {intensity > 50 && (
        <div 
          className={`absolute inset-4 bg-gradient-to-t from-white via-yellow-100 to-yellow-200 rounded-full ${getAnimationSpeed(intensity)} opacity-70`}
          style={{
            clipPath: 'polygon(50% 20%, 30% 50%, 40% 80%, 50% 85%, 60% 80%, 70% 50%)',
          }}
        />
      )}
      
      {/* Glow Effect */}
      <div 
        className={`absolute -inset-2 bg-gradient-radial from-orange-300/30 via-red-400/20 to-transparent rounded-full ${getAnimationSpeed(intensity)}`}
        style={{ filter: 'blur(4px)' }}
      />
    </div>
  );
};

export default FlameAnimation;