"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hasModule } from "@/lib/permissions";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "bx-pie-chart-alt-2", module: null },
  { href: "/admin/registrations", label: "Delegate Registrations", icon: "bx-id-card", module: "registrations" },
  { href: "/admin/visitors", label: "Visitor Registrations", icon: "bx-user-check", module: "companies" },
  { href: "/admin/pass-types", label: "Pass Types", icon: "bx-purchase-tag-alt", module: "pass_types" },
  { href: "/admin/promo-codes", label: "Promo Codes", icon: "bx-gift", module: "promo_codes" },
  { href: "/admin/companies", label: "Companies", icon: "bx-buildings", module: "companies" },
  { href: "/admin/badges", label: "Badge Generation", icon: "bx-id-card", module: "badges" },
  { href: "/admin/users", label: "Admin Users", icon: "bx-user-plus", module: "admin_users" },
];

function BrandMark() {
  return (
    <span className="app-brand-logo demo">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    </span>
  );
}

export default function AdminSidebar({ onNavigate, collapsed, adminRole, adminPermissions }) {
  const pathname = usePathname();
  const session = { role: adminRole, permissions: adminPermissions };
  const visibleItems = navItems.filter((item) => !item.module || hasModule(session, item.module));
  const menuInnerRef = useRef(null);
  const psRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function tryInit(attempts = 0) {
      if (cancelled) return;
      if (typeof window === "undefined" || !window.PerfectScrollbar) {
        if (attempts < 40) setTimeout(() => tryInit(attempts + 1), 100);
        return;
      }
      if (!menuInnerRef.current || psRef.current) return;
      psRef.current = new window.PerfectScrollbar(menuInnerRef.current, { wheelPropagation: false, suppressScrollX: true });
    }

    tryInit();

    return () => {
      cancelled = true;
      if (psRef.current) {
        psRef.current.destroy();
        psRef.current = null;
      }
    };
  }, []);

  return (
    <aside id="layout-menu" className={`layout-menu menu-vertical menu bg-menu-theme${collapsed ? " menu-collapsed" : ""}`}>
      <div className="app-brand demo">
        <Link href="/admin" className="app-brand-link">
          <BrandMark />
          <span className="app-brand-text demo menu-text fw-bolder ms-2">Convergence Admin</span>
        </Link>
        <a
          href="#"
          className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none"
          onClick={(event) => {
            event.preventDefault();
            onNavigate();
          }}
        >
          <i className="bx bx-chevron-left bx-sm align-middle"></i>
        </a>
      </div>

      <div className="menu-inner-shadow"></div>

      <ul className="menu-inner py-1" ref={menuInnerRef}>
        {visibleItems.map((item) => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li className={`menu-item${isActive ? " active" : ""}`} key={item.href}>
              <Link href={item.href} className="menu-link" onClick={onNavigate}>
                <i className={`menu-icon tf-icons bx ${item.icon}`}></i>
                <div>{item.label}</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
