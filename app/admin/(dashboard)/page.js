"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

function formatCurrency(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

const passBarColors = ["#0ea472", "#f0ad4e", "#8592a3", "#03c3ec"];

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

  if (error)
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  if (!data) return <LoadingState label="Loading dashboard..." />;

  const totals = data.totals || {};
  const maxRevenue = Math.max(1, ...data.byPassType.map((row) => row.revenue));

  return (
    <div>
      <PageHeader icon="bx-pie-chart-alt-2" title="Dashboard" subtitle="A live snapshot of delegate and visitor registrations." />

      <div className="row">
        <StatCard icon="bx-id-card" tint="primary" label="Registrations" value={totals.registrationCount || 0} sub={`${totals.delegateCount || 0} delegates total`} />
        <StatCard icon="bx-check-shield" tint="success" label="Revenue Collected" value={formatCurrency(totals.revenuePaid)} sub={`${totals.paidCount || 0} passes paid`} />
        <StatCard icon="bx-time-five" tint="warning" label="Pending Amount" value={formatCurrency(totals.revenuePending)} sub={`${totals.pendingCount || 0} awaiting payment`} />
        <StatCard icon="bx-user-check" tint="info" label="Visitor Registrations" value={data.visitorTotals?.visitorCount || 0} sub={`${totals.failedCount || 0} payments failed`} />
      </div>

      <div className="row">
        <div className="col-12 col-lg-8 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className="bx bx-trending-up"></i> Registrations - last 14 days
              </h5>
            </div>
            <div className="card-body">
              <RegistrationsChart timeseries={data.timeseries} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className="bx bx-donate-heart"></i> Revenue by Pass Type
              </h5>
            </div>
            <div className="card-body">
              {data.byPassType.length === 0 && <EmptyState icon="bx-purchase-tag-alt" title="No registrations yet" />}
              {data.byPassType.map((row, index) => (
                <div key={row.passName} className="mb-3">
                  <div className="d-flex justify-content-between align-items-baseline mb-1">
                    <span className="fw-semibold" style={{ fontSize: 13.5 }}>
                      {row.passName}
                    </span>
                    <span className="fw-bold" style={{ fontSize: 13.5 }}>
                      {formatCurrency(row.revenue)}
                    </span>
                  </div>
                  <div className="progress" style={{ height: 6 }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${Math.max(4, Math.round((row.revenue / maxRevenue) * 100))}%`, backgroundColor: passBarColors[index % passBarColors.length] }}
                    ></div>
                  </div>
                  <small className="text-muted">
                    {row.registrations} registrations · {row.delegates} delegates
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-lg-7 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className="bx bx-id-card"></i> Recent Delegate Registrations
              </h5>
              <Link href="/admin/registrations" className="btn btn-sm btn-outline-secondary">
                View all
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
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
                        <Link href={`/admin/registrations/${row.id}`} className="fw-semibold">
                          {row.passName}
                        </Link>
                      </td>
                      <td>{row.quantity}</td>
                      <td>{formatCurrency(row.totalAmount)}</td>
                      <td>
                        <StatusBadge status={row.paymentStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.recentRegistrations.length === 0 && <EmptyState icon="bx-id-card" title="No registrations yet" />}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-header-title">
                <i className="bx bx-user-check"></i> Recent Visitors
              </h5>
              <Link href="/admin/visitors" className="btn btn-sm btn-outline-secondary">
                View all
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Organisation</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentVisitors.map((row) => (
                    <tr key={row.id}>
                      <td className="fw-semibold">
                        {row.firstName} {row.lastName}
                      </td>
                      <td className="text-muted">{row.organisation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.recentVisitors.length === 0 && <EmptyState icon="bx-user-check" title="No visitor registrations yet" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
