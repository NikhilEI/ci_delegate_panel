"use client";

import { useState } from "react";
import { visitorFeatures } from "@/lib/passFeatures";

function BadgeIcon() {
  return (
    <div className="delegate-pass-badge-icon">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    </div>
  );
}

function TieredPass({ modifierClass, title, price, ctaHref, baseFeatures, moreFeatures }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="col-lg-3 col-md-6 col-sm-6 col-12">
      <div className={`delegate-pass-main-outer ${modifierClass}`}>
        <BadgeIcon />

        <h2 className="delegate-pass-title">{title}</h2>
        <div className="delegate-pass-price">₹ {price.toLocaleString("en-IN")}</div>

        <button className="delegate-pass-cta-button" onClick={() => (window.location.href = ctaHref)}>
          Get Your Pass
        </button>

        <div className="delegate-pass-features-list">
          <ul>
            {baseFeatures.map((feature, index) => (
              <li key={`base-${index}`}>{feature}</li>
            ))}
            <div style={{ display: expanded ? "block" : "none" }}>
              {moreFeatures.map((feature, index) => (
                <li key={`more-${index}`}>{feature}</li>
              ))}
            </div>
          </ul>
          <a
            href="#"
            className="delegate-pass-footer-link"
            onClick={(event) => {
              event.preventDefault();
              setExpanded((value) => !value);
            }}
          >
            {expanded ? "Show Less" : "View all features + "}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function DelegatePasses({ passTypes = [] }) {
  return (
    <section className="section-padding section-delegate-pass">
      <div className="container-xxl">
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="delegate-pass-left-heading">Secure Your Spot</div>
            <div className="delegate-pass-left-para">Choose the best pass and experience the future of fintech</div>
          </div>
        </div>
      </div>

      <div className="container-xxl">
        <div className="row">
          {passTypes.map((passType) => (
            <TieredPass
              key={passType.slug}
              modifierClass={passType.badgeClass}
              title={passType.name}
              price={passType.price}
              ctaHref={`/register-now/${passType.slug}`}
              baseFeatures={passType.baseFeatures}
              moreFeatures={passType.moreFeatures}
            />
          ))}

          <div className="col-lg-3 col-md-6 col-sm-6 col-12">
            <div className="delegate-pass-main-outer delegate-pass-visitor">
              <div className="delegate-pass-badge-icon">
                <img src="/images/delegate-visitor-pass-icon.png" alt="Visitor Pass Free" />
              </div>

              <h2 className="delegate-pass-title">Visitor Pass</h2>
              <div className="delegate-pass-price">Free</div>

              <button className="delegate-pass-cta-button" onClick={() => (window.location.href = "/visitor-registration")}>
                Register Now
              </button>
              <div className="delegate-pass-features-list">
                <ul>
                  {visitorFeatures.map((feature, index) => (
                    <li key={`visitor-${index}`}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="delegate-pass-footer-link">
                <a href="">View all features +</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-xxl">
        <div className="row align-items-center">
          <div className="col-md-12">
            <div className="exhibitor-profile-left-para">
              *Price is inclusive of all applicable taxes <br />
              *<strong>Platinum, Gold</strong> and <strong>Silver</strong> Pass holders will have access to all conference sessions on all three
              days from 23-25 March 2027.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
