"use client";
import React, { useState } from "react";
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
} from "@mui/icons-material";
import {
  IconSettings,
  IconHelp,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationConfig, NavigationModule, NavigationItem } from "@/config/navigation";
import { useAgents } from "@/contexts/AgentsContext";

interface NewSidebarProps {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

const NewSidebar: React.FC<NewSidebarProps> = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}) => {
  const pathname = usePathname();
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeModule, setActiveModule] = useState<string>("inbox");

  const sidebarWidth = "270px";
  const iconBarWidth = "60px";

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
    setActiveModule(moduleId);
  };

  const isItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const isActive = isItemActive(item.href);
    const hasChildren = item.children && item.children.length > 0;

    const IconComponent = item.icon;

    // Mock count for demonstration - you can replace with real data
    const getItemCount = (itemId: string) => {
      const counts: { [key: string]: number } = {
        'human-chats': 12,
        'escalated-chats': 3,
        'resolved-chats': 0,
        'active-chats': 8,
        'resolved-agent-chats': 0,
      };
      return counts[itemId] || 0;
    };

    const itemCount = getItemCount(item.id);

    const listItemContent = (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          py: 1.5,
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
        onClick={() => {
          if (item.collapsible && hasChildren) {
            handleToggleExpand(item.id);
          }
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
            <IconComponent size={18} stroke={1.5} />
          </Box>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: isActive ? 600 : 500,
              flex: 1,
            }}
          >
            {item.title}
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {itemCount > 0 && (
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

    return (
      <React.Fragment key={item.id}>
        {item.external ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {listItemContent}
          </a>
        ) : (
          <Link href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
            {listItemContent}
          </Link>
        )}
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 2 }}>
              {item.children!.map((child) => renderNavigationItem(child, level + 1))}
            </Box>
          </Collapse>
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
      }}
    >
      {/* Logo/Brand */}
      <Box
        sx={{
          color: "white",
          fontSize: "12px",
          fontWeight: 600,
          mb: 2,
          letterSpacing: "0.5px",
        }}
      >
        SAKURA
      </Box>

      {/* Navigation Icons */}
      {navigationConfig.map((module) => {
        const IconComponent = module.icon;
        const isActive = activeModule === module.id;
        
        return (
          <Tooltip key={module.id} title={module.tooltip} placement="right">
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
              onClick={() => handleModuleClick(module.id)}
            >
              <IconComponent size={20} stroke={1.5} />
            </Box>
          </Tooltip>
        );
      })}

      {/* Bottom Section */}
      <Box sx={{ flex: 1 }} />
      
      {/* Additional Icons */}
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
        <IconSettings size={20} stroke={1.5} />
      </Box>

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

      {/* Status Button */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "#1976d2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          cursor: "pointer",
          position: "relative",
          mt: 1,
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
    </Box>
  );

  const renderSecondaryNavigation = () => {
    const activeModuleConfig = navigationConfig.find(m => m.id === activeModule);
    if (!activeModuleConfig) return null;

    const allChildren = activeModuleConfig.children;

    return (
      <Box sx={{ 
        flex: 1, 
        overflow: "auto", 
        backgroundColor: "#000000",
        ...scrollbarStyles 
      }}>
        <Box sx={{ p: 2 }}>
          {/* Header with Add Button */}
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
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                },
              }}
              onClick={() => {
                // Add module-specific actions here
              }}
            >
              <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: 600 }}>+</Typography>
            </Box>
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
    <Box sx={{ display: "flex", height: "100%" }}>
      {renderIconBar()}
      {renderSecondaryNavigation()}
    </Box>
  );

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
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
                width: sidebarWidth,
                borderRight: "1px solid",
                borderColor: "divider",
              },
            }
          }}
        >
          {sidebarContent}
        </Drawer>
      </Box>
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
