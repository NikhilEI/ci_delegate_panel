"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";

const kindTabs = [
  { value: "all", label: "All" },
  { value: "visitor", label: "Company" },
  { value: "delegate", label: "Delegate" },
];

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Not generated" },
  { value: "generated", label: "Generated" },
  { value: "checked_in", label: "Checked in" },
];

function StatusPill(row) {
  if (row.checkedInAt) {
    return (
      <span className="badge bg-label-success">
        <i className="bx bx-check-circle me-1"></i>Checked in
      </span>
    );
  }
  if (row.badgeId) return <span className="badge bg-label-info">Generated</span>;
  if (row.kind === "delegate" && !row.eligible) return <span className="badge bg-label-secondary">Unpaid</span>;
  return <span className="badge bg-label-warning">Not generated</span>;
}

function AttendeeRow({ row, generatingKey, onGenerate }) {
  const key = `${row.kind}-${row.id}`;
  return (
    <tr>
      <td className="fw-semibold text-nowrap">{row.name}</td>
      <td className="text-nowrap">{row.passLabel}</td>
      <td className="text-muted text-nowrap">{row.badgeId || "-"}</td>
      <td>{StatusPill(row)}</td>
      <td className="text-end">
        <div className="btn-group btn-group-sm">
          {row.badgeId && (
            <a href={`/badges/${row.badgeId}.png`} target="_blank" rel="noreferrer" className="btn btn-outline-secondary">
              <i className="bx bx-show"></i>
            </a>
          )}
          <button
            type="button"
            className="btn btn-outline-primary"
            disabled={!row.eligible || generatingKey === key}
            title={!row.eligible ? "Registration must be paid before a badge can be generated" : undefined}
            onClick={() => onGenerate(row)}
          >
            {generatingKey === key ? "..." : row.badgeId ? "Regenerate" : "Generate"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function CompanyCard({ company, generatingKey, onGenerate, onGenerateAll, bulkGeneratingId }) {
  const pendingCount = [...company.delegates, ...company.visitors].filter((r) => r.eligible && !r.badgeId).length;

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-header-title">
          <i className="bx bx-buildings"></i> {company.name}
          <span className="text-muted fw-normal" style={{ fontSize: 12.5 }}>
            {company.delegates.length} delegate{company.delegates.length === 1 ? "" : "s"} · {company.visitors.length} visitor{company.visitors.length === 1 ? "" : "s"}
          </span>
        </h5>
        {pendingCount > 0 && (
          <button type="button" className="btn btn-sm btn-primary" disabled={bulkGeneratingId === company.id} onClick={() => onGenerateAll(company)}>
            {bulkGeneratingId === company.id ? "Generating..." : `Generate all (${pendingCount})`}
          </button>
        )}
      </div>

      {company.delegates.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Delegate</th>
                <th>Pass</th>
                <th>Badge ID</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {company.delegates.map((row) => (
                <AttendeeRow key={`delegate-${row.id}`} row={row} generatingKey={generatingKey} onGenerate={onGenerate} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {company.visitors.length > 0 && (
        <div className="table-responsive" style={{ borderTop: company.delegates.length > 0 ? "1px solid #eceef1" : undefined }}>
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Pass</th>
                <th>Badge ID</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {company.visitors.map((row) => (
                <AttendeeRow key={`visitor-${row.id}`} row={row} generatingKey={generatingKey} onGenerate={onGenerate} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminBadgesPage() {
  const [companies, setCompanies] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [generatingKey, setGeneratingKey] = useState("");
  const [bulkGeneratingId, setBulkGeneratingId] = useState(null);
  const pageSize = 10;

  function load() {
    const params = new URLSearchParams({ kind, status, page: String(page) });
    if (search) params.set("search", search);

    fetch(`/api/admin/badges?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message);
        setCompanies(data.companies);
        setTotal(data.total);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, [kind, status, search, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function setKindAndResetPage(value) {
    setPage(1);
    setKind(value);
  }
  function setStatusAndResetPage(value) {
    setPage(1);
    setStatus(value);
  }
  function setSearchAndResetPage(value) {
    setPage(1);
    setSearch(value);
  }

  async function generateOne(row) {
    const key = `${row.kind}-${row.id}`;
    setGeneratingKey(key);
    try {
      const response = await fetch("/api/admin/badges/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: row.kind, id: row.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not generate badge.");
    } catch (err) {
      alert(err.message);
    } finally {
      setGeneratingKey("");
      load();
    }
  }

  async function generateAllForCompany(company) {
    setBulkGeneratingId(company.id);
    const pending = [...company.delegates, ...company.visitors].filter((r) => r.eligible && !r.badgeId);
    try {
      for (const row of pending) {
        const response = await fetch("/api/admin/badges/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: row.kind, id: row.id }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || `Could not generate a badge for ${row.name}.`);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setBulkGeneratingId(null);
      load();
    }
  }

  return (
    <div>
      <PageHeader icon="bx-id-card" title="Badge Generation" subtitle="Generate scannable QR badges, grouped by company - scanning opens the check-in page." />

      <div className="card mb-4">
        <div className="card-body">
          <div className="admin-toolbar">
            <ul className="nav nav-pills" style={{ gap: 6 }}>
              {kindTabs.map((tab) => (
                <li className="nav-item" key={tab.value}>
                  <button type="button" className={`nav-link${kind === tab.value ? " active" : ""}`} onClick={() => setKindAndResetPage(tab.value)}>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            <select className="form-select" style={{ width: 170 }} value={status} onChange={(event) => setStatusAndResetPage(event.target.value)}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="input-group" style={{ width: 280 }}>
              <span className="input-group-text bg-transparent">
                <i className="bx bx-search"></i>
              </span>
              <input type="text" className="form-control" placeholder="Search company, name, or badge ID" value={search} onChange={(event) => setSearchAndResetPage(event.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {companies === null ? (
        <LoadingState label="Loading attendees..." />
      ) : companies.length === 0 ? (
        <EmptyState icon="bx-id-card" title="No attendees found" subtitle="Try a different search or filter." />
      ) : (
        <>
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} generatingKey={generatingKey} onGenerate={generateOne} onGenerateAll={generateAllForCompany} bulkGeneratingId={bulkGeneratingId} />
          ))}
          <div className="card">
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} label="companies" />
          </div>
        </>
      )}
    </div>
  );
}
