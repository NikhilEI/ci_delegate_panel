"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";

function BadgeStatus({ row }) {
  if (row.checkedInAt) {
    return (
      <span className="badge bg-label-success">
        <i className="bx bx-check-circle me-1"></i>Checked in
      </span>
    );
  }
  if (row.badgeId) return <span className="badge bg-label-info">Generated</span>;
  return <span className="badge bg-label-warning">Not generated</span>;
}

export default function AdminVisitorsPage() {
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [generatingId, setGeneratingId] = useState(null);
  const pageSize = 20;

  function load() {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);

    fetch(`/api/admin/visitors?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message);
        setRows(data.rows);
        setTotal(data.total);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, [page, search]);

  async function generateBadge(row) {
    setGeneratingId(row.id);
    try {
      const response = await fetch("/api/admin/badges/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "visitor", id: row.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not generate badge.");
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setGeneratingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <PageHeader icon="bx-user-check" title="Visitor Registrations" subtitle={`${total} visitor${total === 1 ? "" : "s"} registered - generate or check their badge here.`} />

      <div className="card">
        <div className="card-header">
          <div className="admin-toolbar">
            <div className="input-group" style={{ width: 320 }}>
              <span className="input-group-text bg-transparent">
                <i className="bx bx-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search name, email, mobile, organisation, badge ID"
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger m-3" role="alert">
            {error}
          </div>
        )}

        {rows === null ? (
          <LoadingState label="Loading visitors..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Organisation</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>City</th>
                  <th>Registered</th>
                  <th>Badge</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="text-muted">#{row.id}</td>
                    <td className="fw-semibold text-nowrap">
                      {row.title} {row.firstName} {row.lastName}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 130 }} title={row.organisation}>
                      {row.organisation}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 150 }} title={row.email}>
                      {row.email}
                    </td>
                    <td>{row.mobile}</td>
                    <td>{row.city}</td>
                    <td className="text-muted text-nowrap">{new Date(row.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="text-nowrap">
                      <BadgeStatus row={row} />
                      {row.badgeId && <div className="text-muted mt-1" style={{ fontSize: 11 }}>{row.badgeId}</div>}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {row.badgeId && (
                          <a href={`/badges/${row.badgeId}.png`} target="_blank" rel="noreferrer" className="btn btn-outline-secondary" title="View badge">
                            <i className="bx bx-show"></i>
                          </a>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          disabled={generatingId === row.id}
                          onClick={() => generateBadge(row)}
                          title={row.badgeId ? "Regenerate badge" : "Generate badge"}
                        >
                          <i className={`bx ${generatingId === row.id ? "bx-loader-alt bx-spin" : row.badgeId ? "bx-refresh" : "bx-id-card"}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rows?.length === 0 && <EmptyState icon="bx-user-check" title="No visitor registrations found" subtitle="Try a different search." />}
        {rows && rows.length > 0 && <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} label="visitors" />}
      </div>
    </div>
  );
}
