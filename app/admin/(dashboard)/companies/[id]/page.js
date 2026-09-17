"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import StatusBadge from "@/components/admin/StatusBadge";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 10;

function toFormState(company) {
  return {
    name: company.name || "",
    address: company.address || "",
    city: company.city || "",
    state: company.state || "",
    country: company.country || "",
    zipcode: company.zipcode || "",
    gstNumber: company.gstNumber || "",
  };
}

export default function AdminCompanyDetailPage() {
  const params = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [delegatesPage, setDelegatesPage] = useState(1);
  const [visitorsPage, setVisitorsPage] = useState(1);

  function load() {
    fetch(`/api/admin/companies/${params.id}`)
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) throw new Error(result.message);
        setData(result);
        setForm(toFormState(result.company));
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, [params.id]);

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaveMessage("");
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/companies/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not save company.");
      load();
    } catch (err) {
      setSaveMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  const delegatesTotalPages = Math.max(1, Math.ceil((data?.delegates.length || 0) / PAGE_SIZE));
  const visitorsTotalPages = Math.max(1, Math.ceil((data?.visitors.length || 0) / PAGE_SIZE));
  const pagedDelegates = data ? data.delegates.slice((delegatesPage - 1) * PAGE_SIZE, delegatesPage * PAGE_SIZE) : [];
  const pagedVisitors = data ? data.visitors.slice((visitorsPage - 1) * PAGE_SIZE, visitorsPage * PAGE_SIZE) : [];

  return (
    <div>
      <PageHeader
        icon="bx-buildings"
        title={data?.company?.name || "Company"}
        subtitle="Delegates and visitors registered under this company."
        action={
          <Link href="/admin/companies" className="btn btn-outline-secondary btn-sm">
            <i className="bx bx-arrow-back"></i> All companies
          </Link>
        }
      />

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!data && !error && <LoadingState label="Loading company detail..." />}

      {data && form && (
        <div className="row">
          <div className="col-12 col-lg-8">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-header-title">
                  <i className="bx bx-id-card"></i> Delegates ({data.delegates.length})
                </h5>
              </div>
              {data.delegates.length === 0 ? (
                <EmptyState icon="bx-id-card" title="No delegates from this company" />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Pass</th>
                        <th>Payment</th>
                        <th>Badge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedDelegates.map((d) => (
                        <tr key={d.id}>
                          <td className="fw-semibold text-nowrap">
                            {d.title} {d.firstName} {d.lastName}
                          </td>
                          <td>{d.designation}</td>
                          <td>{d.email}</td>
                          <td>{d.mobile}</td>
                          <td className="text-nowrap">{d.passName}</td>
                          <td>
                            <StatusBadge status={d.paymentStatus} />
                          </td>
                          <td className="text-nowrap">
                            {d.checkedInAt ? <span className="badge bg-label-success">Checked in</span> : d.badgeId ? <span className="badge bg-label-info">Generated</span> : <span className="text-muted">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {data.delegates.length > 0 && <Pagination page={delegatesPage} totalPages={delegatesTotalPages} total={data.delegates.length} onPageChange={setDelegatesPage} label="delegates" />}
            </div>

            <div className="card">
              <div className="card-header">
                <h5 className="card-header-title">
                  <i className="bx bx-user-check"></i> Visitors ({data.visitors.length})
                </h5>
              </div>
              {data.visitors.length === 0 ? (
                <EmptyState icon="bx-user-check" title="No visitors from this company" />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Badge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedVisitors.map((v) => (
                        <tr key={v.id}>
                          <td className="fw-semibold text-nowrap">
                            {v.title} {v.firstName} {v.lastName}
                          </td>
                          <td>{v.designation}</td>
                          <td>{v.email}</td>
                          <td>{v.mobile}</td>
                          <td className="text-nowrap">
                            {v.checkedInAt ? <span className="badge bg-label-success">Checked in</span> : v.badgeId ? <span className="badge bg-label-info">Generated</span> : <span className="text-muted">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {data.visitors.length > 0 && <Pagination page={visitorsPage} totalPages={visitorsTotalPages} total={data.visitors.length} onPageChange={setVisitorsPage} label="visitors" />}
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-header-title">
                  <i className="bx bx-edit-alt"></i> Company Details
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input type="text" className="form-control" value={form.address} onChange={(e) => set("address", e.target.value)} />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">City</label>
                      <input type="text" className="form-control" value={form.city} onChange={(e) => set("city", e.target.value)} />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label">State</label>
                      <input type="text" className="form-control" value={form.state} onChange={(e) => set("state", e.target.value)} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">Country</label>
                      <input type="text" className="form-control" value={form.country} onChange={(e) => set("country", e.target.value)} />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label">Zip Code</label>
                      <input type="text" className="form-control" value={form.zipcode} onChange={(e) => set("zipcode", e.target.value)} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">GST Number</label>
                    <input type="text" className="form-control" style={{ textTransform: "uppercase" }} value={form.gstNumber} onChange={(e) => set("gstNumber", e.target.value.toUpperCase())} />
                  </div>

                  {saveMessage && (
                    <div className="alert alert-danger py-2" role="alert">
                      {saveMessage}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
