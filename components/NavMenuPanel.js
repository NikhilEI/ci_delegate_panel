"use client";

import { forwardRef } from "react";

const exhibitionLinks = [
  { label: "Exhibitor Profile", href: "https://www.convergenceindia.org/exhibitor-profile.aspx" },
  { label: "Space Booking Form", href: "https://www.convergenceindia.org/space-booking.aspx" },
  { label: "2027 Brochure", href: "download-form.aspx", target: "_blank" },
  { label: "2026 Post Show Report", href: "download-form.aspx", target: "_blank" },
  { label: "List of Participants", href: "https://www.convergenceindia.org/exhibitors-and-participants-convergence-india.aspx" },
];

const visitorLinks = [
  { label: "Visitor Profile", href: "https://www.convergenceindia.org/visitor-profile.aspx" },
  { label: "Visitor Registration", href: "https://www.convergenceindia.org/visitor-registration.aspx" },
  { label: "Exhibition Venue & Dates", href: "https://www.convergenceindia.org/exhibition-venue-and-dates.aspx" },
  { label: "Hosted Buyer", href: "hosted-buyers-registration.aspx" },
];

const conferenceLinks = [
  { label: "Speaker Registration", href: "https://www.convergenceindia.org/speaker-registration.aspx" },
  { label: "Conference Programme", href: "https://www.convergenceindia.org/conference-programme.aspx" },
  { label: "Eminent Speakers", href: "https://www.convergenceindia.org/speakers.aspx#speakers" },
  { label: "Sessions Video Library", href: "https://www.convergenceindia.org/sessions-video-library.aspx", target: "_blank" },
];

const specialEventLinks = [{ label: "Convergence Awards", href: "https://www.convergenceindia.org/awards/" }];

const endorsementLinks = [
  { label: "Partners", href: "https://www.convergenceindia.org/partners.aspx" },
  { label: "Support", href: "https://www.convergenceindia.org/support.aspx" },
  { label: "Supporting Associations", href: "https://www.convergenceindia.org/supporting-associations.aspx" },
  { label: "Media Partners", href: "https://www.convergenceindia.org/media-partners.aspx" },
];

function MenuColumn({ heading, links }) {
  return (
    <div className="col-lg-2 col-md-3 col-sm-4 col-12">
      <div className="menu-box-main">
        <a href="#" className="menu-heading nav-link abc">
          {heading}
        </a>
        <ul className="menu-ul-main nav flex-column">
          {links.map((link) => (
            <li className="nav-item" key={link.label}>
              <a href={link.href} className="nav-link" target={link.target}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const NavMenuPanel = forwardRef(function NavMenuPanel(_props, ref) {
  return (
    <div className="collapse navbar-collapse overlay align-items-center" id="navbarSupportedContent" ref={ref}>
      <div className="menu-box-outer">
        <div className="container-xxl">
          <div className="row justify-content-between">
            <MenuColumn heading="Exhibition" links={exhibitionLinks} />
            <MenuColumn heading="Visitor" links={visitorLinks} />
            <MenuColumn heading="Conference" links={conferenceLinks} />
            <MenuColumn heading="Special Events" links={specialEventLinks} />
            <MenuColumn heading="Endorsements" links={endorsementLinks} />
          </div>

          <div className="row justify-content-between">
            <div className="col-lg-2 col-md-4 col-sm-4 col-12">
              <div className="menu-heading-btn-main">
                <a href="https://www.convergence-now.com/" target="_blank" className="d--flex justify--content-between">
                  <span>Industry News</span> <i className="far fa-arrow-right btn-arrow-icon"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="row justify-content-between">
            <div className="col-lg-2 col-md-4 col-sm-4 col-12">
              <div className="menu-heading-btn-main">
                <a href="https://www.convergenceindia.org/expo-highlights/" target="_blank" className="d--flex justify--content-between">
                  <span>Expo Highlights</span> <i className="far fa-arrow-right btn-arrow-icon"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default NavMenuPanel;
