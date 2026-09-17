"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";

const codePattern = /^[A-Z0-9_-]{3,30}$/;
const PAGE_SIZE = 10;

function emptyForm() {
  return {
    id: null,
    code: "",
    discountType: "percent",
    discountValue: "",
    passTypeId: "",
    maxUses: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
  };
}

function toFormState(row) {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discountType,
    discountValue: String(row.discountValue),
    passTypeId: row.passTypeId ? String(row.passTypeId) : "",
    maxUses: row.maxUses ? String(row.maxUses) : "",
    validFrom: row.validFrom || "",
    validUntil: row.validUntil || "",
    isActive: Boolean(row.isActive),
  };
}

function validate(form) {
  const errors = {};
  if (!form.code.trim() || !codePattern.test(form.code.trim().toUpperCase())) {
    errors.code = "3-30 characters: letters, numbers, hyphens or underscores.";
  }
  const value = Number(form.discountValue);
  if (!Number.isInteger(value) || value <= 0) errors.discountValue = "Enter a positive whole number.";
  else if (form.discountType === "percent" && value > 100) errors.discountValue = "Percent discount cannot exceed 100.";
  if (form.maxUses !== "" && (!Number.isInteger(Number(form.maxUses)) || Number(form.maxUses) < 1)) {
    errors.maxUses = "Enter a positive whole number, or leave blank for unlimited.";
  }
  if (form.validFrom && form.validUntil && form.validFrom > form.validUntil) {
    errors.validUntil = "Must be on or after the valid-from date.";
  }
  return errors;
}

function statusLabel(row) {
  const today = new Date().toISOString().slice(0, 10);
  if (!row.isActive) return { text: "Inactive", cls: "bg-label-secondary" };
  if (row.validUntil && today > row.validUntil) return { text: "Expired", cls: "bg-label-danger" };
  if (row.validFrom && today < row.validFrom) return { text: "Scheduled", cls: "bg-label-warning" };
  if (row.maxUses && row.usedCount >= row.maxUses) return { text: "Used up", cls: "bg-label-secondary" };
  return { text: "Active", cls: "bg-label-success" };
}

