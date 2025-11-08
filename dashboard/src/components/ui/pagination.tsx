import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  count: number;
  page: number;
  onChange: (page: number) => void;
  color?: 'primary' | 'secondary';
  size?: 'small' | 'medium';
}

export function Pagination({ count, page, onChange, color = 'primary', size = 'medium' }: PaginationProps) {
  const sizeClasses = size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (count <= maxVisible) {
      for (let i = 1; i <= count; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(count);
      } else if (page >= count - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = count - 3; i <= count; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(count);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${sizeClasses} rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
      >
        <ChevronLeft size={16} />
      </button>
      
      {getPageNumbers().map((pageNum, index) => {
        if (pageNum === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className={`${sizeClasses} text-gray-400`}>
              ...
            </span>
          );
        }
        
        const pageNumber = pageNum as number;
        const isActive = pageNumber === page;
        
        return (
          <button
            key={pageNumber}
            onClick={() => onChange(pageNumber)}
            className={`${sizeClasses} rounded-lg border transition-colors ${
              isActive
                ? color === 'primary'
                  ? 'bg-[#EE66AA] border-[#EE66AA] text-white'
                  : 'bg-gray-600 border-gray-600 text-white'
                : 'border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {pageNumber}
          </button>
        );
      })}
      
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === count}
        className={`${sizeClasses} rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

