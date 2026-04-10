// components/CreateChapter.js
// Admin panel tab: Create a new chapter under a selected class.

"use client";

import { useState } from "react";

export default function CreateChapter() {
  const [classId, setClassId] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const classes = ["9", "10", "11", "12"];

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!classId || !chapterName.trim()) {
      setError("Please select a class and enter a chapter name.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/create-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, chapterName: chapterName.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(`✅ Chapter "${chapterName.trim()}" created in Class ${classId}!`);
        setChapterName(""); // Clear name input but keep class selected
      } else {
        setError(data.error || "Failed to create chapter.");
      }
    } catch (err) {
      setError("Something went wrong: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Create New Chapter</h2>
      <p className="text-slate-400 text-sm mb-6">Add a new chapter to a class</p>

      <form onSubmit={handleCreate} className="space-y-4">
        {/* Class selector */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Class</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
            required
          >
            <option value="">— Select class —</option>
            {classes.map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>

        {/* Chapter name input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Chapter Name</label>
          <input
            type="text"
            value={chapterName}
            onChange={(e) => setChapterName(e.target.value)}
            placeholder="e.g. Cell: The Unit of Life"
            className="w-full bg-slate-700 text-white placeholder-slate-500 border border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
            required
          />
        </div>

        {/* Success */}
        {success && (
          <div className="bg-green-900/50 border border-green-700 text-green-400 rounded-xl px-4 py-3 text-sm">
            {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? "Creating..." : "Create Chapter"}
        </button>
      </form>
    </div>
  );
}
