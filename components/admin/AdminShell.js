"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import AdminFooter from "./AdminFooter";

export default function AdminShell({ adminName, adminEmail, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // The vendor theme's CSS combines these state classes with
  // "layout-menu-fixed" (set once on <html> by AdminHtmlClass) in compound
  // selectors like ".layout-menu-fixed.layout-menu-collapsed" - which only
  // match when both classes sit on the *same* element. So these need to be
  // mirrored onto <html> too, not just the wrapper div below.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("layout-menu-collapsed", collapsed);
    return () => root.classList.remove("layout-menu-collapsed");
  }, [collapsed]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("layout-menu-expanded", mobileOpen);
    return () => root.classList.remove("layout-menu-expanded");
  }, [mobileOpen]);

  const wrapperClass = ["layout-wrapper", "layout-content-navbar", collapsed ? "layout-menu-collapsed" : "", mobileOpen ? "layout-menu-expanded" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClass}>
      <div className="layout-container">
        <AdminSidebar onNavigate={() => setMobileOpen(false)} collapsed={collapsed} />

        <div className="layout-page">
          <AdminNavbar
            adminName={adminName}
            adminEmail={adminEmail}
            onToggleMenu={() => setMobileOpen((value) => !value)}
            onToggleCollapse={() => setCollapsed((value) => !value)}
          />

          <div className="content-wrapper">
            <div className="container-xxl flex-grow-1 container-p-y">{children}</div>
            <AdminFooter />
            <div className="content-backdrop fade"></div>
          </div>
        </div>
      </div>

      <div className="layout-overlay layout-menu-toggle" onClick={() => setMobileOpen(false)}></div>
    </div>
  );
}
