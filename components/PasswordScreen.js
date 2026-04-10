// components/PasswordScreen.js
// The first screen students see — they must enter the correct password to access lectures.
// Password is verified on the server (via API route), never exposed in the browser.

"use client";

import { useState } from "react";

// Props:
//   onSuccess — function to call when the correct password is entered
export default function PasswordScreen({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); // Prevent page refresh on form submit
    setLoading(true);
    setError("");

    try {
      // Call the server-side API route to check the password
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, role: "student" }),
      });

      const data = await res.json();

      if (data.success) {
        // Password correct — call parent's onSuccess to unlock the site
        onSuccess();
      } else {
        setError("Incorrect password. Please try again.");
        setPassword(""); // Clear the input
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌿</div>
          <h1 className="text-3xl font-bold text-green-800">BIOwithTB</h1>
          <p className="text-green-600 mt-2 text-sm">Biology Lecture Notes</p>
        </div>

        {/* Password form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Enter Password</h2>
          <p className="text-slate-500 text-sm mb-6">Enter the class password to access lectures</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              required
              autoFocus
            />

            {/* Error message shown if wrong password */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span> Checking...
                </span>
              ) : (
                "Enter"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
