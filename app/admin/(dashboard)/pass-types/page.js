"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import PassCard from "@/components/registration/PassCard";

const PAGE_SIZE = 10;

const badgeOptions = [
  { value: "delegate-pass-platinum", label: "Platinum (purple)" },
  { value: "delegate-pass-gold", label: "Gold (amber)" },
  { value: "delegate-pass-silver", label: "Silver (grey)" },
];

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function emptyForm() {
  return {
    id: null,
    slug: "",
    name: "",
    price: "",
    badgeClass: "delegate-pass-platinum",
    baseFeatures: "",
    moreFeatures: "",
    sortOrder: "0",
    isActive: true,
  };
}

function toFormState(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: String(row.price),
    badgeClass: row.badgeClass,
    baseFeatures: (row.baseFeatures || []).join("\n"),
    moreFeatures: (row.moreFeatures || []).join("\n"),
    sortOrder: String(row.sortOrder),
    isActive: Boolean(row.isActive),
  };
}

function validate(form) {
  const errors = {};
  if (!form.slug.trim() || !slugPattern.test(form.slug.trim())) errors.slug = "Lowercase letters, numbers and hyphens only (e.g. platinum-delegate-passes).";
  if (!form.name.trim()) errors.name = "Name is required.";
  const priceNumber = Number(form.price);
  if (!Number.isInteger(priceNumber) || priceNumber < 0) errors.price = "Enter a whole number of rupees.";
  const baseFeaturesList = form.baseFeatures.split("\n").map((line) => line.trim()).filter(Boolean);
  if (baseFeaturesList.length === 0) errors.baseFeatures = "Add at least one included feature (one per line).";
  const sortOrderNumber = Number(form.sortOrder);
  if (!Number.isInteger(sortOrderNumber) || sortOrderNumber < 0) errors.sortOrder = "Enter a whole number.";
  return errors;
}

