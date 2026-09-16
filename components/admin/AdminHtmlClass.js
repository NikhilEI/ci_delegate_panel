"use client";

import { useEffect } from "react";

// The Sneat theme's CSS keys off classes/attributes on <html>. Since /admin
// is nested under the same root layout as the public site, we add these
// imperatively on mount and remove them on unmount so they never leak onto
// the public pages.
export default function AdminHtmlClass() {
  useEffect(() => {
    const root = document.documentElement;
    const classes = ["light-style", "layout-menu-fixed", "layout-navbar-fixed"];
    root.classList.add(...classes);
    root.setAttribute("data-theme", "theme-default");
    root.setAttribute("data-assets-path", "/admin-theme/");

    return () => {
      root.classList.remove(...classes);
      root.removeAttribute("data-theme");
      root.removeAttribute("data-assets-path");
    };
  }, []);

  return null;
}
