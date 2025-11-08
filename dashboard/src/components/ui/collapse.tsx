import React from 'react';

interface CollapseProps {
  in: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Collapse({ in: open, children, className = '' }: CollapseProps) {
  return (
    <div className={`transition-all duration-200 overflow-hidden ${open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} ${className}`}>
      {children}
    </div>
  );
}
