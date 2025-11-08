import React from 'react';
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  fullWidth?: boolean;
};

const CustomTextField: React.FC<InputProps> = ({ className, fullWidth = true, ...props }) => {
  return (
    <input
      {...props}
      className={`
        ${fullWidth ? 'w-full' : ''}
        rounded-md border border-gray-300 dark:border-gray-700
        bg-white dark:bg-dark-surface/80
        px-3 py-2 text-sm text-gray-900 dark:text-white
        placeholder:text-gray-500 dark:placeholder:text-gray-400
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
        disabled:cursor-not-allowed disabled:opacity-60
        ${className || ''}
      `}
    />
  );
};

export default CustomTextField;
