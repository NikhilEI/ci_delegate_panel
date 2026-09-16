"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatCurrency(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

const badgeClassByStatus = {
  paid: "bg-label-success",
  pending: "bg-label-warning",
  failed: "bg-label-danger",
};

export default function AdminRegistrationsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const pageSize = 20;

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    if (search) params.set("search", search);

    fetch(`/api/admin/registrations?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message);
        setRows(data.rows);
        setTotal(data.total);
      })
      .catch((err) => setError(err.message));
  }, [page, status, search]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h4 className="fw-bold mb-4">Delegate Registrations</h4>

      <div className="card">
        <div className="card-header d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <div className="d-flex flex-wrap gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search name, email, mobile, organisation"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              style={{ minWidth: 280 }}
            />
            <select
              className="form-select"
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value);
              }}
              style={{ maxWidth: 180 }}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
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
                <th>Pass</th>
                <th>Organisation</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>#{row.id}</td>
                  <td>
                    <Link href={`/admin/registrations/${row.id}`}>{row.passName}</Link>
                  </td>
                  <td>{row.organisation}</td>
                  <td>{row.quantity}</td>
                  <td>{formatCurrency(row.totalAmount)}</td>
                  <td>
                    <span className={`badge ${badgeClassByStatus[row.paymentStatus] || "bg-label-secondary"}`}>{row.paymentStatus}</span>
                  </td>
                  <td>{new Date(row.createdAt).toLocaleString("en-IN")}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted text-center py-4">
                    No registrations found.
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
