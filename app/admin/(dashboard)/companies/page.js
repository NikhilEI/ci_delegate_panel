"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";

export default function AdminCompaniesPage() {
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const pageSize = 10;

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);

    fetch(`/api/admin/companies?${params.toString()}`)
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
      <PageHeader icon="bx-buildings" title="Companies" subtitle="Every organisation that has a delegate or visitor registration, rolled up." />

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
                placeholder="Search company"
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
          <LoadingState label="Loading companies..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Delegates</th>
                  <th>Visitors</th>
                  <th>Registrations</th>
                  <th>Revenue</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="fw-semibold">{row.name}</td>
                    <td>{row.delegateCount}</td>
                    <td>{row.visitorCount}</td>
                    <td>{row.registrations}</td>
                    <td>₹{Number(row.revenue).toLocaleString("en-IN")}</td>
                    <td className="text-end">
                      <Link href={`/admin/companies/${row.id}`} className="btn btn-sm btn-outline-primary">
                        View <i className="bx bx-chevron-right"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rows?.length === 0 && <EmptyState icon="bx-buildings" title="No companies found" subtitle="Try a different search." />}
        {rows && rows.length > 0 && <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} label="companies" />}
      </div>
    </div>
  );
}
