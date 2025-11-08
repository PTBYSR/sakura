import React, { useEffect, useMemo, useState } from 'react';
import { Button as TWButton } from '@/components/ui/button';

// Utility to merge classNames
function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

// List components
export const List: React.FC<React.HTMLAttributes<HTMLUListElement>> = ({ className, ...rest }) => (
  <ul className={cn('flex flex-col', className)} {...rest} />
);

export const ListItem: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = ({ className, ...rest }) => (
  <li className={cn('list-none', className)} {...rest} />
);

export const ListItemButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }>
  = ({ className, selected, ...rest }) => (
  <button
    className={cn('w-full text-left px-3 py-2 rounded-md hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#EE66AA]/40',
      selected ? 'bg-white/10' : '', className)}
    {...rest}
  />
);

export const ListItemIcon: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div className={cn('mr-3 text-gray-300 flex items-center justify-center w-6', className)} {...rest} />
);

export const ListItemText: React.FC<{ primary?: React.ReactNode; secondary?: React.ReactNode; className?: string }>
  = ({ primary, secondary, className }) => (
  <div className={cn('min-w-0', className)}>
    {primary ? <div className="text-sm text-white truncate">{primary}</div> : null}
    {secondary ? <div className="text-xs text-gray-400 truncate">{secondary}</div> : null}
  </div>
);

export const Divider: React.FC<React.HTMLAttributes<HTMLHRElement> & { orientation?: 'horizontal'|'vertical' }>
  = ({ className, orientation='horizontal', ...rest }) => (
  orientation === 'vertical'
    ? <div className={cn('w-px self-stretch bg-gray-800', className)} {...(rest as any)} />
    : <hr className={cn('border-gray-800', className)} {...rest} />
);

// CircularProgress (spinner)
export const CircularProgress: React.FC<{ size?: number; className?: string }> = ({ size = 40, className }) => (
  <span
    className={cn('inline-block animate-spin rounded-full border-4 border-gray-300 border-t-[#EE66AA]', className)}
    style={{ width: size, height: size }}
  />
);

// Alert
export const Alert: React.FC<{ severity?: 'error'|'warning'|'info'|'success'; onClose?: () => void; children: React.ReactNode; className?: string }>
  = ({ severity='info', onClose, children, className }) => {
  const color = severity === 'error' ? 'bg-red-900/30 border-red-800/40 text-red-200'
    : severity === 'warning' ? 'bg-yellow-900/30 border-yellow-800/40 text-yellow-200'
    : severity === 'success' ? 'bg-green-900/30 border-green-800/40 text-green-200'
    : 'bg-blue-900/30 border-blue-800/40 text-blue-200';
  return (
    <div className={cn('rounded-md border p-3', color, className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm">{children}</div>
        {onClose && (
          <button onClick={onClose} className="opacity-80 hover:opacity-100">×</button>
        )}
      </div>
    </div>
  );
};

// Snackbar (very light)
export const Snackbar: React.FC<{ open: boolean; autoHideDuration?: number; onClose?: () => void; children: React.ReactNode; anchorOrigin?: { vertical: 'top'|'bottom'; horizontal: 'left'|'center'|'right' } }>
  = ({ open, autoHideDuration, onClose, children, anchorOrigin }) => {
  const pos = anchorOrigin ?? { vertical: 'bottom', horizontal: 'left' };
  if (!open) return null;
  if (autoHideDuration) {
    // fire and forget timeout
    setTimeout(() => { onClose?.(); }, autoHideDuration);
  }
  return (
    <div className={cn('fixed z-50 p-4',
      pos.vertical === 'bottom' ? 'bottom-4' : 'top-4',
      pos.horizontal === 'left' ? 'left-4' : pos.horizontal === 'right' ? 'right-4' : 'left-1/2 -translate-x-1/2'
    )}>
      <div className="rounded-md bg-[#1e1e1e] border border-gray-700 p-3 text-white shadow-lg">
        {children}
      </div>
    </div>
  );
};

// Select & MenuItem (basic HTML select)
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { fullWidth?: boolean }> = ({ className, fullWidth, children, ...rest }) => (
  <select className={cn('rounded-md border border-gray-700 bg-[#1e1e1e] px-3 py-2 text-sm', fullWidth ? 'w-full' : '', className)} {...rest}>
    {children}
  </select>
);
export const MenuItem: React.FC<React.OptionHTMLAttributes<HTMLOptionElement>> = (props) => <option {...props} />;

// Stack convenience
export const Stack: React.FC<React.HTMLAttributes<HTMLDivElement> & { direction?: 'row'|'column'; spacing?: number }> = ({ className, direction='column', spacing=2, ...rest }) => (
  <div className={cn('flex', direction==='row' ? 'flex-row' : 'flex-col', spacing ? `gap-${Math.min(10, spacing)}` : '', className)} {...rest} />
);

// Box
export const Box = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { sx?: any }>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props}>{children}</div>
  )
);
Box.displayName = 'Box';

