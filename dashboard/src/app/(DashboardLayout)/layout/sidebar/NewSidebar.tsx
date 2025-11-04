"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  useMediaQuery,
  Typography,
  Divider,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import {
  IconSettings,
  IconHelp,
  IconUser,
} from "@tabler/icons-react";
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
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  // Initialize with all non-collapsible items expanded
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeModule, setActiveModule] = useState<string>("inbox");
  const { getUnreadCount, markSectionAsRead } = useSectionUnreadCounts();

  // Track if user manually clicked a module (prevents pathname from overriding)
  const manualModuleRef = useRef<string | null>(null);
  const lastPathnameRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Skip if pathname hasn't actually changed (prevents unnecessary updates)
    if (pathname === lastPathnameRef.current) {
      return;
    }
    lastPathnameRef.current = pathname;
    
    // Only auto-update if user hasn't manually clicked a module recently
    if (!manualModuleRef.current) {
      // Find which module matches the current pathname
      const matchingModule = navigationConfig.find(module => {
        // Check if pathname starts with module href
        if (pathname?.startsWith(module.href)) {
          return true;
        }
        // Also check if any child matches
        return module.children?.some(child => pathname?.startsWith(child.href));
      });

      // Only update if the matching module is different from the current active module
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

  const scrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '7px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#eff2f7',
      borderRadius: '15px',
    },
  };

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
    // Set the module immediately
    setActiveModule(moduleId);
    // Mark this as manually set to prevent pathname from overriding
    manualModuleRef.current = moduleId;
    
    // Clear the manual flag after a delay to allow pathname-based updates when navigating to other modules
    // This allows the user to switch modules and then navigate within, but also allows pathname to update when going to a different module
    setTimeout(() => {
      // Only clear if we're still on the same module (user hasn't clicked another)
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

    // Check if this is a label item (any item with children that is not collapsible)
    const isLabelItem = hasChildren && !item.collapsible;

    const IconComponent = item.icon;

    // Get unread count for this section
    const itemCount = getUnreadCount(item.id);

    // If it's a label item, render as a subtle label
    if (isLabelItem) {
      return (
        <React.Fragment key={item.id}>
          <Box
            sx={{
              mt: level === 0 ? 2.5 : 0,
              mb: 1.5,
              px: 2,
              pt: level === 0 ? 2 : 1,
            }}
          >
            <Typography
              sx={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#555",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              {item.title}
            </Typography>
          </Box>
          {hasChildren && (
            <Box sx={{ mb: 1 }}>
              {item.children!.map((child) => renderNavigationItem(child, level + 1))}
            </Box>
          )}
        </React.Fragment>
      );
    }

    // Determine if this is a top-level child (direct child of a module, not nested under a label)
    // All direct children of modules should use level 1 styling for consistency
    const isTopLevelChild = level === 0;
    const effectiveLevel = isTopLevelChild ? 1 : level; // Treat top-level children as level 1 for styling
    
    const listItemContent = (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          py: effectiveLevel === 0 ? 1.5 : 1.25,
          px: 2,
          borderRadius: 2,
          mb: 0.5,
          backgroundColor: isActive ? "#2a2a2a" : "transparent",
          color: "white",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: isActive ? "#2a2a2a" : "#1a1a1a",
          },
        }}
        onClick={(e) => {
          // For collapsible items with children, toggle accordion (prevent navigation)
          if (item.collapsible && hasChildren) {
            e.preventDefault();
            e.stopPropagation();
            handleToggleExpand(item.id);
          }
        }}
      >
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <Box 
            sx={{ 
              mr: 2, 
              display: "flex", 
              alignItems: "center",
              color: effectiveLevel === 0 ? "white" : (isActive ? "#fff" : "#b0b0b0"),
              opacity: effectiveLevel === 0 ? 1 : (isActive ? 1 : 0.7),
            }}
          >
            <IconComponent 
              size={effectiveLevel === 0 ? 18 : 16} 
              stroke={1.5}
            />
          </Box>
          <Typography
            sx={{
              fontSize: effectiveLevel === 0 ? "14px" : "13px",
              fontWeight: isActive ? (effectiveLevel === 0 ? 600 : 500) : (effectiveLevel === 0 ? 500 : 400),
              flex: 1,
              color: effectiveLevel === 0 ? "white" : (isActive ? "#fff" : "#b0b0b0"),
              lineHeight: 1.4,
            }}
          >
            {item.title}
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Only show count for specific sections and only if count > 0 */}
          {((item.id === 'human-chats' || item.id === 'escalated-chats' || item.id === 'active-chats')) && itemCount > 0 && (
            <Typography
              sx={{
                fontSize: "12px",
                color: "#8a8a8a",
                minWidth: "20px",
                textAlign: "right",
              }}
            >
              {itemCount}
            </Typography>
          )}
          {item.collapsible && hasChildren && (
            isExpanded ? 
              <ExpandLess sx={{ color: "#8a8a8a", fontSize: "16px" }} /> : 
              <ExpandMore sx={{ color: "#8a8a8a", fontSize: "16px" }} />
          )}
        </Box>
      </Box>
    );

    // For collapsible items with children, don't wrap in Link (only toggle accordion)
    const isCollapsibleParent = item.collapsible && hasChildren;

    return (
      <React.Fragment key={item.id}>
        {isCollapsibleParent ? (
          // Collapsible parent: Just render the content without Link
          listItemContent
        ) : item.external ? (
          // External link
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {listItemContent}
          </a>
        ) : (
          // Regular navigation item - mark as read on click
          <Link 
            href={item.href} 
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={() => {
              // Mark section as read when clicked (for sections that show counts)
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
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 2 }}>
                {item.children!.map((child) => renderNavigationItem(child, level + 1))}
              </Box>
            </Collapse>
          ) : (
            // Non-collapsible items: always show children without Collapse animation
            <Box>
              {item.children!.map((child) => renderNavigationItem(child, level + 1))}
            </Box>
          )
        )}
      </React.Fragment>
    );
  };

  const renderIconBar = () => (
    <Box
      sx={{
        width: iconBarWidth,
        height: "100%",
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 2,
        pb: 2,
        gap: 1,
        position: "relative",
        overflow: "visible",
        zIndex: 1301,
      }}
    >
      {/* Logo/Brand */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src="/images/logos/nav-logo.svg"
          alt="Sakura"
          width={120}
          height={32}
          priority
        />
      </Box>

      {/* Navigation Icons */}
      {navigationConfig.map((module) => {
        const IconComponent = module.icon;
        const isActive = activeModule === module.id;
        
        return (
          <Tooltip 
            key={module.id} 
            title={module.tooltip} 
            placement="right"
            arrow
            enterDelay={300}
            leaveDelay={0}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isActive ? "#2a2a2a" : "transparent",
                color: isActive ? "white" : "#8a8a8a",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                "&:hover": {
                  backgroundColor: isActive ? "#2a2a2a" : "#1a1a1a",
                  color: "white",
                },
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleModuleClick(module.id);
              }}
            >
              <IconComponent size={20} stroke={1.5} />
            </Box>
          </Tooltip>
        );
      })}

      {/* Bottom Section */}
      <Box sx={{ flex: 1 }} />
      
      {/* Settings Icon */}
      <Tooltip title="Settings" placement="right" arrow enterDelay={300} leaveDelay={0}>
        <Link href="/settings" style={{ textDecoration: "none", color: "inherit" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isItemActive("/settings") ? "white" : "#8a8a8a",
              backgroundColor: isItemActive("/settings") ? "#2a2a2a" : "transparent",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: isItemActive("/settings") ? "#2a2a2a" : "#1a1a1a",
                color: "white",
              },
            }}
          >
            <IconSettings size={20} stroke={1.5} />
          </Box>
        </Link>
      </Tooltip>

      <Tooltip title="Help & Support" placement="right" arrow enterDelay={300} leaveDelay={0}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8a8a8a",
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#1a1a1a",
              color: "white",
            },
          }}
        >
          <IconHelp size={20} stroke={1.5} />
        </Box>
      </Tooltip>

      {/* Account Settings Button */}
      <Tooltip title="Account Settings" placement="right" arrow enterDelay={300} leaveDelay={0}>
        <Link href="/settings/account-settings" style={{ textDecoration: "none", color: "inherit" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: isItemActive("/settings/account-settings") ? "#1976d2" : "#1976d2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              cursor: "pointer",
              position: "relative",
              mt: 1,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#4caf50",
                border: "2px solid #000000",
              },
            }}
          >
            <IconUser size={20} stroke={1.5} />
          </Box>
        </Link>
      </Tooltip>
    </Box>
  );

  const renderSecondaryNavigation = () => {
    const activeModuleConfig = navigationConfig.find(m => m.id === activeModule);
    // If no matching module found, default to first module to prevent empty sidebar
    if (!activeModuleConfig) {
      const defaultModule = navigationConfig[0];
      if (!defaultModule) return null;
      return (
        <Box sx={{ 
          flex: 1, 
          overflow: "auto", 
          backgroundColor: "#000000",
          ...scrollbarStyles,
          display: isSidebarCollapsed ? "none" : "flex",
          flexDirection: "column",
        }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: "white",
              fontSize: "16px",
              mb: 3
            }}>
              {defaultModule.title}
            </Typography>
            <Box>
              {defaultModule.children.map((item) => renderNavigationItem(item))}
            </Box>
          </Box>
        </Box>
      );
    }

    const allChildren = activeModuleConfig.children;

    return (
      <Box sx={{ 
        flex: 1, 
        overflow: "auto", 
        backgroundColor: "#000000",
        ...scrollbarStyles,
        display: isSidebarCollapsed ? "none" : "flex",
        flexDirection: "column",
      }}>
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            mb: 3 
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: "white",
              fontSize: "16px"
            }}>
              {activeModuleConfig.title}
            </Typography>
          </Box>

          {/* Navigation Items */}
          <Box>
            {allChildren.map((item) => renderNavigationItem(item))}
          </Box>
        </Box>
      </Box>
    );
  };

  const sidebarContent = (
    <Box sx={{ 
      display: "flex", 
      height: "100vh", 
      width: "100%",
      overflow: "hidden",
      pointerEvents: "auto",
    }}>
      {renderIconBar()}
      {renderSecondaryNavigation()}
    </Box>
  );

  // Always render the sidebar, but use different drawer variants based on screen size
  // Use lgUp check, but also ensure it renders on initial load
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (lgUp || !mounted) {
    return (
      <>
        {/* Toggle Button - Rendered outside sidebar to ensure it's always on top */}
        {onSidebarToggle && (
          <Box
            sx={{
              position: "fixed",
              left: isSidebarCollapsed ? `${iconBarWidthNum - 14}px` : `${sidebarWidthNum - 14}px`,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1400,
              pointerEvents: "auto",
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "#2a2a2a",
              border: "2px solid #333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
              transition: "left 0.3s ease-in-out",
              "&:hover": {
                backgroundColor: "#3a3a3a",
                transform: "translateY(-50%) scale(1.1)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
              },
              "&:active": {
                transform: "translateY(-50%) scale(0.95)",
              },
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
              <ChevronRight sx={{ color: "#fff", fontSize: "18px" }} />
            ) : (
              <ChevronLeft sx={{ color: "#fff", fontSize: "18px" }} />
            )}
          </Box>
        )}
        <Box
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            position: "fixed",
            left: 0,
            top: 0,
            height: "100vh",
            zIndex: 1300,
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <Drawer
            anchor="left"
            open={isSidebarOpen}
            variant="permanent"
            slotProps={{
              paper: {
                sx: {
                  boxSizing: "border-box",
                  width: currentSidebarWidth,
                  borderRight: "1px solid",
                  borderColor: "divider",
                  transition: "width 0.3s ease-in-out",
                  overflow: "visible",
                  position: "fixed",
                  top: 0,
                  left: 0,
                  height: "100vh",
                  zIndex: 1300,
                  pointerEvents: "auto",
                },
              }
            }}
          >
            {sidebarContent}
          </Drawer>
        </Box>
      </>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            boxShadow: (theme) => theme.shadows[8],
            width: sidebarWidth,
          },
        }
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default NewSidebar;
