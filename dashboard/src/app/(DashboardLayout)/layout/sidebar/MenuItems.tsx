import {
  IconAperture,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "YOUR INBOX",
  },

  {
    id: uniqueId(),
    title: "My Chats",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    id: uniqueId(),
    title: "Escalated Chats",
    icon: IconLayoutDashboard,
    href: "/home/customers",
  },
  {
    id: uniqueId(),
    title: "Archive",
    icon: IconLayoutDashboard,
    href: "/home/analytics",
  },
  {
    navlabel: true,
    subheader: "AI AGENT",
  },
  {
    id: uniqueId(),
    title: "Active Chats",
    icon: IconTypography,
    href: "/chatbot/manage",
  },
  {
    id: uniqueId(),
    title: "Solved",
    icon: IconCopy,
    href: "/chatbot/integrations",
  },
  {
    navlabel: true,
    subheader: "AGENTS",
  },
  {
    id: uniqueId(),
    title: "Agent Phillip",
    icon: IconLogin,
    href: "/settings/account-settings",
  },
  {
    navlabel: true,
    subheader: "REPORTS",
  },
  {
    id: uniqueId(),
    title: "Overview",
    icon: IconLogin,
    href: "/settings/account-settings",
  },
  {
    id: uniqueId(),
    title: "Agents Performance",
    icon: IconLogin,
    href: "/settings/account-settings",
  },
  {
    navlabel: true,
  subheader: "KNOWLEDGE BASE",
  },
  {
    id: uniqueId(),
    title: "All",
    icon: IconLogin,
    href: "/settings/account-settings",
  },
  {
    id: uniqueId(),
    title: "Websites",
    icon: IconLogin,
    href: "/settings/account-settings",
  },
  {
    id: uniqueId(),
    title: "Files",
    icon: IconLogin,
    href: "/settings/account-settings",
  },
   {
    navlabel: true,
    subheader: "APPS",
  },
  {
    id: uniqueId(),
    title: "Whatsapp",
    icon: IconLogin,
    href: "/settings/account-settings",
  },
  {
    id: uniqueId(),
    title: "Telegram",
    icon: IconLogin,
    href: "/settings/account-settings",
  },
  {
    id: uniqueId(),
    title: "Twilio",
    icon: IconLogin,
    href: "/settings/account-settings",
  },
   {
    navlabel: true,
    subheader: "SETTINGS",
  },
  {
    id: uniqueId(),
    title: "omo",
    icon: IconLogin,
    href: "/settings/account-settings",
  },
 
  // {
  //   navlabel: true,
  //   subheader: " SETTINGS",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Account Settings",
  //   icon: IconMoodHappy,
  //   href: "/icons",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Integration Settings",
  //   icon: IconMoodHappy,
  //   href: "/icons",
  // },
  

];

export default Menuitems;


