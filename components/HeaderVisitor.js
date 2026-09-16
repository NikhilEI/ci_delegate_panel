"use client";

import NavMenuPanel from "./NavMenuPanel";
import { useHeaderChrome } from "./useHeaderChrome";

export default function HeaderVisitor() {
  const { iconOpen, setIconOpen, collapseRef } = useHeaderChrome();

  return (
    <header className="fixed-top-band">
      <nav className="navbar bg-body--tertiary">
        <div className="container-xxl align-items-center">
          <div className="col-xl-6 col-lg-5 col-md-5 col-10">
            <div className="logo-box-main-top row">
              <div className="logo-box-ci col-lg-9 col-md-9 col-sm-8 col-9">
                <a className="navbar-brand" href="https://www.convergenceindia.org/">
                  <img src="/images/convergence-india-logo-2027.png" alt="Convergence India Expo" />
                </a>
              </div>
              <div className="logo-box-sci col-lg-3 col-md-3 col-sm-4 col-3 ps-0">
                <a className="navbar-brand" href="https://www.smartcitiesindia.com/" target="_blank">
                  <img src="/images/smartcitiesindia-logo-colocated-2027.png" alt="Smart Cities India Expo" />
                </a>
              </div>
            </div>
          </div>

          <div className="col-xl-6 col-lg-7 col-md-7 col-2 text-end">
            <div className="row align-items-center">
              <div className="col-xl-10 col-lg-9 col-md-9 col-sm-8 col-9 d-none d-md-block pe-0">
                <a href="https://www.convergenceindia.org/space-booking.aspx" className="home-book-btn top-btn-book">
                  Book for 2027 <i className="far fa-arrow-right btn-arrow-icon"></i>
                </a>
                <div className="dropdown d-inline-flex ms-2 dropdown-menu-header">
                  <button className="dropdown-toggle home-book-btn top-btn-register" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Register Now
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="/visitor-registration">
                        Register as a Visitor <i className="far fa-arrow-right btn-arrow-icon"></i>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="https://www.convergenceindia.org/speaker-registration.aspx">
                        Register as a Speaker <i className="far fa-arrow-right btn-arrow-icon"></i>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="https://www.convergenceindia.org/press-registration.aspx">
                        Register as Media <i className="far fa-arrow-right btn-arrow-icon"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-md-3 col-sm-12">
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
          </div>
        </div>

        <NavMenuPanel ref={collapseRef} />
      </nav>

      <style jsx>{`
        .dropdown-menu-header :global(.dropdown-menu) {
          background-color: rgb(170 254 10 / 100%) !important;
          padding: 0;
          max-width: 235px;
          min-width: 235px;
          overflow: hidden;
        }
        .dropdown-menu-header :global(.dropdown-menu li:first-of-type) {
          border-top: 0;
        }
        .dropdown-menu-header :global(.dropdown-menu li) {
          border-top: 1px solid rgba(0, 0, 0, 0.3);
          position: relative;
        }
        .dropdown-menu-header :global(.dropdown-menu .dropdown-item) {
          padding: 12px 42px 12px 12px;
          color: #000;
        }
        .dropdown-menu-header :global(.dropdown-menu .dropdown-item:hover) {
          color: #000;
          background-color: #e0ffa7;
        }
        .dropdown-menu-header :global(.dropdown-menu .dropdown-item .btn-arrow-icon) {
          position: absolute;
          right: 20px;
          top: 16px;
        }
      `}</style>
    </header>
  );
}
