// app/admin/page.js
// This is the ADMIN PAGE — only accessible with the admin password.
// Shows the dashboard for uploading, managing lectures and chapters.

"use client";

import { useState } from "react";
import Link from "next/link";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  // Track whether the admin has logged in
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Track the password input value
  const [password, setPassword] = useState("");

  // Track error message
  const [error, setError] = useState("");

  // Track loading state while checking password
  const [loading, setLoading] = useState(false);

  // Handle admin login form submission
  async function handleAdminLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call our secure API route to verify the password
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, role: "admin" }),
      });

      const data = await res.json();

      if (data.success) {
        setIsAdminLoggedIn(true);
      } else {
        setError("Wrong password. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // If admin is logged in, show the dashboard
  if (isAdminLoggedIn) {
    return <AdminDashboard onLogout={() => setIsAdminLoggedIn(false)} />;
  }

  // Otherwise show the admin login form
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Back to home link */}
        <Link
          href="/"
          className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1 w-fit"
        >
          ← Back to home
        </Link>

        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          {/* Admin icon */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
            <p className="text-slate-400 text-sm mt-1">Enter admin password to continue</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              required
            />

            {/* Show error if password is wrong */}
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? "Checking..." : "Enter Admin Panel"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
