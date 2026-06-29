// Registry of admin-portal modules. The portal shell is generic; each
// capability is a module that plugs in here. Access is granted per module
// (see admin-auth Staff.modules / Auth0 permissions in phase 1).

export type ModuleStatus = "live" | "in-progress" | "planned";

export type AdminModule = {
  id: string;
  label: string;
  href: string; // logical path, locale prefix added by the shell
  status: ModuleStatus;
  description: string;
};

export const ADMIN_MODULES: AdminModule[] = [
  {
    id: "customer-lookup",
    label: "Customer Lookup",
    href: "/admin/customers",
    status: "live",
    description:
      "Search any customer, view who they are and their participation, and log interactions.",
  },
];
