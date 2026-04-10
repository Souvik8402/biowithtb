// app/layout.js
// This is the root layout — it wraps ALL pages in the app.
// Think of it as the outer shell that every page sits inside.

import "./globals.css";

export const metadata = {
  title: "BIOwithTB",
  description: "Biology lecture notes by TB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
