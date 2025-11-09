import React from 'react';

type DivProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>;

interface BadgeProps extends DivProps {
  content?: number | string;
  invisible?: boolean;
}

const formatContent = (content: number | string) => {
  if (typeof content === 'number') {
    if (content <= 0) return null;
    return content > 99 ? '99+' : content;
  }

  if (typeof content === 'string') {
    const trimmed = content.trim();
    return trimmed.length === 0 ? null : trimmed;
  }

  return null;
};

export function Badge({ content, invisible, className = '', children, ...props }: BadgeProps) {
  const displayContent = content !== undefined && content !== null ? formatContent(content) : null;
  return (
    <div className={`relative inline-block ${className}`} {...props}>
      {children}
      {!invisible && displayContent && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
          {displayContent}
        </span>
      )}
    </div>
  );
}
