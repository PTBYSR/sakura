import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export function Modal({ open, onClose, title, children, maxWidth = 'md', fullWidth = false }: ModalProps) {
  if (!open) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-[#1e1e1e] border border-gray-700 rounded-lg shadow-lg w-full ${fullWidth ? 'max-w-full' : maxWidthClasses[maxWidth]}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h6 className="text-lg font-semibold text-white">{title}</h6>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}


