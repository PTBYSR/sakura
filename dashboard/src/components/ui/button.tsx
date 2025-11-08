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
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    contained: {
      primary: 'bg-gradient-to-r from-[#EE66AA] to-[#8a2be2] text-white hover:opacity-90',
      secondary: 'bg-gray-700 text-white hover:bg-gray-600',
      error: 'bg-red-600 text-white hover:bg-red-700',
      success: 'bg-green-600 text-white hover:bg-green-700',
    },
    outlined: {
      primary: 'border-2 border-[#EE66AA] text-[#EE66AA] hover:bg-[#EE66AA]/10',
      secondary: 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700',
      error: 'border-2 border-red-600 text-red-400 hover:bg-red-600/10',
      success: 'border-2 border-green-600 text-green-400 hover:bg-green-600/10',
    },
    text: {
      primary: 'text-[#EE66AA] hover:bg-[#EE66AA]/10',
      secondary: 'text-gray-300 hover:bg-gray-700',
      error: 'text-red-400 hover:bg-red-600/10',
      success: 'text-green-400 hover:bg-green-600/10',
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

