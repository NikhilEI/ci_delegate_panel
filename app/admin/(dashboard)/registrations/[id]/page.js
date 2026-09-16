"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import LoadingState from "@/components/admin/LoadingState";

function formatCurrency(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

export default function AdminRegistrationDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [registration, setRegistration] = useState(null);
  const [persons, setPersons] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch(`/api/admin/registrations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message);
        setRegistration(data.registration);
        setPersons(data.persons);
        setPaymentStatus(data.registration.paymentStatus);
        setPaymentNotes(data.registration.paymentNotes || "");
      })
      .catch((err) => setLoadError(err.message));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function validate() {
    const errors = {};
    if (!["pending", "paid", "failed"].includes(paymentStatus)) errors.paymentStatus = "Choose a valid status.";
    if (paymentNotes.length > 500) errors.paymentNotes = "Notes must be 500 characters or fewer.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave(event) {
    event.preventDefault();
    setFormMessage("");
    setFormSuccess("");
    if (!validate()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus, paymentNotes: paymentNotes.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not save changes.");
      setFormSuccess("Saved.");
      load();
    } catch (error) {
      setFormMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loadError)
    return (
      <div className="alert alert-danger" role="alert">
        {loadError}
      </div>
    );
  if (!registration) return <LoadingState label="Loading registration..." />;

  const subtotal = registration.pricePerDelegate * registration.quantity;

  return (
    <div>
      <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => router.push("/admin/registrations")}>
        <i className="bx bx-arrow-back me-1"></i> Back to registrations
      </button>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            Registration #{registration.id} <span className="text-muted fw-normal">- {registration.passName}</span>
          </h4>
          <span className="text-muted" style={{ fontSize: 13 }}>
            Created {new Date(registration.createdAt).toLocaleString("en-IN")}
          </span>
        </div>
        <StatusBadge status={registration.paymentStatus} />
      </div>

      <div className="row">
        <div className="col-12 col-lg-8 mb-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className="bx bx-group"></i> Delegates ({persons.length})
              </h5>
            </div>
            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Email</th>
                    <th>Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {persons.map((person) => (
                    <tr key={person.position}>
                      <td className="text-muted">{person.position}</td>
                      <td className="fw-semibold">
                        {person.title} {person.firstName} {person.lastName}
                      </td>
                      <td>{person.designation}</td>
                      <td>{person.email}</td>
                      <td>{person.mobile}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className="bx bx-buildings"></i> Company
              </h5>
            </div>
            <div className="card-body">
              <p className="mb-1 fw-semibold">{registration.organisation}</p>
              <p className="mb-2 text-muted">
                {registration.address}, {registration.city}, {registration.state}, {registration.country} - {registration.zipcode}
              </p>
              <div className="d-flex flex-wrap gap-4" style={{ fontSize: 13.5 }}>
                {registration.gstNumber && (
                  <span>
                    <span className="text-muted">GST:</span> {registration.gstNumber}
                  </span>
                )}
                {registration.trackOfInterest && (
                  <span>
                    <span className="text-muted">Track of interest:</span> {registration.trackOfInterest}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className="bx bx-credit-card"></i> Payment
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: 14 }}>
                <span className="text-muted">
                  {registration.quantity} × {formatCurrency(registration.pricePerDelegate)}
                </span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {registration.discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: 14, color: "#166534" }}>
                  <span>Promo {registration.promoCode}</span>
                  <span>-{formatCurrency(registration.discountAmount)}</span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-semibold">Total</span>
                <span className="fw-bold" style={{ fontSize: 17 }}>
                  {formatCurrency(registration.totalAmount)}
                </span>
              </div>
              <p className="mb-1 text-muted" style={{ fontSize: 13 }}>
                Razorpay order: {registration.razorpayOrderId || "-"}
              </p>
              <p className="mb-0 text-muted" style={{ fontSize: 13 }}>
                Razorpay payment: {registration.razorpayPaymentId || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className="bx bx-edit-alt"></i> Update Payment Status
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSave} noValidate>
                <div className="mb-3">
                  <label htmlFor="payment-status" className="form-label">
                    Status
                  </label>
                  <select
                    id="payment-status"
                    className={`form-select${fieldErrors.paymentStatus ? " is-invalid" : ""}`}
                    value={paymentStatus}
                    onChange={(event) => setPaymentStatus(event.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                  {fieldErrors.paymentStatus && <div className="invalid-feedback d-block">{fieldErrors.paymentStatus}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="payment-notes" className="form-label">
                    Notes (e.g. bank transfer reference)
                  </label>
                  <textarea
                    id="payment-notes"
                    className={`form-control${fieldErrors.paymentNotes ? " is-invalid" : ""}`}
                    rows={4}
                    maxLength={500}
                    value={paymentNotes}
                    onChange={(event) => setPaymentNotes(event.target.value)}
                  />
                  {fieldErrors.paymentNotes && <div className="invalid-feedback d-block">{fieldErrors.paymentNotes}</div>}
                </div>

                {formMessage && (
                  <div className="alert alert-danger py-2" role="alert">
                    {formMessage}
                  </div>
                )}
                {formSuccess && (
                  <div className="alert alert-success py-2" role="alert">
                    {formSuccess}
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </form>
              {registration.paymentUpdatedAt && (
                <p className="text-muted mt-3 mb-0" style={{ fontSize: 12 }}>
                  Last manually updated {new Date(registration.paymentUpdatedAt).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
