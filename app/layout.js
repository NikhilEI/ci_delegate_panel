import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Convergence India - Delegate Registration",
  description:
    "Hurry up, register yourself as a visitor for the most advanced 3-day show and loads of fun conferences that surround it before all the slots are filled. You can find the registration form and process here.",
  keywords: "Convergence India Delegate, Delegate Registration, Delegate Profile",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <link rel="stylesheet" href="/css/bootstrap-icons.min.css" />
        <link rel="stylesheet" href="/css/urbanist.css" />
        <link rel="stylesheet" href="/css/poppins.css" />
        <link rel="stylesheet" href="/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/css/fontawesome.css" />
        <link rel="stylesheet" href="/css/site.css" />
        <link rel="stylesheet" href="/css/visitor-registration.css" />
        {children}
        <Script src="/js/jquery.min.js" strategy="afterInteractive" />
        <Script src="/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
