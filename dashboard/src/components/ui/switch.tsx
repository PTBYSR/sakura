import React from 'react';

type SwitchProps = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
};

export function Switch({ checked, onChange, disabled, size = 'md', className = '' }: SwitchProps) {
  const sizes = size === 'sm'
    ? { track: 'w-9 h-5', thumb: 'w-4 h-4 translate-x-0.5', thumbChecked: 'translate-x-4' }
    : { track: 'w-11 h-6', thumb: 'w-5 h-5 translate-x-0.5', thumbChecked: 'translate-x-5' };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none ${sizes.track} ${checked ? 'bg-green-600' : 'bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <span
        className={`inline-block rounded-full bg-white transition-transform duration-200 ${sizes.thumb} ${checked ? sizes.thumbChecked : ''}`}
      />
    </button>
  );
}
