"use client";

import NavMenuPanel from "./NavMenuPanel";
import { useHeaderChrome } from "./useHeaderChrome";

export default function Header() {
  const { iconOpen, setIconOpen, collapseRef } = useHeaderChrome();

  return (
    <header className="fixed-top-band">
      <nav className="navbar bg-body--tertiary">
        <div className="container-xxl align-items-center">
          <div className="col-xl-11 col-lg-9 col-md-10 col-10">
            <div className="logo-box-main-top row justify-content-center">
              <div className="logo-box-ci col-lg-9 col-md-9 col-sm-9 col-9">
                <a className="navbar-brand" href="https://www.convergenceindia.org/">
                  <img src="/images/convergence-india-logo-2027.png" alt="Convergence India Expo" />
                </a>
              </div>
              <div className="logo-box-sci col-lg-3 col-md-3 col-sm-3 col-3 ps-0">
                <a className="navbar-brand" href="https://www.smartcitiesindia.com/" target="_blank">
                  <img src="/images/smartcitiesindia-logo-colocated-2027.png" alt="Smart Cities India Expo" />
                </a>
              </div>
            </div>
          </div>

          <div className="col-xl-1 col-lg-3 col-md-2 col-2 text-end">
            <span
              className="navbar-toggler first-button"
              role="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
              onClick={() => setIconOpen((open) => !open)}
            >
              <span className="hamburgermenu-txt">
                Expo <br />
                Menu
              </span>{" "}
              <div className={`animated-icon1${iconOpen ? " open" : ""}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </span>
          </div>
        </div>

        <NavMenuPanel ref={collapseRef} />
      </nav>
    </header>
  );
}
