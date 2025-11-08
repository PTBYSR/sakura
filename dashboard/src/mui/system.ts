import React from 'react';

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export const Stack: React.FC<React.HTMLAttributes<HTMLDivElement> & { direction?: 'row'|'column'; spacing?: number }> = ({ className, direction='column', spacing=2, ...rest }) => {
  const cls = cn('flex', direction==='row' ? 'flex-row' : 'flex-col', spacing ? `gap-${Math.min(10, spacing)}` : '', className);
  return React.createElement('div', { className: cls, ...rest });
};

export function styled<TProps extends object>(Comp: React.ComponentType<TProps>) {
  return (styles: any) => {
    const Styled: React.FC<any> = (props) => React.createElement(Comp as any, props as any);
    return Styled;
  };
}
