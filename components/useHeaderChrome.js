"use client";

import { useEffect, useRef, useState } from "react";

export function useHeaderChrome() {
  const [iconOpen, setIconOpen] = useState(false);
  const collapseRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const header = document.querySelector(".fixed-top-band");
      if (!header) return;
      if (window.scrollY > 50) {
        header.classList.add("header-scroll");
      } else {
        header.classList.remove("header-scroll");
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = collapseRef.current;
    if (!el) return;
    const onShow = () => document.body.classList.add("no-scroll");
    const onHide = () => document.body.classList.remove("no-scroll");
    el.addEventListener("show.bs.collapse", onShow);
    el.addEventListener("hide.bs.collapse", onHide);
    return () => {
      el.removeEventListener("show.bs.collapse", onShow);
      el.removeEventListener("hide.bs.collapse", onHide);
    };
  }, []);

  return { iconOpen, setIconOpen, collapseRef };
}
