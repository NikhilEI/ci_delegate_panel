"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import AdminFooter from "./AdminFooter";

export default function AdminShell({ adminName, adminEmail, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const wrapperClass = ["layout-wrapper", "layout-content-navbar", collapsed ? "layout-menu-collapsed" : "", mobileOpen ? "layout-menu-expanded" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClass}>
      <div className="layout-container">
        <AdminSidebar onNavigate={() => setMobileOpen(false)} />

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
