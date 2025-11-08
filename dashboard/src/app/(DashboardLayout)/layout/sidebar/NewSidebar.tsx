"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Settings, HelpCircle, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navigationConfig, NavigationModule, NavigationItem } from "@/config/navigation";
import { useAgents } from "@/contexts/AgentsContext";
import { useSectionUnreadCounts } from "@/app/(DashboardLayout)/inbox/hooks/useSectionUnreadCounts";

interface NewSidebarProps {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
  isSidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

const NewSidebar: React.FC<NewSidebarProps> = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
  isSidebarCollapsed = false,
  onSidebarToggle,
}) => {
  const pathname = usePathname();
  const [isLgUp, setIsLgUp] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeModule, setActiveModule] = useState<string>("inbox");
  const { getUnreadCount, markSectionAsRead } = useSectionUnreadCounts();

  const manualModuleRef = useRef<string | null>(null);
  const lastPathnameRef = useRef<string | null>(null);
  
  useEffect(() => {
    const checkLgUp = () => {
      setIsLgUp(window.innerWidth >= 1024);
    };
    checkLgUp();
    window.addEventListener('resize', checkLgUp);
    return () => window.removeEventListener('resize', checkLgUp);
  }, []);
  
  useEffect(() => {
    if (pathname === lastPathnameRef.current) {
      return;
    }
    lastPathnameRef.current = pathname;
    
    if (!manualModuleRef.current) {
      const matchingModule = navigationConfig.find(module => {
        if (pathname?.startsWith(module.href)) {
          return true;
        }
        return module.children?.some(child => pathname?.startsWith(child.href));
      });

      if (matchingModule && matchingModule.id !== activeModule) {
        setActiveModule(matchingModule.id);
      }
    }
  }, [pathname, activeModule]);

  const sidebarWidth = "270px";
  const iconBarWidth = "60px";
  const currentSidebarWidth = isSidebarCollapsed ? iconBarWidth : sidebarWidth;
  const sidebarWidthNum = parseInt(sidebarWidth);
  const iconBarWidthNum = parseInt(iconBarWidth);

  const handleToggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
    manualModuleRef.current = moduleId;
    
    setTimeout(() => {
      if (manualModuleRef.current === moduleId) {
        manualModuleRef.current = null;
      }
    }, 2000);
  };

  const isItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id) || (!item.collapsible && item.children && item.children.length > 0);
    const isActive = isItemActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isLabelItem = hasChildren && !item.collapsible;
    const IconComponent = item.icon;
    const itemCount = getUnreadCount(item.id);
    const isTopLevelChild = level === 0;
    const effectiveLevel = isTopLevelChild ? 1 : level;

    if (isLabelItem) {
      const labelClasses = level === 0 ? 'mt-10 mb-6 pt-8' : 'mt-0 mb-6 pt-4';
      return (
        <React.Fragment key={item.id}>
          <div className={`${labelClasses} px-4`}>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              {item.title}
            </p>
          </div>
          {hasChildren && (
            <div className="mb-4">
              {item.children!.map((child) => renderNavigationItem(child, level + 1))}
            </div>
          )}
        </React.Fragment>
      );
    }

    const paddingClass = effectiveLevel === 0 ? 'py-3' : 'py-2.5';
    const bgClass = isActive ? 'bg-[#2a2a2a]' : 'bg-transparent';
    const hoverBgClass = isActive ? 'hover:bg-[#2a2a2a]' : 'hover:bg-[#1a1a1a]';
    const iconColorClass = effectiveLevel === 0 ? 'text-white' : (isActive ? 'text-white' : 'text-gray-400');
    const iconOpacityClass = effectiveLevel === 0 ? 'opacity-100' : (isActive ? 'opacity-100' : 'opacity-70');
    const textSizeClass = effectiveLevel === 0 ? 'text-sm' : 'text-xs';
    const fontWeightClass = isActive 
      ? (effectiveLevel === 0 ? 'font-semibold' : 'font-medium')
      : (effectiveLevel === 0 ? 'font-medium' : 'font-normal');
    const textColorClass = effectiveLevel === 0 ? 'text-white' : (isActive ? 'text-white' : 'text-gray-400');
    
    const listItemContent = (
      <div
        className={`flex items-center ${paddingClass} px-4 rounded-lg mb-1 ${bgClass} text-white cursor-pointer transition-all duration-200 ${hoverBgClass}`}
        onClick={(e) => {
          if (item.collapsible && hasChildren) {
            e.preventDefault();
            e.stopPropagation();
            handleToggleExpand(item.id);
          }
        }}
      >
        <div className="flex items-center flex-1">
          <div className={`mr-3 flex items-center ${iconColorClass} ${iconOpacityClass}`}>
            <IconComponent 
              size={effectiveLevel === 0 ? 18 : 16} 
              strokeWidth={1.5}
            />
          </div>
          <p className={`${textSizeClass} ${fontWeightClass} flex-1 ${textColorClass} leading-snug`}>
            {item.title}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {((item.id === 'human-chats' || item.id === 'escalated-chats' || item.id === 'active-chats')) && itemCount > 0 && (
            <p className="text-xs text-gray-500 min-w-[20px] text-right">
              {itemCount}
            </p>
          )}
          {item.collapsible && hasChildren && (
            isExpanded ? 
              <ChevronUp className="text-gray-500 w-4 h-4" /> : 
              <ChevronDown className="text-gray-500 w-4 h-4" />
          )}
        </div>
      </div>
    );

    const isCollapsibleParent = item.collapsible && hasChildren;

    return (
      <React.Fragment key={item.id}>
        {isCollapsibleParent ? (
          listItemContent
        ) : item.external ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline text-inherit"
          >
            {listItemContent}
          </a>
        ) : (
          <Link 
            href={item.href} 
            className="no-underline text-inherit"
            onClick={() => {
              if (item.id === 'human-chats' || item.id === 'escalated-chats' || item.id === 'active-chats') {
                markSectionAsRead(item.id);
              }
            }}
          >
            {listItemContent}
          </Link>
        )}
        
        {hasChildren && (
          item.collapsible ? (
            <div className={`${isExpanded ? 'block' : 'hidden'} pl-4`}>
                {item.children!.map((child) => renderNavigationItem(child, level + 1))}
            </div>
          ) : (
            <div>
              {item.children!.map((child) => renderNavigationItem(child, level + 1))}
            </div>
          )
        )}
      </React.Fragment>
    );
  };

  const renderIconBar = () => (
    <div className="w-[60px] h-full bg-black flex flex-col items-center pt-4 pb-4 gap-1 relative overflow-visible z-[1301]">
      <div className="mb-4 flex items-center justify-center">
        <Image
          src="/images/logos/nav-logo.svg"
          alt="Sakura"
          width={120}
          height={32}
          priority
        />
      </div>

      {navigationConfig.map((module) => {
        const IconComponent = module.icon;
        const isActive = activeModule === module.id;
        const iconBarClasses = isActive 
          ? 'bg-[#2a2a2a] text-white shadow-lg hover:bg-[#2a2a2a]'
          : 'bg-transparent text-gray-500 hover:bg-[#1a1a1a]';
        
        return (
          <div
            key={module.id} 
            title={module.tooltip} 
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBarClasses} cursor-pointer transition-all duration-200 hover:text-white`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleModuleClick(module.id);
              }}
            >
            <IconComponent size={20} strokeWidth={1.5} />
          </div>
        );
      })}

      <div className="flex-1" />
      
      <Link href="/settings" className="no-underline text-inherit" title="Settings">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isItemActive("/settings") 
              ? 'bg-[#2a2a2a] text-white hover:bg-[#2a2a2a]' 
              : 'bg-transparent text-gray-500 hover:bg-[#1a1a1a]'
          } cursor-pointer transition-all duration-200 hover:text-white`}
        >
          <Settings size={20} strokeWidth={1.5} />
        </div>
      </Link>

      <div
        title="Help & Support"
        className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer transition-all duration-200 hover:bg-[#1a1a1a] hover:text-white"
      >
        <HelpCircle size={20} strokeWidth={1.5} />
      </div>

      <Link href="/settings/account-settings" className="no-underline text-inherit" title="Account Settings">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white cursor-pointer relative mt-2 transition-all duration-200 hover:bg-blue-700 after:content-[''] after:absolute after:-top-0.5 after:-right-0.5 after:w-3 after:h-3 after:rounded-full after:bg-green-500 after:border-2 after:border-black">
          <User size={20} strokeWidth={1.5} />
        </div>
        </Link>
    </div>
  );

  const renderSecondaryNavigation = () => {
    const activeModuleConfig = navigationConfig.find(m => m.id === activeModule);
    if (!activeModuleConfig) {
      const defaultModule = navigationConfig[0];
      if (!defaultModule) return null;
      return (
        <div className={`flex-1 overflow-auto bg-black ${
          isSidebarCollapsed ? 'hidden' : 'flex'
        } flex-col [&::-webkit-scrollbar]:w-[7px] [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-[15px]`}>
          <div className="p-4">
            <h6 className="font-bold text-white text-base mb-6">
              {defaultModule.title}
            </h6>
            <div>
              {defaultModule.children.map((item) => renderNavigationItem(item))}
            </div>
          </div>
        </div>
      );
    }

    const allChildren = activeModuleConfig.children;

    return (
      <div className={`flex-1 overflow-auto bg-black ${
        isSidebarCollapsed ? 'hidden' : 'flex'
      } flex-col [&::-webkit-scrollbar]:w-[7px] [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-[15px]`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h6 className="font-bold text-white text-base">
              {activeModuleConfig.title}
            </h6>
          </div>

          <div>
            {allChildren.map((item) => renderNavigationItem(item))}
          </div>
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex h-screen w-full overflow-hidden">
      {renderIconBar()}
      {renderSecondaryNavigation()}
    </div>
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLgUp || !mounted) {
    return (
      <>
        {onSidebarToggle && (
        <div
          className="fixed top-1/2 -translate-y-1/2 z-[1400] w-7 h-7 rounded-full bg-[#2a2a2a] border-2 border-gray-700 flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 hover:bg-[#3a3a3a] hover:scale-110 hover:shadow-xl active:scale-95"
            style={{
              left: isSidebarCollapsed ? `${iconBarWidthNum - 14}px` : `${sidebarWidthNum - 14}px`,
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onSidebarToggle) {
                onSidebarToggle();
              }
            }}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="text-white w-[18px] h-[18px]" />
            ) : (
              <ChevronLeft className="text-white w-[18px] h-[18px]" />
            )}
          </div>
        )}
        <div
          className="w-[270px] flex-shrink-0 fixed left-0 top-0 h-screen z-[1300] overflow-visible pointer-events-none"
        >
          <div
            className="fixed top-0 left-0 h-screen z-[1300] pointer-events-auto border-r border-gray-700 transition-all duration-300"
            style={{
                  width: currentSidebarWidth,
            }}
          >
            {sidebarContent}
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={`fixed inset-y-0 left-0 z-[1300] w-[270px] bg-black transform transition-transform duration-300 ease-in-out ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:hidden`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onSidebarClose(e);
        }
      }}
    >
      {sidebarContent}
    </div>
  );
};

export default NewSidebar;
