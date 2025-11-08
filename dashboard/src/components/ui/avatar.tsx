import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  src?: string;
  alt?: string;
  fallback?: string;
  colorClassName?: string;
}

export function Avatar({
  size = 36,
  src,
  alt,
  fallback,
  colorClassName = 'bg-[#ff6b35] text-white',
  className = '',
  ...props
}: AvatarProps) {
  const style: React.CSSProperties = { width: size, height: size };
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full overflow-hidden font-semibold ${colorClassName} ${className}`}
      style={style}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm select-none">{fallback}</span>
      )}
    </div>
  );
}
