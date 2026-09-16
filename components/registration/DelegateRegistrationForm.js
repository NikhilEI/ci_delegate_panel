"use client";

import { useRef, useState } from "react";
import CountrySelect from "./CountrySelect";
import { titleOptions, designationOptions, trackOfInterestOptions } from "@/lib/registrationOptions";
import { loadRazorpayScript } from "@/lib/loadRazorpayScript";
import Alert from "@/components/Alert";

function emptyDelegate() {
  return { title: "", firstName: "", lastName: "", designation: "", designationOther: "", email: "", mobile: "" };
}

function DelegateBlock({ index, delegate, onChange }) {
  const label = index === 0 ? "Delegate 1" : `Delegate ${index + 1}`;

  function set(field, value) {
    onChange({ ...delegate, [field]: value });
  }

  return (
    <div className="delegate-form-repeat">
      <div className="row">
        <div className="col-md-12 mb-4">
          <div className="delegate-registration-no">
            <span>{label}</span>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4 mb-4">
          <label className="col-form-label">
            Title <span className="star-mark">*</span>
          </label>
          <select
            className="form-control form-select"
            required
            value={delegate.title}
            onChange={(event) => set("title", event.target.value)}
          >
            <option value="">-Select-</option>
            {titleOptions.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-4">
          <label className="col-form-label">
            First Name <span className="star-mark">*</span>
          </label>
          <input
            type="text"
            required
            autoComplete="off"
            maxLength={30}
            minLength={2}
            className="form-control"
            value={delegate.firstName}
            onChange={(event) => set("firstName", event.target.value)}
          />
        </div>
        <div className="col-md-4 mb-4">
          <label className="col-form-label">
            Last Name <span className="star-mark">*</span>
          </label>
          <input
            type="text"
            required
            autoComplete="off"
            maxLength={30}
            minLength={2}
            className="form-control"
            value={delegate.lastName}
            onChange={(event) => set("lastName", event.target.value)}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4 mb-4">
          <label className="col-form-label">
            Designation <span className="star-mark">*</span>
          </label>
          <select
            className="form-select form-control"
            required
            value={delegate.designation}
            onChange={(event) => set("designation", event.target.value)}
          >
            <option value="">Select Designation</option>
            {designationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {delegate.designation === "Other" && (
            <input
              type="text"
              className="form-control mt-2"
              placeholder="Please specify your designation"
              maxLength={100}
              autoComplete="off"
              required
              value={delegate.designationOther}
              onChange={(event) => set("designationOther", event.target.value)}
            />
          )}
        </div>
        <div className="col-md-4 mb-4">
          <label className="col-form-label">
            E-Mail Id <span className="star-mark">*</span>
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            maxLength={50}
            minLength={2}
            className="form-control"
            value={delegate.email}
            onChange={(event) => set("email", event.target.value)}
          />
        </div>
        <div className="col-md-4 mb-4">
          <div className="row">
            <div className="col-12">
              <label className="col-form-label">
                Mobile Number <span className="star-mark">*</span>
              </label>
            </div>
            <div className="col-3">
              <input type="text" className="form-control" value="+91" disabled />
            </div>
            <div className="col-9">
              <input
                type="text"
                required
                autoComplete="off"
                maxLength={15}
                placeholder="Mobile Number"
                className="form-control"
                value={delegate.mobile}
                onChange={(event) => set("mobile", event.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DelegateRegistrationForm({ qty, price, passName, slug, promoCode, discount }) {
  const formRef = useRef(null);
  const [delegates, setDelegates] = useState(() => Array.from({ length: qty }, emptyDelegate));
  const [company, setCompany] = useState({
    organisation: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    zipcode: "",
    gstNumber: "",
    trackOfInterest: "",
  });
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [paymentId, setPaymentId] = useState("");

  function updateDelegate(index, next) {
    setDelegates((current) => current.map((delegate, i) => (i === index ? next : delegate)));
  }

  function updateCompany(field, value) {
    setCompany((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = formRef.current;
    if (!terms) {
      form.reportValidity();
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setErrorMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/delegate-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passSlug: slug,
          passName,
          pricePerDelegate: price,
          quantity: qty,
          promoCode: promoCode || undefined,
          delegates: delegates.map((delegate) => ({
            ...delegate,
            designation: delegate.designation === "Other" ? delegate.designationOther : delegate.designation,
          })),
          company,
          termsAccepted: terms,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not create registration. Please try again.");
      }

      await loadRazorpayScript();

      const firstDelegate = delegates[0];
      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount * 100,
        currency: data.currency,
        name: "Convergence India Expo",
        description: `${passName} × ${qty}`,
        order_id: data.orderId,
        prefill: {
          name: `${firstDelegate.firstName} ${firstDelegate.lastName}`.trim(),
          email: firstDelegate.email,
          contact: firstDelegate.mobile,
        },
        theme: { color: "#a6f62a" },
        handler: async function onPaymentSuccess(paymentResponse) {
          try {
            const verifyResponse = await fetch("/api/delegate-registrations/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                registrationId: data.registrationId,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              }),
            });
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.message || "Payment verification failed.");
            }
            setPaymentId(paymentResponse.razorpay_payment_id);
            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (error) {
            setAlertType("error");
            setErrorMessage(error.message);
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function onDismiss() {
            setAlertType("warning");
            setErrorMessage("Payment cancelled - your details are saved, click Submit & Pay to try again whenever you're ready.");
            setSubmitting(false);
          },
        },
      });
      razorpay.on("payment.failed", function onPaymentFailed(response) {
        setAlertType("error");
        setErrorMessage(response.error?.description || "Payment failed. Please try again.");
        setSubmitting(false);
      });
      razorpay.open();
    } catch (error) {
      setAlertType("error");
      setErrorMessage(error.message);
      setSubmitting(false);
    }
  }

  const subtotal = price * qty;
  const total = Math.max(0, subtotal - (discount || 0));

  if (submitted) {
    return (
      <section className="section-padding section-delegate-pass">
        <div className="container-xxl">
          <div className="row">
            <div className="col-md-12">
              <div className="delegate-form-main-outer" style={{ padding: 40, textAlign: "center" }}>
                <h2 className="delegate-pass-title mb-3">Thank you, {delegates[0].firstName || "Delegate"}!</h2>
                <p className="delegate-pass-left-para">
                  Your registration for {qty} × {passName} (Total ₹ {total.toLocaleString("en-IN")}) is confirmed.
                </p>
                {paymentId && <p className="delegate-pass-left-para">Payment reference: {paymentId}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding section-delegate-pass">
      <div className="container-xxl">
        <div className="row align-items-center">
          <div className="col-md-12">
            <div className="delegate-pass-left-heading">Delegate Registration</div>
            <div className="delegate-pass-left-para">Please fill in the details for each pass registration</div>
          </div>
        </div>
      </div>
      <div className="container-xxl">
        <div className="row">
          <div className="col-md-12">
            <form ref={formRef} onSubmit={handleSubmit} noValidate>
              <div className="delegate-form-main-outer">
                <div className="delegate-form-header">
                  <div className="delegate-pass-container">
                    <div className="delegate-pass-left">
                      <div className="delegate-pass-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      </div>
                      <span className="delegate-pass-title">{passName} Detail</span>
                    </div>
                    <div className="delegate-pass-right text-end">
                      <span className="delegate-pass-count d-block">
                        {qty} {qty === 1 ? "Pass" : "Passes"}
                      </span>
                      {discount > 0 ? (
                        <span className="d-block" style={{ fontSize: 14, marginTop: 4 }}>
                          <span style={{ textDecoration: "line-through", opacity: 0.6 }}>₹ {subtotal.toLocaleString("en-IN")}</span>{" "}
                          <strong style={{ color: "#166534" }}>₹ {total.toLocaleString("en-IN")}</strong>
                          {promoCode && (
                            <span className="d-block" style={{ fontSize: 12, opacity: 0.75 }}>
                              Promo {promoCode} applied (-₹{discount.toLocaleString("en-IN")})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="d-block" style={{ fontSize: 14, marginTop: 4 }}>
                          ₹ {total.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {delegates.map((delegate, index) => (
                  <DelegateBlock key={index} index={index} delegate={delegate} onChange={(next) => updateDelegate(index, next)} />
                ))}

                <div className="delegate-form-repeat">
                  <div className="row">
                    <div className="col-md-12 mb-4">
                      <div className="delegate-registration-no">
                        <span>Company Information</span>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-4">
                      <label className="col-form-label">
                        Company / Organisation Name <span className="star-mark">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        maxLength={30}
                        minLength={2}
                        className="form-control"
                        value={company.organisation}
                        onChange={(event) => updateCompany("organisation", event.target.value)}
                      />
                    </div>
                    <div className="col-md-4 mb-4">
                      <label className="col-form-label">
                        Address <span className="star-mark">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        maxLength={50}
                        minLength={2}
                        className="form-control"
                        value={company.address}
                        onChange={(event) => updateCompany("address", event.target.value)}
                      />
                    </div>
                    <div className="col-md-4 mb-4">
                      <label className="col-form-label">
                        City <span className="star-mark">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        maxLength={50}
                        minLength={2}
                        className="form-control"
                        value={company.city}
                        onChange={(event) => updateCompany("city", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-4">
                      <label className="col-form-label">
                        State <span className="star-mark">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        maxLength={50}
                        minLength={2}
                        className="form-control"
                        value={company.state}
                        onChange={(event) => updateCompany("state", event.target.value)}
                      />
                    </div>
                    <div className="col-md-4 mb-4">
                      <label className="col-form-label">
                        Zip Code <span className="star-mark">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        maxLength={50}
                        minLength={2}
                        className="form-control"
                        value={company.zipcode}
                        onChange={(event) => updateCompany("zipcode", event.target.value)}
                      />
                    </div>
                    <div className="col-md-4 mb-4">
                      <label className="col-form-label">
                        Country <span className="star-mark">*</span>
                      </label>
                      <CountrySelect value={company.country} onChange={(country) => updateCompany("country", country.name)} />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-4">
                      <label className="col-form-label">
                        GST Number <span className="star-mark">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your GST Number (Optional)"
                        className="form-control"
                        value={company.gstNumber}
                        onChange={(event) => updateCompany("gstNumber", event.target.value)}
                      />
                    </div>
                    <div className="col-md-4 mb-4">
                      <label className="col-form-label">
                        Track of Interest <span className="star-mark">*</span>
                      </label>
                      <select
                        className="form-control form-select"
                        required
                        value={company.trackOfInterest}
                        onChange={(event) => updateCompany("trackOfInterest", event.target.value)}
                      >
                        <option value="">Select Interest</option>
                        {trackOfInterestOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-sm-12">
                      <div className="disclaimer-col-txt">
                        <strong>Disclaimer</strong>
                        <br />
                        Exhibitions India is committed to protecting and respecting your privacy, and we will only use your personal information to
                        administer your account and to provide the products and services you requested from us. From time to time, we would like
                        to contact you about our events and programs, as well as other content that may be of interest to you. please check the
                        box to continue
                      </div>
                    </div>
                  </div>

                  <div className="row mb--4">
                    <div className="col-sm-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={terms}
                          onChange={(event) => setTerms(event.target.checked)}
                        />
                        <label className="form-check-label">I accept the Terms and Conditions.</label>
                      </div>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="row mb-3">
                      <div className="col-sm-12">
                        <Alert type={alertType} onDismiss={() => setErrorMessage("")}>
                          {errorMessage}
                        </Alert>
                      </div>
                    </div>
                  )}

                  <div className="row form--group">
                    <div className="col-sm-12 text-center">
                      <input
                        type="submit"
                        value={submitting ? "Processing..." : "Submit & Pay"}
                        disabled={submitting}
                        className="home-book-btn sectors-btn-book"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