export default function AdminPassTypesPage() {
  const [rows, setRows] = useState(null);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [fieldErrors, setFieldErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/admin/pass-types")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message);
        setRows(data.rows);
      })
      .catch((err) => setLoadError(err.message));
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
      slug: form.slug.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      badgeClass: form.badgeClass,
      baseFeatures: form.baseFeatures.split("\n").map((line) => line.trim()).filter(Boolean),
      moreFeatures: form.moreFeatures.split("\n").map((line) => line.trim()).filter(Boolean),
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      const url = form.id ? `/api/admin/pass-types/${form.id}` : "/api/admin/pass-types";
      const method = form.id ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not save pass type.");
      setForm(emptyForm());
      load();
    } catch (error) {
      setFormMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    if (!confirm(`Delete "${row.name}"? This does not affect past registrations, only the public pricing page.`)) return;
    try {
      const response = await fetch(`/api/admin/pass-types/${row.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not delete pass type.");
      load();
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div>
      <PageHeader icon="bx-purchase-tag-alt" title="Pass Types" subtitle="Drives the pricing cards on the public homepage - edits here go live immediately." />

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
                <i className="bx bx-list-ul"></i> All Pass Types
              </h5>
            </div>
            {rows === null ? (
              <LoadingState label="Loading pass types..." />
            ) : (
              <div className="table-responsive admin-scroll-table">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Name</th>
                      <th>Slug</th>
                      <th>Price</th>
                      <th>Active</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.map((row) => (
                      <tr key={row.id}>
                        <td className="text-muted">{row.sortOrder}</td>
                        <td className="text-nowrap fw-semibold">{row.name}</td>
                        <td className="text-muted text-truncate" style={{ maxWidth: 160, fontSize: 12.5 }} title={row.slug}>
                          {row.slug}
                        </td>
                        <td className="fw-semibold">₹{row.price.toLocaleString("en-IN")}</td>
                        <td>{row.isActive ? <span className="badge bg-label-success">Yes</span> : <span className="badge bg-label-secondary">No</span>}</td>
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {rows?.length === 0 && <EmptyState icon="bx-purchase-tag-alt" title="No pass types yet" subtitle="Add one on the right." />}
            {rows && rows.length > 0 && <Pagination page={currentPage} totalPages={totalPages} total={rows.length} onPageChange={setPage} label="pass types" />}
          </div>
        </div>

        <div className="col-12 col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className={`bx ${form.id ? "bx-edit-alt" : "bx-plus-circle"}`}></i> {form.id ? `Edit: ${form.name}` : "Add a New Pass Type"}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="pt-slug" className="form-label">
                    Slug (used in the URL)
                  </label>
                  <input
                    id="pt-slug"
                    type="text"
                    className={`form-control${fieldErrors.slug ? " is-invalid" : ""}`}
                    value={form.slug}
                    onChange={(e) => set("slug", e.target.value)}
                    placeholder="platinum-delegate-passes"
                  />
                  {fieldErrors.slug && <div className="invalid-feedback d-block">{fieldErrors.slug}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="pt-name" className="form-label">
                    Name
                  </label>
                  <input id="pt-name" type="text" className={`form-control${fieldErrors.name ? " is-invalid" : ""}`} value={form.name} onChange={(e) => set("name", e.target.value)} />
                  {fieldErrors.name && <div className="invalid-feedback d-block">{fieldErrors.name}</div>}
                </div>

                <div className="row">
                  <div className="col-6 mb-3">
                    <label htmlFor="pt-price" className="form-label">
                      Price (₹)
                    </label>
                    <input id="pt-price" type="number" min="0" className={`form-control${fieldErrors.price ? " is-invalid" : ""}`} value={form.price} onChange={(e) => set("price", e.target.value)} />
                    {fieldErrors.price && <div className="invalid-feedback d-block">{fieldErrors.price}</div>}
                  </div>
                  <div className="col-6 mb-3">
                    <label htmlFor="pt-sort" className="form-label">
                      Sort order
                    </label>
                    <input id="pt-sort" type="number" min="0" className={`form-control${fieldErrors.sortOrder ? " is-invalid" : ""}`} value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
                    {fieldErrors.sortOrder && <div className="invalid-feedback d-block">{fieldErrors.sortOrder}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="pt-badge" className="form-label">
                    Card style
                  </label>
                  <select id="pt-badge" className="form-select" value={form.badgeClass} onChange={(e) => set("badgeClass", e.target.value)}>
                    {badgeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="pt-base" className="form-label">
                    Included features (one per line)
                  </label>
                  <textarea id="pt-base" className={`form-control${fieldErrors.baseFeatures ? " is-invalid" : ""}`} rows={5} value={form.baseFeatures} onChange={(e) => set("baseFeatures", e.target.value)} />
                  {fieldErrors.baseFeatures && <div className="invalid-feedback d-block">{fieldErrors.baseFeatures}</div>}
                  <div className="form-text">
                    Wrap a line in <code>~~like this~~</code> to show it greyed-out and struck-through instead - useful for listing a perk this pass
                    doesn&apos;t include, matching convergenceindia.org&apos;s comparison-style cards.
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="pt-more" className="form-label">
                    &quot;View all features&quot; extras (one per line, optional)
                  </label>
                  <textarea id="pt-more" className="form-control" rows={5} value={form.moreFeatures} onChange={(e) => set("moreFeatures", e.target.value)} />
                  <div className="form-text">
                    Same <code>~~like this~~</code> convention works here too.
                  </div>
                </div>

                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" role="switch" id="pt-active" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                  <label className="form-check-label" htmlFor="pt-active">
                    Visible on the public site
                  </label>
                </div>

                {formMessage && (
                  <div className="alert alert-danger py-2" role="alert">
                    {formMessage}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : form.id ? "Save changes" : "Add pass type"}
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

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className="bx bx-show"></i> Live Preview
              </h5>
              <span className="text-muted" style={{ fontSize: 12.5 }}>
                Exactly how this card renders on the homepage - updates as you type.
              </span>
            </div>
            <div className="card-body" style={{ background: "#f4f4f7" }}>
              <div style={{ maxWidth: 300 }}>
                <PassCard
                  modifierClass={form.badgeClass}
                  title={form.name || "Pass name"}
                  price={Number(form.price) || 0}
                  ctaHref="#"
                  disableCta
                  baseFeatures={form.baseFeatures.split("\n").map((line) => line.trim()).filter(Boolean)}
                  moreFeatures={form.moreFeatures.split("\n").map((line) => line.trim()).filter(Boolean)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
