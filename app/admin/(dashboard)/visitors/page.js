"use client";

import { useEffect, useState } from "react";

export default function AdminVisitorsPage() {
  const [rows, setRows] = useState([]);
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
      <h4 className="fw-bold mb-4">Visitor Registrations</h4>

      <div className="card">
        <div className="card-header">
          <input
            type="text"
            className="form-control"
            placeholder="Search name, email, mobile, organisation"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            style={{ maxWidth: 340 }}
          />
        </div>

        {error && (
          <div className="alert alert-danger m-3" role="alert">
            {error}
          </div>
        )}

        <div className="table-responsive">
          <table className="table">
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
                  <td>#{row.id}</td>
                  <td>
                    {row.title} {row.firstName} {row.lastName}
                  </td>
                  <td>{row.organisation}</td>
                  <td>{row.designation}</td>
                  <td>{row.email}</td>
                  <td>{row.mobile}</td>
                  <td>{row.city}</td>
                  <td>{row.objectiveOfVisit}</td>
                  <td>{new Date(row.createdAt).toLocaleString("en-IN")}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-muted text-center py-4">
                    No visitor registrations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer d-flex justify-content-between align-items-center">
          <span className="text-muted">
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="btn-group">
            <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <button className="btn btn-outline-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
