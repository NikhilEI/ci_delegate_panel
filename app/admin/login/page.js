"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!/^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not log in.");
      }
      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-bg container-xxl">
      <div className="authentication-wrapper authentication-basic container-p-y">
        <div className="authentication-inner">
          <div className="card">
            <div className="card-body">
              <div className="app-brand justify-content-center mb-4">
                <span className="app-brand-link gap-2 d-flex align-items-center">
                  <span
                    className="d-flex align-items-center justify-content-center rounded"
                    style={{ width: 40, height: 40, background: "#0ea472", color: "#fff" }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </span>
                  <span className="app-brand-text demo text-body fw-bolder">Convergence Admin</span>
                </span>
              </div>

              <h4 className="mb-2">Welcome back 👋</h4>
              <p className="mb-4">Sign in to manage registrations, payments and pass types.</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="admin-email" className="form-label">
                    Email
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    className={`form-control${errors.email ? " is-invalid" : ""}`}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="username"
                    autoFocus
                  />
                  {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                </div>

                <div className="mb-3 form-password-toggle">
                  <label htmlFor="admin-password" className="form-label">
                    Password
                  </label>
                  <div className="input-group input-group-merge">
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      className={`form-control${errors.password ? " is-invalid" : ""}`}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                    />
                    <span className="input-group-text cursor-pointer" onClick={() => setShowPassword((value) => !value)}>
                      <i className={`bx ${showPassword ? "bx-show" : "bx-hide"}`}></i>
                    </span>
                  </div>
                  {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                </div>

                {formError && (
                  <div className="alert alert-danger py-2" role="alert">
                    {formError}
                  </div>
                )}

                <div className="mb-3">
                  <button className="btn btn-primary d-grid w-100" type="submit" disabled={submitting}>
                    {submitting ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
