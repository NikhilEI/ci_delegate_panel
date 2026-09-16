import Script from "next/script";
import AdminHtmlClass from "@/components/admin/AdminHtmlClass";

export const metadata = {
  title: "Admin - Convergence India",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminHtmlClass />

      <link rel="stylesheet" href="/admin-theme/css/public-sans.css" />
      <link rel="stylesheet" href="/admin-theme/fonts/boxicons.css" />
      <link rel="stylesheet" href="/admin-theme/css/core.css" />
      <link rel="stylesheet" href="/admin-theme/css/theme-default.css" />
      <link rel="stylesheet" href="/admin-theme/css/demo.css" />
      <link rel="stylesheet" href="/admin-theme/libs/perfect-scrollbar/perfect-scrollbar.css" />
      <link rel="stylesheet" href="/admin-theme/libs/apex-charts/apex-charts.css" />
      <link rel="stylesheet" href="/admin-theme/css/pages/page-auth.css" />
      <link rel="stylesheet" href="/css/admin-custom.css" />

      {children}

      <Script src="/admin-theme/libs/perfect-scrollbar/perfect-scrollbar.js" strategy="afterInteractive" />
      <Script src="/admin-theme/libs/apex-charts/apexcharts.js" strategy="afterInteractive" />
    </>
  );
}
