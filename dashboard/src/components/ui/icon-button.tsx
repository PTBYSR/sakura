import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid';
}

export function IconButton({
  size = 'md',
  variant = 'ghost',
  className = '',
  children,
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3',
  }[size];

  const variantClasses = {
    ghost: 'bg-transparent hover:bg-white/10 text-gray-200',
    solid: 'bg-gray-700 hover:bg-gray-600 text-white',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full transition-colors ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
