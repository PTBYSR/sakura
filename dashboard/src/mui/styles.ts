import React from 'react';

// Minimal theme shape used in a few places
export function createTheme<T extends object = any>(overrides?: T): any {
  const base = {
    palette: {
      primary: { main: '#EE66AA' },
      secondary: { main: '#8a2be2' },
      text: { primary: '#ffffff', secondary: '#B0BEC5' },
    },
    shadows: Array.from({ length: 25 }, (_, i) => (i === 8 ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none')),
    breakpoints: {
      up: (key: 'lg'|'md'|'sm'|'xl'|'xs'|number) => {
        const map: any = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 };
        const px = typeof key === 'number' ? key : (map[key] ?? 1024);
        return `(min-width: ${px}px)`;
      },
    },
  };
  return { ...base, ...(overrides as object) };
}

const defaultTheme = createTheme();

export function useTheme() {
  return defaultTheme;
}

export const ThemeProvider: React.FC<{ theme?: any; children: React.ReactNode }> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

// Very naive styled helper that just passes className through
export function styled<TProps extends object>(Comp: React.ComponentType<TProps>) {
  return (styles: any) => {
    const Styled: React.FC<any> = (props) => React.createElement(Comp as any, props as any);
    return Styled;
  };
}

