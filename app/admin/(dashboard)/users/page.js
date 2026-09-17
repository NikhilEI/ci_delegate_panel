"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import { MODULES, ROLE_PRESETS, roleLabel } from "@/lib/permissions";

const PAGE_SIZE = 10;

function emptyForm() {
  return { id: null, name: "", email: "", password: "", role: "custom", permissions: [] };
}

function toFormState(row) {
  return { id: row.id, name: row.name, email: row.email, password: "", role: row.role, permissions: row.permissions };
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState(null);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [fieldErrors, setFieldErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/admin/users")
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

  function applyRolePreset(role) {
    setForm((current) => ({ ...current, role, permissions: ROLE_PRESETS[role]?.modules || current.permissions }));
  }

  function toggleModule(key) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(key) ? current.permissions.filter((m) => m !== key) : [...current.permissions, key],
    }));
  }

  function validate() {
    const errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) errors.name = "Enter the admin's name.";
    if (!form.email.trim()) errors.email = "Email is required.";
    if (!form.id && (!form.password || form.password.length < 8)) errors.password = "Password must be at least 8 characters.";
    if (form.password && form.password.length > 0 && form.password.length < 8) errors.password = "Password must be at least 8 characters.";
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormMessage("");
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const url = form.id ? `/api/admin/users/${form.id}` : "/api/admin/users";
      const method = form.id ? "PATCH" : "POST";
      const payload = { name: form.name.trim(), role: form.role, permissions: form.permissions };
      if (!form.id) {
        payload.email = form.email.trim();
        payload.password = form.password;
      } else if (form.password) {
        payload.password = form.password;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not save admin user.");
      setForm(emptyForm());
      load();
    } catch (error) {
      setFormMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    if (!confirm(`Delete admin "${row.name}" (${row.email})? This can't be undone.`)) return;
    try {
      const response = await fetch(`/api/admin/users/${row.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not delete admin user.");
      load();
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div>
      <PageHeader icon="bx-user-plus" title="Admin Users" subtitle="Add admin accounts and control which modules each one can access." />

      <div className="row">
        <div className="col-12 col-lg-8 mb-4">
          <div className="card admin-sticky-panel">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className="bx bx-list-ul"></i> All Admins
              </h5>
            </div>

            {loadError && (
              <div className="alert alert-danger m-3" role="alert">
                {loadError}
              </div>
            )}

            {rows === null ? (
              <LoadingState label="Loading admins..." />
            ) : (
              <div className="table-responsive admin-scroll-table">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Modules</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.map((row) => (
                      <tr key={row.id}>
                        <td className="fw-semibold text-nowrap">{row.name}</td>
                        <td className="text-nowrap">{row.email}</td>
                        <td>
                          <span className="badge bg-label-primary">{roleLabel(row.role)}</span>
                        </td>
                        <td style={{ maxWidth: 260 }}>
                          {row.role === "super_admin" ? (
                            <span className="text-muted" style={{ fontSize: 12.5 }}>
                              All modules
                            </span>
                          ) : row.permissions.length === 0 ? (
                            <span className="text-muted" style={{ fontSize: 12.5 }}>
                              None
                            </span>
                          ) : (
                            row.permissions.map((key) => (
                              <span key={key} className="badge bg-label-secondary me-1 mb-1" style={{ fontSize: 11 }}>
                                {MODULES.find((m) => m.key === key)?.label || key}
                              </span>
                            ))
                          )}
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {rows?.length === 0 && <EmptyState icon="bx-user-plus" title="No admin users yet" />}
            {rows && rows.length > 0 && <Pagination page={currentPage} totalPages={totalPages} total={rows.length} onPageChange={setPage} label="admins" />}
          </div>
        </div>

        <div className="col-12 col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className={`bx ${form.id ? "bx-edit-alt" : "bx-user-plus"}`}></i> {form.id ? `Edit: ${form.name}` : "Add a New Admin"}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="au-name" className="form-label">
                    Name
                  </label>
                  <input id="au-name" type="text" className={`form-control${fieldErrors.name ? " is-invalid" : ""}`} value={form.name} onChange={(e) => set("name", e.target.value)} />
                  {fieldErrors.name && <div className="invalid-feedback d-block">{fieldErrors.name}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="au-email" className="form-label">
                    Email
                  </label>
                  <input
                    id="au-email"
                    type="email"
                    className={`form-control${fieldErrors.email ? " is-invalid" : ""}`}
                    value={form.email}
                    disabled={Boolean(form.id)}
                    onChange={(e) => set("email", e.target.value)}
                  />
                  {fieldErrors.email && <div className="invalid-feedback d-block">{fieldErrors.email}</div>}
                  {form.id && <div className="form-text">Email can&apos;t be changed after creation.</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="au-password" className="form-label">
                    {form.id ? "New password (optional)" : "Password"}
                  </label>
                  <input
                    id="au-password"
                    type="password"
                    autoComplete="new-password"
                    className={`form-control${fieldErrors.password ? " is-invalid" : ""}`}
                    placeholder={form.id ? "Leave blank to keep current password" : ""}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                  />
                  {fieldErrors.password && <div className="invalid-feedback d-block">{fieldErrors.password}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="au-role" className="form-label">
                    Role
                  </label>
                  <select id="au-role" className="form-select" value={form.role} onChange={(e) => applyRolePreset(e.target.value)}>
                    {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
                      <option key={key} value={key}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">Picking a role pre-checks its usual modules below - adjust freely before saving.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Module access</label>
                  {form.role === "super_admin" ? (
                    <div className="text-muted" style={{ fontSize: 13 }}>
                      Super Admin always has every module.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {MODULES.map((moduleDef) => (
                        <div className="form-check" key={moduleDef.key}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`mod-${moduleDef.key}`}
                            checked={form.permissions.includes(moduleDef.key)}
                            onChange={() => toggleModule(moduleDef.key)}
                          />
                          <label className="form-check-label" htmlFor={`mod-${moduleDef.key}`}>
                            {moduleDef.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="alert alert-info py-2 px-3" style={{ fontSize: 12.5 }}>
                  Permission changes apply the next time this admin logs in, not to their current session.
                </div>

                {formMessage && (
                  <div className="alert alert-danger py-2" role="alert">
                    {formMessage}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : form.id ? "Save changes" : "Add admin"}
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
