import React from 'react';

type DivProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>;

interface BadgeProps extends DivProps {
  content?: number | string;
  invisible?: boolean;
}

export function Badge({ content, invisible, className = '', children, ...props }: BadgeProps) {
  return (
    <div className={`relative inline-block ${className}`} {...props}>
      {children}
      {!invisible && content !== undefined && content !== null && content !== 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] rounded-full bg-red-600 text-white flex items-center justify-center">
          {content}
        </span>
      )}
    </div>
  );
}
