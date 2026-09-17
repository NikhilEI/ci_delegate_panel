// Central list of admin-panel modules that can be granted/withheld per user.
// Both the /admin/users UI and proxy.js (the actual enforcement point) read
// from this list, so a new gated module only needs to be added here once.
export const MODULES = [
  { key: "registrations", label: "Delegate Registrations", icon: "bx-id-card" },
  { key: "companies", label: "Companies", icon: "bx-buildings" },
  { key: "pass_types", label: "Pass Types", icon: "bx-purchase-tag-alt" },
  { key: "promo_codes", label: "Promo Codes", icon: "bx-gift" },
  { key: "badges", label: "Badge Generation", icon: "bx-id-card" },
  { key: "admin_users", label: "Admin Users", icon: "bx-user-plus" },
];

export const ALL_MODULE_KEYS = MODULES.map((m) => m.key);

// Role presets only pre-fill the permission checkboxes when creating a user -
// the saved `permissions` array is what's actually enforced, so a role can
// always be customized further (or a user given the "custom" role to signal
// their access doesn't match any preset).
export const ROLE_PRESETS = {
  super_admin: { label: "Super Admin", modules: ALL_MODULE_KEYS },
  sales: { label: "Sales", modules: ["registrations", "companies", "pass_types", "promo_codes"] },
  operations: { label: "Operations", modules: ["registrations", "companies", "badges"] },
  custom: { label: "Custom", modules: [] },
};

export function roleLabel(role) {
  return ROLE_PRESETS[role]?.label || role;
}

// `session` is the decoded JWT payload (see lib/auth.js) - super_admin always
// passes regardless of what's in `permissions`, so promoting someone to
// super_admin can never accidentally leave a module unchecked.
export function hasModule(session, moduleKey) {
  if (!session) return false;
  if (session.role === "super_admin") return true;
  return Array.isArray(session.permissions) && session.permissions.includes(moduleKey);
}

// Maps a request path to the module that gates it. Order matters only in
// that more specific prefixes should come first if they ever overlap.
const PATH_MODULE_RULES = [
  { prefix: "/admin/registrations", module: "registrations" },
  { prefix: "/api/admin/registrations", module: "registrations" },
  { prefix: "/admin/companies", module: "companies" },
  { prefix: "/api/admin/companies", module: "companies" },
  { prefix: "/admin/visitors", module: "companies" },
  { prefix: "/api/admin/visitors", module: "companies" },
  { prefix: "/admin/pass-types", module: "pass_types" },
  { prefix: "/api/admin/pass-types", module: "pass_types" },
  { prefix: "/admin/promo-codes", module: "promo_codes" },
  { prefix: "/api/admin/promo-codes", module: "promo_codes" },
  { prefix: "/admin/badges", module: "badges" },
  { prefix: "/api/admin/badges", module: "badges" },
  { prefix: "/admin/checkin", module: "badges" },
  { prefix: "/admin/users", module: "admin_users" },
  { prefix: "/api/admin/users", module: "admin_users" },
];

// Returns null for paths nobody needs a specific module for (dashboard,
// stats, login, etc.) - those stay open to any logged-in admin.
export function moduleForPath(pathname) {
  const rule = PATH_MODULE_RULES.find((r) => pathname.startsWith(r.prefix));
  return rule ? rule.module : null;
}
