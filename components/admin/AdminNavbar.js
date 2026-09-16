"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminNavbar({ adminName, adminEmail, onToggleMenu, onToggleCollapse }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout(event) {
    event.preventDefault();
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const initial = adminName ? adminName.charAt(0).toUpperCase() : "A";

  return (
    <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme" id="layout-navbar">
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
        <a
          className="nav-item nav-link px-0 me-xl-4"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onToggleMenu();
          }}
        >
          <i className="bx bx-menu bx-sm"></i>
        </a>
      </div>

      <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse" style={{ minWidth: 0, flex: 1 }}>
        <div className="navbar-nav align-items-center" style={{ minWidth: 0, overflow: "hidden" }}>
          <a
            href="#"
            className="nav-item nav-link px-0 me-3 d-none d-xl-block"
            onClick={(event) => {
              event.preventDefault();
              onToggleCollapse();
            }}
            title="Collapse sidebar"
          >
            <i className="bx bx-menu bx-sm"></i>
          </a>
          <span className="fw-semibold d-none d-md-inline-block text-truncate">Registrations &amp; Payments</span>
        </div>

        <ul className="navbar-nav flex-row align-items-center ms-auto" style={{ flexShrink: 0 }}>
          <li className={`nav-item navbar-dropdown dropdown-user dropdown${menuOpen ? " show" : ""}`} ref={wrapperRef}>
            <a
              className="nav-link dropdown-toggle hide-arrow d-flex align-items-center gap-2"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setMenuOpen((value) => !value);
              }}
            >
              <div className="avatar avatar-online">
                <span className="rounded-circle d-flex align-items-center justify-content-center bg-label-primary fw-bold" style={{ width: 34, height: 34 }}>
                  {initial}
                </span>
              </div>
            </a>
            <ul className={`dropdown-menu dropdown-menu-end${menuOpen ? " show" : ""}`}>
              <li>
                <a className="dropdown-item" href="#" onClick={(event) => event.preventDefault()}>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <span className="fw-semibold d-block">{adminName}</span>
                      <small className="text-muted">{adminEmail}</small>
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <div className="dropdown-divider"></div>
              </li>
              <li>
                <a className="dropdown-item" href="/" target="_blank" rel="noreferrer">
                  <i className="bx bx-globe me-2"></i>
                  <span className="align-middle">View public site</span>
                </a>
              </li>
              <li>
                <div className="dropdown-divider"></div>
              </li>
              <li>
                <a className="dropdown-item" href="#" onClick={handleLogout}>
                  <i className="bx bx-power-off me-2"></i>
                  <span className="align-middle">Log out</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}
