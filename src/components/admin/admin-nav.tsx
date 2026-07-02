"use client";

// Single source of truth for portal navigation. Every surface a person sees
// is theirs: the base trio (Home · Pulse · Work) for everyone on the roster,
// plus tools that light up from their department (see getPortalAccess), plus
// Manage for admins. Consumed by the sidebar (desktop) and bottom bar (mobile).

export type NavFlags = {
  engineering: boolean;
  customers: boolean;
  manage: boolean;
};

export type NavItem = {
  id: string;
  label: string;
  href: string; // logical path; locale prefix added at render
  section: "you" | "team" | "tools" | "admin";
  icon: (props: { className?: string }) => React.ReactNode;
  /** Also treat these path prefixes as "active" for this item. */
  match?: string[];
};

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const HomeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
    <path d="M3.5 10.5 12 3.5l8.5 7" />
    <path d="M5.5 9.5V20a.5.5 0 0 0 .5.5h4V15a2 2 0 0 1 4 0v5.5h4a.5.5 0 0 0 .5-.5V9.5" />
  </svg>
);

export const PulseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
    <path d="M3 12h4l3-7.5L14 19l3-7h4" />
  </svg>
);

export const WorkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
    <rect x="3.5" y="4" width="5" height="16" rx="1.2" />
    <rect x="12" y="4" width="5" height="10" rx="1.2" />
    <path d="M20.5 4v7" />
  </svg>
);

export const EngineeringIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
    <circle cx="6" cy="6" r="2.4" />
    <circle cx="6" cy="18" r="2.4" />
    <circle cx="18" cy="7" r="2.4" />
    <path d="M6 8.4v7.2" />
    <path d="M18 9.4c0 3.2-3.4 4.6-9.3 5" />
  </svg>
);

export const CustomersIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
    <path d="M8.5 11a2.5 2.5 0 0 1 5 0" />
    <circle cx="11" cy="8.6" r="0.4" />
  </svg>
);

export const ManageIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
    <path d="M4 7h9M17.5 7H20" />
    <circle cx="15" cy="7" r="2" />
    <path d="M4 17h2.5M11 17h9" />
    <circle cx="8.5" cy="17" r="2" />
  </svg>
);

export const SECTION_LABELS: Record<NavItem["section"], string | null> = {
  you: null,
  team: "Team",
  tools: "Tools",
  admin: "Admin",
};

export function buildNav(flags: NavFlags): NavItem[] {
  const items: NavItem[] = [
    { id: "home", label: "Home", href: "/admin/dashboard", section: "you", icon: HomeIcon },
    { id: "pulse", label: "Pulse", href: "/admin/team/pulse", section: "team", icon: PulseIcon },
    {
      id: "work",
      label: "Work",
      href: "/admin/team/work",
      section: "team",
      icon: WorkIcon,
      match: ["/admin/team/initiatives"],
    },
  ];
  if (flags.engineering) {
    items.push({
      id: "engineering",
      label: "Engineering",
      href: "/admin/team/engineering",
      section: "team",
      icon: EngineeringIcon,
    });
  }
  if (flags.customers) {
    items.push({
      id: "customers",
      label: "Customers",
      href: "/admin/customers",
      section: "tools",
      icon: CustomersIcon,
      match: ["/admin/companies"],
    });
  }
  if (flags.manage) {
    items.push({
      id: "manage",
      label: "Manage",
      href: "/admin/team/people",
      section: "admin",
      icon: ManageIcon,
    });
  }
  return items;
}

export function isActive(pathname: string | null, prefix: string, item: NavItem): boolean {
  if (!pathname) return false;
  const hrefs = [item.href, ...(item.match ?? [])];
  return hrefs.some((h) => pathname.startsWith(`${prefix}${h}`));
}
