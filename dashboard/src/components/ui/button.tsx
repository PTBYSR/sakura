import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export function Button({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg';
  
  const variantClasses = {
    contained: {
      primary: 'bg-gradient-to-r from-sakura-500 to-sakura-600 text-white hover:from-sakura-600 hover:to-sakura-700 hover:shadow-lg hover:shadow-sakura-500/50 active:scale-95 focus:ring-sakura-500',
      secondary: 'bg-gray-700 text-white hover:bg-gray-600 hover:shadow-lg active:scale-95 focus:ring-gray-500',
      error: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg active:scale-95 focus:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg active:scale-95 focus:ring-green-500',
    },
    outlined: {
      primary: 'border-2 border-sakura-500 text-sakura-500 hover:bg-sakura-500/10 hover:border-sakura-600 active:scale-95 focus:ring-sakura-500',
      secondary: 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 active:scale-95 focus:ring-gray-500',
      error: 'border-2 border-red-600 text-red-400 hover:bg-red-600/10 hover:border-red-500 active:scale-95 focus:ring-red-500',
      success: 'border-2 border-green-600 text-green-400 hover:bg-green-600/10 hover:border-green-500 active:scale-95 focus:ring-green-500',
    },
    text: {
      primary: 'text-sakura-500 hover:bg-sakura-500/10 hover:text-sakura-600 active:scale-95 focus:ring-sakura-500',
      secondary: 'text-gray-300 hover:bg-gray-700 hover:text-white active:scale-95 focus:ring-gray-500',
      error: 'text-red-400 hover:bg-red-600/10 hover:text-red-300 active:scale-95 focus:ring-red-500',
      success: 'text-green-400 hover:bg-green-600/10 hover:text-green-300 active:scale-95 focus:ring-green-500',
    },
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant][color]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}


