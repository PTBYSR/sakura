import React from 'react';

interface ChipProps {
  label?: string;
  children?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
}

export function Chip({
  label,
  children,
  color = 'primary',
  variant = 'filled',
  size = 'medium',
  className = '',
  style,
  icon,
}: ChipProps) {
  const colorClasses = {
    primary: variant === 'filled' 
      ? 'bg-sakura-500/20 text-sakura-500 border-sakura-500' 
      : 'border-sakura-500 text-sakura-500',
    secondary: variant === 'filled'
      ? 'bg-gray-700 text-gray-300 border-gray-600'
      : 'border-gray-600 text-gray-300',
    success: variant === 'filled'
      ? 'bg-green-600/20 text-green-400 border-green-500'
      : 'border-green-500 text-green-400',
    error: variant === 'filled'
      ? 'bg-red-600/20 text-red-400 border-red-500'
      : 'border-red-500 text-red-400',
    warning: variant === 'filled'
      ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500'
      : 'border-yellow-500 text-yellow-400',
    info: variant === 'filled'
      ? 'bg-blue-600/20 text-blue-400 border-blue-500'
      : 'border-blue-500 text-blue-400',
  };
  
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs h-5',
    medium: 'px-3 py-1 text-sm h-7',
    large: 'px-4 py-1.5 text-base h-8',
  };
  
  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full font-medium
        ${colorClasses[color]}
        ${sizeClasses[size]}
        ${variant === 'outlined' ? 'border' : ''}
        ${className}
      `}
      style={style}
    >
      {icon && <span className="mr-1 flex items-center">{icon}</span>}
      {children || label}
    </span>
  );
}

