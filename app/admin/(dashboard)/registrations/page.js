"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";

function formatCurrency(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

export default function AdminRegistrationsPage() {
  const [rows, setRows] = useState(null);
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
      <PageHeader icon="bx-id-card" title="Delegate Registrations" subtitle={`${total} registration${total === 1 ? "" : "s"} on file`} />

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
            <select
              className="form-select"
              style={{ maxWidth: 170 }}
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value);
              }}
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

        {rows === null ? (
          <LoadingState label="Loading registrations..." />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
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
                      <td className="text-muted">#{row.id}</td>
                      <td>
                        <Link href={`/admin/registrations/${row.id}`} className="fw-semibold">
                          {row.passName}
                        </Link>
                      </td>
                      <td>{row.organisation}</td>
                      <td>{row.quantity}</td>
                      <td className="fw-semibold">{formatCurrency(row.totalAmount)}</td>
                      <td>
                        <StatusBadge status={row.paymentStatus} />
                      </td>
                      <td className="text-muted">{new Date(row.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length === 0 && <EmptyState icon="bx-id-card" title="No registrations found" subtitle="Try a different search or filter." />}

            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} label="registrations" />
          </>
        )}
      </div>
    </div>
  );
}
