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
  IconPlug,
  IconApi,
  IconBrandSlack,
  IconBrandDiscord,
  IconBrandWhatsapp,
  IconBrandTelegram,
  IconBrandFacebook,
  IconBrandInstagram,
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
        collapsible: false,
        children: [
          {
            id: 'unified-inbox',
            title: 'Unified Inbox',
            href: '/inbox/my-inbox/unified',
            icon: IconMessageCircle,
          },
          {
            id: 'human-chats',
            title: 'Chats',
            href: '/inbox/my-inbox/chats',
            icon: IconMessageCircle,
          },
          {
            id: 'escalated-chats',
            title: 'Escalated',
            href: '/inbox/my-inbox/escalated',
            icon: IconAlertTriangle,
          },
          {
            id: 'resolved-chats',
            title: 'Resolved',
            href: '/inbox/my-inbox/resolved',
            icon: IconCheck,
          },
        ],
      },
      {
        id: 'agent-inbox',
        title: 'Agent Inbox',
        href: '/inbox/agent-inbox',
        icon: IconRobot,
        collapsible: false,
        children: [
          {
            id: 'active-chats',
            title: 'Active Chats',
            href: '/inbox/agent-inbox/active-chats',
            icon: IconMessageCircle,
          },
          {
            id: 'resolved-agent-chats',
            title: 'Resolved',
            href: '/inbox/agent-inbox/resolved-chats',
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
      {
        id: 'overview',
        title: 'Overview',
        href: '/ai-agent/overview',
        icon: IconEye,
      },
      {
        id: 'performance',
        title: 'Performance',
        href: '/ai-agent/performance',
        icon: IconTrendingUp,
      },
      {
        id: 'settings',
        title: 'Settings',
        href: '/ai-agent/settings',
        icon: IconSettings,
      },
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
      {
        id: 'faqs',
        title: 'FAQs',
        href: '/knowledge-base/faqs',
        icon: IconUserQuestion,
      },
    ],
  },
  {
    id: 'sops',
    title: 'SOPs Library',
    href: '/sops',
    icon: IconCode,
    tooltip: 'SOPs Library',
    children: [
      {
        id: 'sops-editor',
        title: 'SOPs Editor',
        href: '/sops/sops-editor',
        icon: IconCode,
      },
      {
        id: 'all-sops',
        title: 'All SOPs',
        href: '/sops/all',
        icon: IconList,
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    href: '/integrations',
    icon: IconPlug,
    tooltip: 'Integrations',
    children: [
      {
        id: 'contact-channels',
        title: 'Contact Channels',
        href: '/integrations/contact-channels',
        icon: IconMessageCircle,
      },
      {
        id: 'business-integrations',
        title: 'Business Integrations',
        href: '/integrations/business-integrations',
        icon: IconTrendingUp,
      },
    ],
  },
];
