import {
  IconMail,
  IconSparkles,
  IconChartBar,
  IconBook,
  IconMessageCircle,
  IconAlertTriangle,
  IconCheck,
  IconRobot,
  IconSettings,
  IconTrendingUp,
  IconEye,
  IconGlobe,
  IconFileText,
  IconUser,
  IconClock,
  IconUserQuestion,
  IconTrash,
  IconCode,
  IconList,
} from '@tabler/icons-react';

export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: any;
  tooltip?: string;
  children?: NavigationItem[];
  external?: boolean;
  collapsible?: boolean;
  isDynamic?: boolean; // For dynamically created agents
}

export interface NavigationModule {
  id: string;
  title: string;
  href: string;
  icon: any;
  tooltip: string;
  children: NavigationItem[];
}

export const navigationConfig: NavigationModule[] = [
  {
    id: 'inbox',
    title: 'Inbox',
    href: '/inbox',
    icon: IconMail,
    tooltip: 'Inbox',
    children: [
      {
        id: 'my-inbox',
        title: 'My Inbox',
        href: '/inbox/my-inbox',
        icon: IconMessageCircle,
        collapsible: true,
        children: [
          {
            id: 'human-chats',
            title: 'Chats',
            href: '/human/human-chats',
            icon: IconMessageCircle,
          },
          {
            id: 'escalated-chats',
            title: 'Escalated',
            href: '/human/escalated-chats',
            icon: IconAlertTriangle,
          },
          {
            id: 'resolved-chats',
            title: 'Resolved',
            href: '/human/resolved-chats',
            icon: IconCheck,
          },
        ],
      },
      {
        id: 'agent-inbox',
        title: 'Agent Inbox',
        href: '/inbox/agent-inbox',
        icon: IconRobot,
        collapsible: true,
        children: [
          {
            id: 'active-chats',
            title: 'Active Chats',
            href: '/ai-agent/active-chats',
            icon: IconMessageCircle,
          },
          {
            id: 'resolved-agent-chats',
            title: 'Resolved',
            href: '/ai-agent/resolved-chats',
            icon: IconCheck,
          },
        ],
      },
    ],
  },
  {
    id: 'ai-agent',
    title: 'AI Agent',
    href: '/ai-agent',
    icon: IconSparkles,
    tooltip: 'AI Agent',
    children: [
      // Dynamic agents will be added here via the AgentsContext
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    href: '/reports',
    icon: IconChartBar,
    tooltip: 'Reports',
    children: [
      {
        id: 'overview',
        title: 'Overview',
        href: '/reports/overview',
        icon: IconChartBar,
      },
      {
        id: 'ai-agent-reports',
        title: 'AI Agent',
        href: '/reports/ai-agent',
        icon: IconRobot,
      },
    ],
  },
  {
    id: 'knowledge-base',
    title: 'Knowledge Base',
    href: '/knowledge-base',
    icon: IconBook,
    tooltip: 'Knowledge Base',
    children: [
      {
        id: 'websites',
        title: 'Websites',
        href: '/knowledge-base/websites',
        icon: IconGlobe,
      },
      {
        id: 'files',
        title: 'Files',
        href: '/knowledge-base/files',
        icon: IconFileText,
      },
    ],
  },
  {
    id: 'arp',
    title: 'ARP Library',
    href: '/arp',
    icon: IconCode,
    tooltip: 'ARP Library',
    children: [
      {
        id: 'arp-editor',
        title: 'ARP Editor',
        href: '/arp/arp-editor',
        icon: IconCode,
      },
      {
        id: 'all-arps',
        title: 'All ARPs',
        href: '/arp/all',
        icon: IconList,
      },
    ],
  },
];
