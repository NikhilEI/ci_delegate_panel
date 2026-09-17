"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CountrySelect from "./CountrySelect";
import { titleOptions, designationOptions, objectiveOfVisitOptions, productInterestOptions } from "@/lib/registrationOptions";
import { indiaStates, indiaStatesWithCities } from "@/lib/indiaStates";

const emailPattern = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;

function StateField({ country, state, onChange }) {
  if (country === "India") {
    return (
      <select className="form-control form-select" required value={state} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select State</option>
        {indiaStates.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      type="text"
      className="form-control"
      required
      placeholder="Enter State"
      value={state}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function CityField({ state, city, onChange }) {
  const cities = indiaStatesWithCities[state];
  if (cities) {
    return (
      <select className="form-control form-select" required value={city} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select City</option>
        {cities.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      type="text"
      className="form-control"
      required
      placeholder="Enter City"
      autoComplete="off"
      maxLength={50}
      minLength={2}
      value={city}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export default function VisitorRegistrationForm() {
  const router = useRouter();
  const formRef = useRef(null);

  const [fields, setFields] = useState({
    title: "",
    firstName: "",
    lastName: "",
    organisation: "",
    designation: "",
    designationOther: "",
    department: "",
    country: "India",
    countryCode: "91",
    state: "",
    city: "",
    mobile: "",
    email: "",
    objective: "",
  });
  const [interests, setInterests] = useState({});
  const [terms, setTerms] = useState(false);
  const [terms2, setTerms2] = useState(true);

  const [otp, setOtp] = useState({
    code: "",
    verified: false,
    status: "",
    statusColor: "",
    sending: false,
    verifying: false,
    sent: false,
    timeLeft: 0,
  });
  const timerRef = useRef(null);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  function set(field, value) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  function setCountry(country) {
    setFields((current) => ({ ...current, country: country.name, countryCode: country.code, state: "", city: "" }));
  }

  function setState(state) {
    setFields((current) => ({ ...current, state, city: "" }));
  }

  const mobileMaxLength = fields.country === "India" ? 10 : 15;

  const emailValid = useMemo(() => emailPattern.test(fields.email.trim()), [fields.email]);
  const mobileValid = useMemo(() => {
    const value = fields.mobile.trim();
    if (!value) return false;
    return fields.country === "India" ? value.length === 10 : value.length >= 5;
  }, [fields.mobile, fields.country]);

  const canSendOtp = emailValid && mobileValid && !otp.sending;

  function toggleInterest(id, checked) {
    setInterests((current) => ({ ...current, [id]: checked }));
  }

  function startOtpTimer() {
    clearInterval(timerRef.current);
    let timeLeft = 120;
    setOtp((current) => ({ ...current, timeLeft }));
    timerRef.current = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        clearInterval(timerRef.current);
        setOtp((current) => ({ ...current, timeLeft: 0, sent: false }));
      } else {
        setOtp((current) => ({ ...current, timeLeft }));
      }
    }, 1000);
  }

  async function sendOtp() {
    if (!canSendOtp) return;
    setOtp((current) => ({ ...current, sending: true, status: "Sending OTP...", statusColor: "blue" }));
    try {
      const response = await fetch("/api/visitor-registrations/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fields.email.trim(), mobile: fields.mobile.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not send OTP.");
      }
      const hint = data.devOtp ? ` (dev OTP: ${data.devOtp})` : "";
      setOtp((current) => ({
        ...current,
        sending: false,
        sent: true,
        status: `${data.message}${hint}`,
        statusColor: "green",
      }));
      startOtpTimer();
    } catch (error) {
      setOtp((current) => ({ ...current, sending: false, status: error.message, statusColor: "red" }));
    }
  }

  async function verifyOtp() {
    if (!otp.code.trim()) {
      setOtp((current) => ({ ...current, status: "Enter OTP.", statusColor: "red" }));
      return;
    }
    setOtp((current) => ({ ...current, verifying: true, status: "Verifying OTP...", statusColor: "blue" }));
    try {
      const response = await fetch("/api/visitor-registrations/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fields.email.trim(), mobile: fields.mobile.trim(), otp: otp.code.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not verify OTP.");
      }
      clearInterval(timerRef.current);
      setOtp((current) => ({
        ...current,
        verifying: false,
        verified: true,
        status: data.message,
        statusColor: "green",
        timeLeft: 0,
      }));
    } catch (error) {
      setOtp((current) => ({ ...current, verifying: false, status: error.message, statusColor: "red" }));
    }
  }

  function formatTimer(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `Resend available in ${m}:${s}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = formRef.current;

    if (!otp.verified) {
      setOtp((current) => ({ ...current, status: "Please verify your OTP before submitting.", statusColor: "red" }));
      form.querySelector("#visitor-email")?.focus();
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const oneInterestChecked = Object.values(interests).some(Boolean);
    if (!oneInterestChecked) {
      setFormMessage("Please specify your product interest.");
      return;
    }

    if (!terms) {
      setFormMessage("Please accept the Terms and Conditions.");
      return;
    }

    setFormMessage("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/visitor-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          designationOther: fields.designation === "Other" ? fields.designationOther : undefined,
          interests,
          termsAccepted: terms,
          marketingConsent: terms2,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not submit registration.");
      }
      if (data.badgeId) {
        // The badge is generated instantly and only ever shown on its own
        // page (not inline here) - send the visitor straight there.
        router.push(`/visitor-registration/badge?id=${encodeURIComponent(data.badgeId)}`);
        return;
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setFormMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="section-padding-inner">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="exhibitor-profile-form-main" style={{ padding: 40, textAlign: "center" }}>
                <h2 className="exhibitor-profile-left-heading mb-3">Thank you, {fields.firstName || "Visitor"}!</h2>
                <p>Your visitor registration has been received and saved.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding-inner">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-12">
            <div className="exhibitor-profile-left-heading text-center">Visitor Registration</div>
            <div className="exhibitor-profile-left-para text-center">
              <p>
                Step into India&apos;s biggest technology expo. Connect with innovators, thought leaders and global brands showcasing emerging
                trends in 6G, AI &amp; Analytics, Future Mobility, Digital Economies, Cybersecurity, Fintech, Cloud &amp; Edge &amp; more. Entry
                allowed only for <strong>Business Visitors</strong> above <strong>18 years</strong> of age. Student entry is permitted only on
                Day 3 from 12:00 PM onward.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="exhibitor-profile-form-main">
              <form ref={formRef} onSubmit={handleSubmit} noValidate>
                <div className="row">
                  <div className="col-md-4 mb-4">
                    <label className="form-label">
                      Title <span className="star-mark">*</span>
                    </label>
                    <select className="form-control form-select" required value={fields.title} onChange={(event) => set("title", event.target.value)}>
                      <option value="">-Select-</option>
                      {titleOptions.map((title) => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="form-label">
                      First Name <span className="star-mark">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      autoComplete="off"
                      maxLength={30}
                      minLength={2}
                      value={fields.firstName}
                      onChange={(event) => set("firstName", event.target.value.replace(/[^A-Za-z\s]/g, ""))}
                    />
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="form-label">
                      Last Name <span className="star-mark">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      autoComplete="off"
                      maxLength={30}
                      minLength={2}
                      value={fields.lastName}
                      onChange={(event) => set("lastName", event.target.value.replace(/[^A-Za-z\s]/g, ""))}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-4">
                    <label className="form-label">
                      Organisation<span className="star-mark">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      autoComplete="off"
                      maxLength={30}
                      minLength={2}
                      value={fields.organisation}
                      onChange={(event) => set("organisation", event.target.value)}
                    />
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="form-label">
                      Designation <span className="star-mark">*</span>
                    </label>
                    <select
                      className="form-select form-control"
                      required
                      value={fields.designation}
                      onChange={(event) => set("designation", event.target.value)}
                    >
                      <option value="">Select Designation</option>
                      {designationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {fields.designation === "Other" && (
                      <input
                        type="text"
                        className="form-control mt-2"
                        placeholder="Please specify your designation"
                        maxLength={100}
                        autoComplete="off"
                        required
                        value={fields.designationOther}
                        onChange={(event) => set("designationOther", event.target.value)}
                      />
                    )}
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      autoComplete="off"
                      maxLength={30}
                      minLength={2}
                      value={fields.department}
                      onChange={(event) => set("department", event.target.value)}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-4">
                    <label className="form-label">
                      Country <span className="star-mark">*</span>
                    </label>
                    <CountrySelect value={fields.country} onChange={setCountry} />
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="form-label">
                      State <span className="star-mark">*</span>
                    </label>
                    <StateField country={fields.country} state={fields.state} onChange={setState} />
                  </div>
                  <div className="col-md-4 mb-4">
                    <label className="form-label">
                      City <span className="star-mark">*</span>
                    </label>
                    <CityField state={fields.state} city={fields.city} onChange={(value) => set("city", value)} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-5 mb-4">
                    <div className="row">
                      <div className="col-12">
                        <label className="form-label">
                          Mobile Number <span className="star-mark">*</span>
                        </label>
                      </div>
                      <div className="col-3">
                        <input type="text" className="form-control" value={`+${fields.countryCode || ""}`} disabled />
                      </div>
                      <div className="col-9">
                        <input
                          id="visitor-mobile"
                          type="text"
                          className="form-control"
                          required
                          autoComplete="off"
                          placeholder={fields.country === "India" ? "Enter 10-digit mobile number" : "Enter mobile number"}
                          maxLength={mobileMaxLength}
                          value={fields.mobile}
                          onChange={(event) => set("mobile", event.target.value.replace(/[^0-9]/g, "").slice(0, mobileMaxLength))}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-4">
                    <label className="form-label">
                      E-Mail Id <span className="star-mark">*</span>
                    </label>
                    <input
                      id="visitor-email"
                      type="email"
                      className="form-control"
                      required
                      autoComplete="email"
                      maxLength={50}
                      minLength={2}
                      readOnly={otp.verified}
                      value={fields.email}
                      onChange={(event) => set("email", event.target.value)}
                    />
                  </div>
                  <div className="col-md-4 mb-4">
                    <div className="row">
                      <div className="col-12">
                        <label className="form-label d-none d-md-block">
                          Verify OTP on Mobile or Email id <span className="star-mark">*</span>
                        </label>
                      </div>
                      <div className="col-4">
                        <button type="button" className="btn btn-secondary" disabled={!canSendOtp} onClick={sendOtp}>
                          {otp.sending ? "Sending..." : otp.sent ? "Resend OTP" : "Send OTP"}
                        </button>
                      </div>
                      <div className="col-8">
                        <div className="d-flex align-items-center verify-white-bg">
                          <input
                            type="text"
                            className="form-control w-100"
                            placeholder="Enter OTP"
                            autoComplete="one-time-code"
                            value={otp.code}
                            onChange={(event) => setOtp((current) => ({ ...current, code: event.target.value }))}
                          />
                          <button type="button" className="btn btn-dark" onClick={verifyOtp}>
                            {otp.verifying ? "..." : "Verify"}
                          </button>
                        </div>
                      </div>
                      <div className="col-12">
                        {otp.status && (
                          <small className="d-block mt-2" style={{ color: otp.statusColor }}>
                            {otp.status}
                          </small>
                        )}
                        {otp.timeLeft > 0 && <small className="d-block text-muted">{formatTimer(otp.timeLeft)}</small>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-4">
                    <label className="form-label">
                      Objective of your visit? <span className="star-mark">*</span>
                    </label>
                    <select className="form-control form-select" required value={fields.objective} onChange={(event) => set("objective", event.target.value)}>
                      <option value="">Select an option</option>
                      {objectiveOfVisitOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row mb--3">
                  <div className="col-sm-12">
                    <label className="col-form-label form-label">
                      Please specify your product interest <span className="star-mark">*</span>
                    </label>
                  </div>
                </div>

                <div className="row align-item-center mb-4">
                  {[0, 1, 2].map((column) => (
                    <div className="col-sm-4 mb--4" key={column}>
                      {productInterestOptions.slice(column * 4, column * 4 + 4).map((option) => (
                        <div className="form-check" key={option.id}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={option.id}
                            checked={Boolean(interests[option.id])}
                            onChange={(event) => toggleInterest(option.id, event.target.checked)}
                          />
                          <label className="form-check-label" htmlFor={option.id}>
                            {" "}
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="row form-group">
                  <div className="col-sm-12">
                    <div className="disclaimer-col-txt">
                      <strong>Disclaimer</strong>
                      <br />
                      Exhibitions India is committed to protecting and respecting your privacy, and we will only use your personal information to
                      administer your account and to provide the products and services you requested from us. From time to time, we would like to
                      contact you via SMS, Email &amp; other modes of communications about our events and programs, as well as other content that
                      may be of interest to you. please check the box to continue.
                    </div>
                  </div>
                </div>

                <div className="row form-group">
                  <div className="col-sm-12">
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" required checked={terms} onChange={(event) => setTerms(event.target.checked)} />
                      <label className="form-check-label">
                        I confirm that I am 18 years of age or older and have read and agree to the{" "}
                        <a href="https://www.exhibitionsindia.com/general-terms-and-conditions.aspx" target="_blank" rel="noreferrer">
                          Terms &amp; Conditions.
                        </a>
                      </label>
                    </div>
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" checked={terms2} onChange={(event) => setTerms2(event.target.checked)} />
                      <label className="form-check-label">I consent to receive marketing communications from EI Group about its events, products and services.</label>
                    </div>
                  </div>
                </div>

                {formMessage && (
                  <div className="row">
                    <div className="col-sm-12">
                      <p style={{ color: "red" }}>{formMessage}</p>
                    </div>
                  </div>
                )}

                <div className="row form-group">
                  <div className="col-sm-12">
                    <input type="submit" value={submitting ? "Submitting..." : "Submit"} disabled={submitting} className="home-book-btn sectors-btn-book" />
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-12">
                    <strong>Note:</strong> <span className="star-mark">*</span>{" "}
                    <em>
                      Fields are mandatory
                      <br />
                      Kindly verify your email id before submitting the form
                    </em>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
