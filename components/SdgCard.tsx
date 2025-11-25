
import React from 'react';
import type { SDG } from '../types';

interface SdgCardProps {
  sdg: SDG;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const SdgCard: React.FC<SdgCardProps> = ({ sdg, isSelected, onClick, disabled = false }) => {
  const baseClasses = "rounded-lg p-3 md:p-4 cursor-pointer transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center shadow-md border-2";
  const selectedClasses = "scale-105 shadow-xl ring-4";
  const disabledClasses = "opacity-50 cursor-not-allowed";
  const hoverClasses = "hover:shadow-lg hover:scale-105";

  const ringColorStyle = { ringColor: sdg.color };
  const borderColorStyle = { borderColor: sdg.color };
  const backgroundColorStyle = isSelected ? { backgroundColor: `${sdg.color}20` } : { backgroundColor: 'white' };

  return (
    <div
      onClick={!disabled || isSelected ? onClick : undefined}
      className={`${baseClasses} ${isSelected ? selectedClasses : ''} ${disabled && !isSelected ? disabledClasses : hoverClasses}`}
      style={{ ...borderColorStyle, ...backgroundColorStyle, ...(isSelected && ringColorStyle) }}
    >
      <sdg.icon className="w-12 h-12 md:w-16 md:h-16 mb-2" style={{ color: sdg.color }} />
      <span className="text-xs md:text-sm font-medium text-gray-700">{sdg.title}</span>
    </div>
  );
};

export default SdgCard;
