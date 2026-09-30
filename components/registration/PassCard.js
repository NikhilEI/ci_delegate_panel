"use client";

import { useState } from "react";

// A feature line wrapped in ~~like this~~ renders struck-through/faded, i.e.
// "not included in this pass" - matches convergenceindia.org/register-now's
// comparison-style cards (li.excluded), where every tier lists the full set
// of perks but greys out + strikes the ones a given tier doesn't get.
export function parseFeatureLine(raw) {
  const text = String(raw ?? "").trim();
  const excludedMatch = text.match(/^~~(.*)~~$/);
  if (excludedMatch) return { text: excludedMatch[1].trim(), excluded: true };
  return { text, excluded: false };
}

export function getPassBadgeIcon(modifierClass = "") {
  const cls = (modifierClass || "").toLowerCase();
  if (cls.includes("media")) {
    return "/images/Delegate-Media-Icon.png";
  }
  if (cls.includes("visitor")) {
    return "/images/Delegate-Visitor-Icon.png";
  }
  // Default for platinum, gold, silver, etc.
  return "/images/Delegate-Star_Icon.png";
}

export function PassBadgeIcon({ iconUrl, modifierClass, alt = "Pass icon" }) {
  const iconSrc = iconUrl?.trim() ? iconUrl.trim() : getPassBadgeIcon(modifierClass);
  return (
    <div className="delegate-pass-badge-icon">
      <img src={iconSrc} alt={alt} />
    </div>
  );
}

export default function PassCard({
  modifierClass,
  badgeIcon,
  iconUrl,
  title,
  price,
  ctaLabel = "Get Your Pass",
  ctaHref,
  moreLabel = "View all features + ",
  baseFeatures = [],
  moreFeatures = [],
  disableCta = false,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`delegate-pass-main-outer ${modifierClass || ""}`}>
      {badgeIcon || <PassBadgeIcon iconUrl={iconUrl} modifierClass={modifierClass} alt={title} />}

      <h2 className="delegate-pass-title">{title}</h2>
      <div className="delegate-pass-price">{typeof price === "number" ? `₹ ${price.toLocaleString("en-IN")}` : price}</div>

      <button
        type="button"
        className="delegate-pass-cta-button"
        onClick={disableCta ? undefined : () => (window.location.href = ctaHref)}
        style={disableCta ? { cursor: "default" } : undefined}
      >
        {ctaLabel}
      </button>

      <div className="delegate-pass-features-list">
        <ul>
          {baseFeatures.map((feature, index) => {
            const { text, excluded } = parseFeatureLine(feature);
            return (
              <li key={`base-${index}`} className={excluded ? "excluded" : undefined}>
                {text}
              </li>
            );
          })}
          <div style={{ display: expanded ? "block" : "none" }}>
            {moreFeatures.map((feature, index) => {
              const { text, excluded } = parseFeatureLine(feature);
              return (
                <li key={`more-${index}`} className={excluded ? "excluded" : undefined}>
                  {text}
                </li>
              );
            })}
          </div>
        </ul>
        {moreFeatures.length > 0 && (
          <a
            href="#"
            className="delegate-pass-footer-link"
            onClick={(event) => {
              event.preventDefault();
              setExpanded((value) => !value);
            }}
          >
            {expanded ? "Show Less" : moreLabel}
          </a>
        )}
      </div>
    </div>
  );
}
