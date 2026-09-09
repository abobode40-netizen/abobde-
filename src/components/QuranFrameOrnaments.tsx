import React from 'react';
import { QuranThemeConfig } from '../types';

interface QuranFrameOrnamentsProps {
  theme: QuranThemeConfig;
}

export const QuranFrameOrnaments: React.FC<QuranFrameOrnamentsProps> = ({ theme }) => {
  const { cornerShape, cornerBorderColor } = theme;

  const renderCorner = (position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left') => {
    const isTop = position.startsWith('top');
    const isRight = position.endsWith('right');

    const posClasses = `${isTop ? 'top-2.5' : 'bottom-2.5'} ${isRight ? 'right-2.5' : 'left-2.5'}`;
    const rotateClass = 
      position === 'top-right' ? '' :
      position === 'top-left' ? '-scale-x-100' :
      position === 'bottom-right' ? '-scale-y-100' :
      '-scale-100';

    if (cornerShape === 'classic_square') {
      return (
        <div className={`absolute ${posClasses} pointer-events-none ${rotateClass}`}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 4H20C22.2091 4 24 5.79086 24 8V28" stroke={cornerBorderColor} strokeWidth="1.75" strokeLinecap="round" />
            <path d="M0 9H15C17.2091 9 19 10.7909 19 13V28" stroke={cornerBorderColor} strokeWidth="0.8" strokeOpacity="0.6" />
            <polygon points="20,8 22,5 25,7 23,10 26,12 23,14 24,17 21,15 19,18 18,14 15,13 18,11 17,8" fill={cornerBorderColor} opacity="0.85" />
          </svg>
        </div>
      );
    }

    if (cornerShape === 'arabesque_floral') {
      return (
        <div className={`absolute ${posClasses} pointer-events-none ${rotateClass}`}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4C16 4 28 16 28 30" stroke={cornerBorderColor} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M6 4C17 6 26 15 28 26" stroke={cornerBorderColor} strokeWidth="0.9" strokeDasharray="2 2" />
            <circle cx="20" cy="12" r="3.5" stroke={cornerBorderColor} strokeWidth="1" fill={cornerBorderColor} fillOpacity="0.25" />
            <path d="M20 7C22 10 24 11 27 12C24 13 22 15 20 17C18 15 16 13 13 12C16 11 18 10 20 7Z" fill={cornerBorderColor} />
          </svg>
        </div>
      );
    }

    if (cornerShape === 'antique_bracket') {
      return (
        <div className={`absolute ${posClasses} pointer-events-none ${rotateClass}`}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 5H18C23 5 25 7 25 12V28" stroke={cornerBorderColor} strokeWidth="2" strokeLinecap="square" />
            <path d="M5 8H16C19 8 22 11 22 15V26" stroke={cornerBorderColor} strokeWidth="0.8" />
            <circle cx="25" cy="5" r="3" fill={cornerBorderColor} />
            <rect x="23" y="19" width="3" height="3" fill={cornerBorderColor} />
            <rect x="11" y="4" width="3" height="3" fill={cornerBorderColor} />
          </svg>
        </div>
      );
    }

    if (cornerShape === 'celestial_star') {
      return (
        <div className={`absolute ${posClasses} pointer-events-none ${rotateClass}`}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4H20C24.4 4 28 7.6 28 12V30" stroke={cornerBorderColor} strokeWidth="1.5" strokeLinecap="round" />
            <polygon 
              points="18,10 20,4 22,10 28,12 22,14 20,20 18,14 12,12" 
              fill={cornerBorderColor} 
              opacity="0.9"
            />
            <circle cx="20" cy="12" r="1.5" fill="#FFF" />
          </svg>
        </div>
      );
    }

    if (cornerShape === 'minimal_sleek') {
      return (
        <div className={`absolute ${posClasses} pointer-events-none ${rotateClass}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 3H16L21 8V22" stroke={cornerBorderColor} strokeWidth="1.75" strokeLinecap="round" />
            <circle cx="16" cy="8" r="1.5" fill={cornerBorderColor} />
          </svg>
        </div>
      );
    }

    if (cornerShape === 'andalusian_star') {
      return (
        <div className={`absolute ${posClasses} pointer-events-none ${rotateClass}`}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 5H21C24 5 27 8 27 11V30" stroke={cornerBorderColor} strokeWidth="1.75" strokeLinecap="round" />
            <rect x="14" y="8" width="10" height="10" stroke={cornerBorderColor} strokeWidth="1.2" transform="rotate(45 19 13)" fill={cornerBorderColor} fillOpacity="0.2" />
            <rect x="14" y="8" width="10" height="10" stroke={cornerBorderColor} strokeWidth="1.2" fill={cornerBorderColor} fillOpacity="0.15" />
          </svg>
        </div>
      );
    }

    // Default & Damascus Arch
    return (
      <div className={`absolute ${posClasses} pointer-events-none ${rotateClass}`}>
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 4C14 4 26 8 26 28" stroke={cornerBorderColor} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M26 12C24 10 21 8 18 7" stroke={cornerBorderColor} strokeWidth="1" strokeDasharray="1.5 1.5" />
          <circle cx="21" cy="9" r="2.5" fill={cornerBorderColor} />
        </svg>
      </div>
    );
  };

  return (
    <>
      {renderCorner('top-right')}
      {renderCorner('top-left')}
      {renderCorner('bottom-right')}
      {renderCorner('bottom-left')}
    </>
  );
};
