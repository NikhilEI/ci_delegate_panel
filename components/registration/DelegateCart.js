"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function BadgeIcon() {
  return (
    <div className="delegate-pass-badge-icon">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    </div>
  );
}

function formatCurrency(amount) {
  return "INR " + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DelegateCart({ slug, modifierClass, passName, price, baseFeatures, moreFeatures, detailsHref }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);

  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState(null); // { code, discountAmount, message }
  const [promoError, setPromoError] = useState("");
  const [applying, setApplying] = useState(false);

  const subtotal = price * quantity;
  const discountAmount = promo?.discountAmount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  async function applyPromoCode() {
    if (!promoInput.trim()) return;
    setApplying(true);
    setPromoError("");
    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim(), passSlug: slug, quantity }),
      });
      const data = await response.json();
      if (!data.valid) {
        setPromo(null);
        setPromoError(data.message || "This promo code is not valid.");
        return;
      }
      setPromo({ code: data.code, discountAmount: data.discountAmount, message: data.message });
    } catch {
      setPromoError("Could not validate promo code. Please try again.");
    } finally {
      setApplying(false);
    }
  }

  function removePromoCode() {
    setPromo(null);
    setPromoInput("");
    setPromoError("");
  }

  // Re-check the applied code whenever quantity changes, since the discount
  // (especially a percentage one) depends on the subtotal.
  function updateQuantity(next) {
    setQuantity(next);
    if (promo) {
      setPromo(null);
      setPromoError("Quantity changed - please re-apply your promo code.");
    }
  }

  function continueToRegistration() {
    try {
      localStorage.setItem("delegatePassName", passName);
      localStorage.setItem("delegatePassPrice", String(price));
      localStorage.setItem("delegatePassQuantity", String(quantity));
      localStorage.setItem("delegatePassTotal", String(total));
    } catch {
      // localStorage may be unavailable (private browsing) - the query string below still carries everything needed.
    }

    const qs = new URLSearchParams({
      qty: String(quantity),
      price: String(price),
      total: String(total),
      passName,
      slug,
    });
    if (promo) {
      qs.set("promoCode", promo.code);
      qs.set("discount", String(discountAmount));
    }

    router.push(`${detailsHref}?${qs.toString()}`);
  }

  return (
    <>
      <section className="section-padding section-delegate-pass">
        <div className="container-xxl">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="delegate-pass-left-heading">Select the Number of Delegate Passes</div>
              <div className="delegate-pass-left-para">Please choose the number of delegate passes you would like to register for.</div>
            </div>
          </div>
        </div>

        <div className="container-xxl">
          <div className="row">
            <div className="col-md-6 col-sm-12 col-12">
              <div className={`delegate-pass-main-outer ${modifierClass}`}>
                <div className="delegate-ticket-card">
                  <div className="delegate-ticket-card-left">
                    <div className="delegate-ticket-card-header">
                      <BadgeIcon />
                      <h2 className="delegate-pass-title">{passName}</h2>
                    </div>

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

                      <div className="delegate-pass-footer-link" onClick={() => setExpanded((value) => !value)} style={{ cursor: "pointer" }}>
                        {expanded ? "Show Less" : `+ ${moreFeatures.length} more`}
                      </div>
                    </div>
                  </div>

                  <div className="delegate-ticket-card-right">
                    <div className="delegate-pass-price mb-2">₹ {price.toLocaleString("en-IN")}</div>

                    <div>
                      <div className="delegate-ticket-qty-label">Select Qty</div>

                      <div className="delegate-ticket-qty-selector">
                        <button
                          type="button"
                          className="qty-btn"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(Math.max(1, quantity - 1))}
                        >
                          {" "}
                          &minus;{" "}
                        </button>

                        <span className="qty-value">{quantity}</span>

                        <button type="button" className="qty-btn" aria-label="Increase quantity" onClick={() => updateQuantity(quantity + 1)}>
                          {" "}
                          +{" "}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-sm-12 col-12">
              <div className="delegate-ticket-summary-card">
                <h2 className="delegate-ticket-summary-title">Order Summary</h2>

                <div className="delegate-ticket-item-row">
                  <div className="delegate-ticket-item-details">
                    <span className="delegate-ticket-item-name">{passName}</span>
                    <span className="delegate-ticket-item-meta">
                      {quantity} {quantity === 1 ? "Quantity" : "Quantities"}
                    </span>
                  </div>

                  <div className="delegate-ticket-item-price">{formatCurrency(subtotal)}</div>
                </div>

                <div style={{ margin: "16px 0" }}>
                  {!promo ? (
                    <div className="d-flex" style={{ gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Promo code"
                        value={promoInput}
                        onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
                        className="form-control"
                        style={{ textTransform: "uppercase" }}
                        onKeyDown={(event) => event.key === "Enter" && applyPromoCode()}
                      />
                      <button type="button" className="delegate-pass-cta-button" style={{ width: "auto", padding: "0 20px", margin: 0 }} onClick={applyPromoCode} disabled={applying}>
                        {applying ? "..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between align-items-center" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px" }}>
                      <span style={{ color: "#166534", fontSize: 14 }}>
                        <strong>{promo.code}</strong> applied - {promo.message}
                      </span>
                      <a href="#" onClick={(event) => { event.preventDefault(); removePromoCode(); }} style={{ fontSize: 13, color: "#166534", textDecoration: "underline" }}>
                        Remove
                      </a>
                    </div>
                  )}
                  {promoError && <div style={{ color: "#b3261e", fontSize: 13, marginTop: 6 }}>{promoError}</div>}
                </div>

                {promo && (
                  <div className="delegate-ticket-item-row">
                    <div className="delegate-ticket-item-details">
                      <span className="delegate-ticket-item-name">Discount</span>
                    </div>
                    <div className="delegate-ticket-item-price" style={{ color: "#166534" }}>
                      -{formatCurrency(discountAmount)}
                    </div>
                  </div>
                )}

                <hr className="delegate-ticket-dashed-divider" />

                <div className="delegate-ticket-total-row">
                  <span className="delegate-ticket-total-label">Total Amount</span>
                  <span className="delegate-ticket-total-price">{formatCurrency(total)}</span>
                </div>

                <button className="delegate-pass-cta-button" type="button" onClick={continueToRegistration}>
                  Continue
                  <svg viewBox="0 0 6 10">
                    <polyline points="1 1 5 5 1 9" />
                  </svg>
                </button>

                <div className="delegate-ticket-pass-note" style={{ marginTop: 20 }}>
                  <span>
                    <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor">
                      <path d="M224 0c-17.7 0-32 14.3-32 32v19.2C119 66 64 130.6 64 208v25.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416h400c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7 33.3-6.7 45.3-18.7z" />
                    </svg>
                  </span>{" "}
                  <strong>Note</strong>
                  <ul>
                    <li>
                      Exhibitions India has no authorised pass or discount-code resellers. Please purchase passes only through our official website
                      and never make payments to third parties or personal accounts.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky-bottom-bar">
        <div className="container-xxl">
          <div className="row align-items-center">
            <div className="col-6">
              <div className="sticky-price">
                <span className="delegate-ticket-total-price">{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="col-6">
              <button className="delegate-pass-cta-button" type="button" onClick={continueToRegistration}>
                Continue
                <svg viewBox="0 0 6 10">
                  <polyline points="1 1 5 5 1 9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