// Typography
type TypographyProps = React.HTMLAttributes<HTMLElement> & {
  variant?: 'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'subtitle1'|'subtitle2'|'body1'|'body2'|'caption';
  component?: any;
};
export const Typography: React.FC<TypographyProps> = ({ variant='body1', component, className, children, ...rest }) => {
  const Tag: any = component ?? (
    variant === 'h1' ? 'h1' :
    variant === 'h2' ? 'h2' :
    variant === 'h3' ? 'h3' :
    variant === 'h4' ? 'h4' :
    variant === 'h5' ? 'h5' :
    variant === 'h6' ? 'h6' :
    variant === 'caption' ? 'span' : 'p'
  );
  return <Tag className={className} {...rest}>{children}</Tag>;
};

// Container
export const Container: React.FC<React.HTMLAttributes<HTMLDivElement> & { maxWidth?: 'sm'|'md'|'lg'|'xl'|false } > = ({ className, children, maxWidth='lg', ...rest }) => {
  const max = maxWidth === 'sm' ? 'max-w-screen-sm' : maxWidth === 'md' ? 'max-w-screen-md' : maxWidth === 'lg' ? 'max-w-screen-lg' : maxWidth === 'xl' ? 'max-w-screen-xl' : 'max-w-none';
  return <div className={cn('mx-auto px-4', max, className)} {...rest}>{children}</div>;
};

// Grid (very light shim)
type GridProps = React.HTMLAttributes<HTMLDivElement> & {
  container?: boolean; item?: boolean; spacing?: number; justifyContent?: string; alignItems?: string;
  xs?: number; sm?: number; md?: number; lg?: number; xl?: number;
  display?: string;
  size?: Partial<{ xs:number; sm:number; md:number; lg:number; xl:number }>;
};
export const Grid: React.FC<GridProps> = ({ className, children, container, item, spacing, justifyContent, alignItems, size, ...rest }) => {
  const spacingCls = spacing ? `gap-${Math.min(10, spacing)}` : '';
  const gridCls = container ? 'grid' : '';
  const colsCls = container ? 'grid-cols-12' : '';
  const span = size?.lg ?? size?.md ?? size?.sm ?? size?.xs;
  const itemSpan = item && span ? `col-span-${Math.min(12, Math.max(1, span))}` : '';
  return <div className={cn(gridCls, colsCls, spacingCls, itemSpan, className)} {...rest}>{children}</div>;
};

// Button
type Color = 'primary'|'secondary'|'error'|'success';
type Variant = 'contained'|'outlined'|'text';
export const Button: React.FC<React.ComponentProps<typeof TWButton> & { color?: Color; variant?: Variant; fullWidth?: boolean; size?: 'small'|'medium'|'large'; startIcon?: React.ReactNode; endIcon?: React.ReactNode }> = ({ className, fullWidth, size='medium', startIcon, endIcon, children, ...rest }) => {
  const sizeClass = size === 'small' ? 'px-3 py-1.5 text-sm' : size === 'large' ? 'px-6 py-3 text-lg' : '';
  return (
    <TWButton className={cn('inline-flex items-center gap-2', fullWidth ? 'w-full' : '', sizeClass, className)} {...rest}>
      {startIcon ? <span className="inline-flex items-center">{startIcon}</span> : null}
      {children}
      {endIcon ? <span className="inline-flex items-center">{endIcon}</span> : null}
    </TWButton>
  );
};

// IconButton
export const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, children, ...rest }) => (
  <button className={cn('inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10', className)} {...rest}>
    {children}
  </button>
);

// Avatar (basic)
export const Avatar: React.FC<React.HTMLAttributes<HTMLDivElement> & { src?: string; alt?: string } > = ({ className, children, ...rest }) => (
  <div className={cn('inline-flex items-center justify-center rounded-full bg-gray-500 text-white w-10 h-10', className)} {...rest}>
    {children}
  </div>
);

// Badge (basic)
export const Badge: React.FC<{ badgeContent?: React.ReactNode; color?: 'error'|'primary'|'secondary'; className?: string; children: React.ReactNode }> = ({ badgeContent, className, children }) => (
  <div className={cn('relative inline-block', className)}>
    {children}
    {badgeContent !== undefined && (
      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
        {badgeContent}
      </span>
    )}
  </div>
);

// Collapse (simple)
export const Collapse: React.FC<{ in: boolean; children: React.ReactNode }> = ({ in: open, children }) => (
  <div className={cn('transition-[max-height,opacity] duration-200', open ? 'opacity-100' : 'opacity-0 hidden')}>
    {children}
  </div>
);

// Card (basic)
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { variant?: 'outlined'|'elevation' }>
  = ({ className, variant, ...rest }) => (
  <div className={cn('rounded-lg bg-[#1e1e1e] border border-gray-800', variant==='outlined' ? 'border-dashed' : '')} {...rest} />
);

