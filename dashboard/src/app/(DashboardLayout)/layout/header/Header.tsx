"use client";
import React from 'react';
import { Bell, Menu } from 'lucide-react';
import Profile from './Profile';

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  return (
    <header className="sticky top-0 z-[1200] bg-[#1e1e1e] border-b border-gray-700 backdrop-blur-sm shadow-none min-h-[70px] flex items-center">
      <div className="w-full flex items-center px-4 py-3 text-gray-300">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          aria-label="menu"
        >
          <Menu width={20} height={20} />
        </button>

        <div className="flex-1" />

        <button
          className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          aria-label="show notifications"
          aria-controls="msgs-menu"
          aria-haspopup="true"
        >
          <Bell size={21} strokeWidth={1.5} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#EE66AA] rounded-full border-2 border-[#1e1e1e]" />
        </button>

        <Profile />
      </div>
    </header>
  );
};

export default Header;