export default function AdminPromoCodesPage() {
  const [rows, setRows] = useState(null);
  const [page, setPage] = useState(1);
  const [passTypes, setPassTypes] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [fieldErrors, setFieldErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/admin/promo-codes")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message);
        setRows(data.rows);
      })
      .catch((err) => setLoadError(err.message));

    fetch("/api/admin/pass-types")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPassTypes(data.rows);
      })
      .catch(() => {});
  }

  useEffect(load, []);

  const totalPages = Math.max(1, Math.ceil((rows?.length || 0) / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = rows ? rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) : rows;

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormMessage("");
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      passTypeId: form.passTypeId ? Number(form.passTypeId) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      validFrom: form.validFrom || null,
      validUntil: form.validUntil || null,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      const url = form.id ? `/api/admin/promo-codes/${form.id}` : "/api/admin/promo-codes";
      const method = form.id ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not save promo code.");
      setForm(emptyForm());
      load();
    } catch (error) {
      setFormMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    if (!confirm(`Delete promo code "${row.code}"? Past registrations keep the record of it having been used.`)) return;
    try {
      const response = await fetch(`/api/admin/promo-codes/${row.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not delete promo code.");
      load();
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div>
      <PageHeader icon="bx-gift" title="Promo Codes" subtitle="Create and manage discount codes for the delegate checkout." />

      {loadError && (
        <div className="alert alert-danger" role="alert">
          {loadError}
        </div>
      )}

      <div className="row">
        <div className="col-12 col-lg-8 mb-4">
          <div className="card admin-sticky-panel">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className="bx bx-list-ul"></i> All Promo Codes
              </h5>
            </div>
            {rows === null ? (
              <LoadingState label="Loading promo codes..." />
            ) : (
              <div className="table-responsive admin-scroll-table">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Discount</th>
                      <th>Pass</th>
                      <th>Used</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.map((row) => {
                      const status = statusLabel(row);
                      return (
                        <tr key={row.id}>
                          <td className="text-nowrap fw-semibold">{row.code}</td>
                          <td className="text-nowrap">{row.discountType === "percent" ? `${row.discountValue}%` : `₹${row.discountValue.toLocaleString("en-IN")}`}</td>
                          <td>{row.passTypeName || "All passes"}</td>
                          <td>
                            {row.usedCount}
                            {row.maxUses ? ` / ${row.maxUses}` : ""}
                          </td>
                          <td>
                            <span className={`badge ${status.cls}`}>{status.text}</span>
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" onClick={() => setForm(toFormState(row))}>
                                <i className="bx bx-edit-alt"></i>
                              </button>
                              <button className="btn btn-outline-danger" onClick={() => handleDelete(row)}>
                                <i className="bx bx-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {rows?.length === 0 && <EmptyState icon="bx-gift" title="No promo codes yet" subtitle="Add one on the right." />}
            {rows && rows.length > 0 && <Pagination page={currentPage} totalPages={totalPages} total={rows.length} onPageChange={setPage} label="promo codes" />}
          </div>
        </div>

        <div className="col-12 col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className={`bx ${form.id ? "bx-edit-alt" : "bx-plus-circle"}`}></i> {form.id ? `Edit: ${form.code}` : "Add a New Promo Code"}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="pc-code" className="form-label">
                    Code
                  </label>
                  <input
                    id="pc-code"
                    type="text"
                    className={`form-control${fieldErrors.code ? " is-invalid" : ""}`}
                    value={form.code}
                    onChange={(e) => set("code", e.target.value.toUpperCase())}
                    placeholder="EARLYBIRD20"
                    style={{ textTransform: "uppercase" }}
                  />
                  {fieldErrors.code && <div className="invalid-feedback d-block">{fieldErrors.code}</div>}
                </div>

                <div className="row">
                  <div className="col-6 mb-3">
                    <label htmlFor="pc-type" className="form-label">
                      Discount type
                    </label>
                    <select id="pc-type" className="form-select" value={form.discountType} onChange={(e) => set("discountType", e.target.value)}>
                      <option value="percent">Percent off</option>
                      <option value="fixed">Fixed amount off</option>
                    </select>
                  </div>
                  <div className="col-6 mb-3">
                    <label htmlFor="pc-value" className="form-label">
                      {form.discountType === "percent" ? "Percent (%)" : "Amount (₹)"}
                    </label>
                    <input
                      id="pc-value"
                      type="number"
                      min="1"
                      max={form.discountType === "percent" ? 100 : undefined}
                      className={`form-control${fieldErrors.discountValue ? " is-invalid" : ""}`}
                      value={form.discountValue}
                      onChange={(e) => set("discountValue", e.target.value)}
                    />
                    {fieldErrors.discountValue && <div className="invalid-feedback d-block">{fieldErrors.discountValue}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="pc-pass" className="form-label">
                    Restrict to pass
                  </label>
                  <select id="pc-pass" className="form-select" value={form.passTypeId} onChange={(e) => set("passTypeId", e.target.value)}>
                    <option value="">All passes</option>
                    {passTypes.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="pc-max" className="form-label">
                    Max uses (optional)
                  </label>
                  <input id="pc-max" type="number" min="1" className={`form-control${fieldErrors.maxUses ? " is-invalid" : ""}`} value={form.maxUses} onChange={(e) => set("maxUses", e.target.value)} placeholder="Unlimited" />
                  {fieldErrors.maxUses && <div className="invalid-feedback d-block">{fieldErrors.maxUses}</div>}
                </div>

                <div className="row">
                  <div className="col-6 mb-3">
                    <label htmlFor="pc-from" className="form-label">
                      Valid from
                    </label>
                    <input id="pc-from" type="date" className="form-control" value={form.validFrom} onChange={(e) => set("validFrom", e.target.value)} />
                  </div>
                  <div className="col-6 mb-3">
                    <label htmlFor="pc-until" className="form-label">
                      Valid until
                    </label>
                    <input id="pc-until" type="date" className={`form-control${fieldErrors.validUntil ? " is-invalid" : ""}`} value={form.validUntil} onChange={(e) => set("validUntil", e.target.value)} />
                    {fieldErrors.validUntil && <div className="invalid-feedback d-block">{fieldErrors.validUntil}</div>}
                  </div>
                </div>

                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" role="switch" id="pc-active" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                  <label className="form-check-label" htmlFor="pc-active">
                    Active
                  </label>
                </div>

                {formMessage && (
                  <div className="alert alert-danger py-2" role="alert">
                    {formMessage}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : form.id ? "Save changes" : "Add promo code"}
                  </button>
                  {form.id && (
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setForm(emptyForm())}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
