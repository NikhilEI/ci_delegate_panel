"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

export default function AdminVisitorsPage() {
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const pageSize = 20;

  useEffect(() => {
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
  }, [page, search]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <PageHeader icon="bx-user-check" title="Visitor Registrations" subtitle={`${total} visitor${total === 1 ? "" : "s"} registered`} />

      <div className="card">
        <div className="card-header">
          <div className="admin-toolbar">
            <div className="input-group" style={{ width: 300 }}>
              <span className="input-group-text bg-transparent">
                <i className="bx bx-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search name, email, mobile, organisation"
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
          <>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Organisation</th>
                    <th>Designation</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>City</th>
                    <th>Objective</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="text-muted">#{row.id}</td>
                      <td className="fw-semibold text-nowrap">
                        {row.title} {row.firstName} {row.lastName}
                      </td>
                      <td>{row.organisation}</td>
                      <td>{row.designation}</td>
                      <td>{row.email}</td>
                      <td>{row.mobile}</td>
                      <td>{row.city}</td>
                      <td className="text-truncate" style={{ maxWidth: 160 }} title={row.objectiveOfVisit}>
                        {row.objectiveOfVisit}
                      </td>
                      <td className="text-muted">{new Date(row.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length === 0 && <EmptyState icon="bx-user-check" title="No visitor registrations found" subtitle="Try a different search." />}

            {rows.length > 0 && (
              <div className="card-footer d-flex justify-content-between align-items-center">
                <span className="text-muted" style={{ fontSize: 13 }}>
                  Page {page} of {totalPages} · {total} total
                </span>
                <div className="btn-group">
                  <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    <i className="bx bx-chevron-left"></i> Previous
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next <i className="bx bx-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