export const CardHeader: React.FC<{
  avatar?: React.ReactNode;
  action?: React.ReactNode;
  title?: React.ReactNode;
  subheader?: React.ReactNode;
  className?: string;
}> = ({ avatar, action, title, subheader, className }) => (
  <div className={cn('px-6 py-4 border-b border-gray-800 flex items-start justify-between gap-3', className)}>
    <div className="flex items-center gap-3 min-w-0">
      {avatar ? <div className="shrink-0">{avatar}</div> : null}
      <div className="min-w-0">
        {title ? <div className="text-base font-semibold truncate">{title}</div> : null}
        {subheader ? <div className="text-xs text-gray-400 truncate">{subheader}</div> : null}
      </div>
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div className={cn('px-6 py-4', className)} {...rest} />
);

export const CardActions: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div className={cn('px-6 py-3 border-t border-gray-800 flex items-center gap-2', className)} {...rest} />
);

// Drawer (very light)
interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  anchor?: 'left'|'right';
  open: boolean;
  onClose?: (e: any) => void;
  variant?: 'permanent'|'temporary';
  slotProps?: { paper?: { sx?: any } };
}
export const Drawer: React.FC<DrawerProps> = ({ anchor='left', open, onClose, variant='temporary', children }) => {
  if (variant === 'permanent') {
    return open ? (
      <div className={cn('h-full', anchor === 'left' ? 'left-0' : 'right-0')}>
        {children}
      </div>
    ) : null;
  }
  return (
    <>
      {/* backdrop */}
      <div onClick={onClose as any} className={cn('fixed inset-0 bg-black/50 transition-opacity z-40', open ? 'opacity-100' : 'opacity-0 pointer-events-none')} />
      <div className={cn('fixed top-0 bottom-0 w-[270px] bg-[#1e1e1e] z-50 transition-transform', anchor==='left' ? (open ? 'left-0 translate-x-0' : '-translate-x-full -left-full') : (open ? 'right-0 translate-x-0' : 'translate-x-full -right-full'))}>
        {children}
      </div>
    </>
  );
};

// TextField (basic)
interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
  helperText?: string;
  InputProps?: { endAdornment?: React.ReactNode };
}
export const TextField: React.FC<TextFieldProps> = ({ className, fullWidth=true, helperText, InputProps, ...rest }) => (
  <div className={cn(fullWidth ? 'w-full' : '')}>
    <div className="relative">
      <input {...rest} className={cn('w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-surface/80 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500', className)} />
      {InputProps?.endAdornment && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {InputProps.endAdornment}
        </div>
      )}
    </div>
    {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
  </div>
);

// InputAdornment (simple)
export const InputAdornment: React.FC<{ position?: 'start'|'end'; children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span className={cn('inline-flex items-center gap-1', className)}>{children}</span>
);

// Paper (simple)
export const Paper: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div className={cn('bg-[#1e1e1e] rounded-lg', className)} {...rest} />
);

// Dialog (very light)
export const Dialog: React.FC<{ open: boolean; onClose?: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => (
  open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-[#202024] border border-gray-800 p-4 text-white">
        {children}
      </div>
    </div>
  ) : null
);
export const DialogTitle: React.FC<{ children: React.ReactNode }>=({ children }) => (
  <div className="text-lg font-semibold mb-2">{children}</div>
);
export const DialogContent: React.FC<{ children: React.ReactNode }>=({ children }) => (
  <div className="mb-2 text-gray-200">{children}</div>
);
export const DialogActions: React.FC<{ children: React.ReactNode }>=({ children }) => (
  <div className="mt-4 flex justify-end gap-2">{children}</div>
);
export const DialogContentText: React.FC<{ children: React.ReactNode }>=({ children }) => (
  <p className="text-sm text-gray-300">{children}</p>
);

// Tooltip (noop simplified)
export const Tooltip: React.FC<{ title: React.ReactNode; children: React.ReactNode }> = ({ children }) => <>{children}</>;

// Switch (basic)
export const Switch: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <label className="inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" {...props} />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EE66AA] relative" />
  </label>
);

// FormControlLabel (simple)
export const FormControlLabel: React.FC<{ control: React.ReactNode; label: React.ReactNode; className?: string }> = ({ control, label, className }) => (
  <label className={cn('inline-flex items-center gap-2', className)}>
    {control}
    <span>{label}</span>
  </label>
);

// Checkbox
export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#EE66AA] focus:ring-[#EE66AA]" {...props} />
);

// FormGroup
export const FormGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('flex flex-col gap-2', className)}>{children}</div>
);

// ToggleButton, ToggleButtonGroup (simplified)
export const ToggleButtonGroup: React.FC<{ value?: any; onChange?: (e:any, v:any)=>void; exclusive?: boolean; className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cn('inline-flex rounded-md border border-gray-700', className)}>{children}</div>
);
export const ToggleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }> = ({ className, selected, ...rest }) => (
  <button className={cn('px-3 py-1 text-sm hover:bg-white/10', selected && 'bg-white/10', className)} {...rest} />
);

// useMediaQuery
export function useMediaQuery(queryInput: any): boolean {
  const query = typeof queryInput === 'string' ? queryInput : '(min-width: 1024px)';
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    listener();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
}

export default {};
