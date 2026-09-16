"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function formatCurrency(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

const badgeClassByStatus = {
  paid: "bg-label-success",
  pending: "bg-label-warning",
  failed: "bg-label-danger",
};

function StatCard({ icon, iconBg, label, value, sub }) {
  return (
    <div className="col-sm-6 col-lg-3 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex align-items-start justify-content-between mb-2">
            <span className="card-stat-icon text-white" style={{ background: iconBg }}>
              <i className={`bx ${icon}`}></i>
            </span>
          </div>
          <span className="d-block text-muted mb-1">{label}</span>
          <h3 className="card-title mb-0">{value}</h3>
          {sub && <small className="text-muted">{sub}</small>}
        </div>
      </div>
    </div>
  );
}

function RegistrationsChart({ timeseries }) {
  const chartRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function tryRender(attempts = 0) {
      if (cancelled) return;
      if (typeof window === "undefined" || !window.ApexCharts) {
        if (attempts < 40) setTimeout(() => tryRender(attempts + 1), 100);
        return;
      }
      if (!chartRef.current) return;

      const options = {
        chart: { type: "area", height: 300, toolbar: { show: false }, fontFamily: "inherit" },
        series: [{ name: "Registrations", data: timeseries.map((point) => point.registrations) }],
        xaxis: {
          categories: timeseries.map((point) => point.day.slice(5)),
          labels: { style: { fontSize: "11px" } },
        },
        colors: ["#0ea472"],
        stroke: { curve: "smooth", width: 2 },
        fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05 } },
        dataLabels: { enabled: false },
        grid: { borderColor: "#eceef1" },
        tooltip: { y: { formatter: (value) => `${value} registration${value === 1 ? "" : "s"}` } },
      };

      if (instanceRef.current) {
        instanceRef.current.updateOptions(options);
      } else {
        instanceRef.current = new window.ApexCharts(chartRef.current, options);
        instanceRef.current.render();
      }
    }

    tryRender();

    return () => {
      cancelled = true;
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeseries]);

  return <div ref={chartRef}></div>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) throw new Error(result.message);
        setData(result);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <p>Loading...</p>;

  const totals = data.totals || {};

  return (
    <div>
      <h4 className="fw-bold mb-4">Dashboard</h4>

      <div className="row">
        <StatCard icon="bx-id-card" iconBg="#0ea472" label="Delegate registrations" value={totals.registrationCount || 0} sub={`${totals.delegateCount || 0} delegates`} />
        <StatCard icon="bx-check-shield" iconBg="#28a745" label="Revenue collected" value={formatCurrency(totals.revenuePaid)} sub={`${totals.paidCount || 0} paid`} />
        <StatCard icon="bx-time-five" iconBg="#f0ad4e" label="Pending amount" value={formatCurrency(totals.revenuePending)} sub={`${totals.pendingCount || 0} pending`} />
        <StatCard icon="bx-user-check" iconBg="#0dcaf0" label="Visitor registrations" value={data.visitorTotals?.visitorCount || 0} sub={`${totals.failedCount || 0} payments failed`} />
      </div>

      <div className="row">
        <div className="col-12 col-lg-8 mb-4">
          <div className="card h-100">
            <h5 className="card-header">Registrations - last 14 days</h5>
            <div className="card-body">
              <RegistrationsChart timeseries={data.timeseries} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4 mb-4">
          <div className="card h-100">
            <h5 className="card-header">Revenue by pass type</h5>
            <div className="card-body">
              {data.byPassType.length === 0 && <p className="text-muted mb-0">No registrations yet.</p>}
              {data.byPassType.map((row) => (
                <div key={row.passName} className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="d-block fw-semibold">{row.passName}</span>
                    <small className="text-muted">
                      {row.registrations} registrations · {row.delegates} delegates
                    </small>
                  </div>
                  <span className="fw-bold">{formatCurrency(row.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-lg-7 mb-4">
          <div className="card h-100">
            <h5 className="card-header">Recent delegate registrations</h5>
            <div className="table-responsive">
              <table className="table table-borderless">
                <thead>
                  <tr>
                    <th>Pass</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentRegistrations.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <Link href={`/admin/registrations/${row.id}`}>{row.passName}</Link>
                      </td>
                      <td>{row.quantity}</td>
                      <td>{formatCurrency(row.totalAmount)}</td>
                      <td>
                        <span className={`badge ${badgeClassByStatus[row.paymentStatus] || "bg-label-secondary"}`}>{row.paymentStatus}</span>
                      </td>
                    </tr>
                  ))}
                  {data.recentRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-muted">
                        No registrations yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5 mb-4">
          <div className="card h-100">
            <h5 className="card-header">Recent visitor registrations</h5>
            <div className="table-responsive">
              <table className="table table-borderless">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Organisation</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentVisitors.map((row) => (
                    <tr key={row.id}>
                      <td>
                        {row.firstName} {row.lastName}
                      </td>
                      <td>{row.organisation}</td>
                    </tr>
                  ))}
                  {data.recentVisitors.length === 0 && (
                    <tr>
                      <td colSpan={2} className="text-muted">
                        No visitor registrations yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
