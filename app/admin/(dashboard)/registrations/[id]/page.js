"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  if (!registration) return <p>Loading...</p>;

  return (
    <div>
      <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => router.push("/admin/registrations")}>
        <i className="bx bx-arrow-back me-1"></i> Back to registrations
      </button>

      <h4 className="fw-bold mb-4">
        Registration #{registration.id} - {registration.passName}
      </h4>

      <div className="row">
        <div className="col-12 col-lg-8 mb-4">
          <div className="card mb-4">
            <h5 className="card-header">Delegates ({persons.length})</h5>
            <div className="table-responsive">
              <table className="table">
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
                      <td>{person.position}</td>
                      <td>
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
            <h5 className="card-header">Company</h5>
            <div className="card-body">
              <p className="mb-1">{registration.organisation}</p>
              <p className="mb-1 text-muted">
                {registration.address}, {registration.city}, {registration.state}, {registration.country} - {registration.zipcode}
              </p>
              {registration.gstNumber && <p className="mb-1">GST: {registration.gstNumber}</p>}
              {registration.trackOfInterest && <p className="mb-0">Track of interest: {registration.trackOfInterest}</p>}
            </div>
          </div>

          <div className="card">
            <h5 className="card-header">Payment</h5>
            <div className="card-body">
              <p className="mb-1">
                Amount: <strong>{formatCurrency(registration.totalAmount)}</strong> ({registration.quantity} × {formatCurrency(registration.pricePerDelegate)})
              </p>
              <p className="mb-1 text-muted">Razorpay order: {registration.razorpayOrderId || "-"}</p>
              <p className="mb-0 text-muted">Razorpay payment: {registration.razorpayPaymentId || "-"}</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4 mb-4">
          <div className="card">
            <h5 className="card-header">Update payment status</h5>
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
