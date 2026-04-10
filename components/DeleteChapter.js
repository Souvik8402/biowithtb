// components/DeleteChapter.js
// Admin panel tab: Delete an ENTIRE chapter — removes the chapter, all its lectures,
// and all associated PDFs from Firebase Storage. This is irreversible!

"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function DeleteChapter() {
  const [classId, setClassId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lectureCount, setLectureCount] = useState(0);

  const classes = ["9", "10", "11", "12"];

  // Fetch chapters when class changes
  useEffect(() => {
    if (!classId) { setChapters([]); setChapterId(""); return; }
    setLoadingChapters(true);
    getDocs(query(collection(db, "classes", classId, "chapters"), orderBy("createdAt", "asc")))
      .then((snap) => setChapters(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(console.error)
      .finally(() => setLoadingChapters(false));
  }, [classId]);

  // Count lectures in the selected chapter (to warn the admin)
  useEffect(() => {
    if (!classId || !chapterId) { setLectureCount(0); setConfirmDelete(false); return; }

    getDocs(collection(db, "classes", classId, "chapters", chapterId, "lectures"))
      .then((snap) => setLectureCount(snap.size))
      .catch(() => setLectureCount(0));
  }, [classId, chapterId]);

  async function handleDelete() {
    if (!classId || !chapterId) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/delete-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, chapterId }),
      });

      const data = await res.json();

      if (data.success) {
        const deletedName = chapters.find((c) => c.id === chapterId)?.name || "Chapter";
        setSuccess(`✅ "${deletedName}" and all its lectures deleted successfully.`);
        // Remove from local list
        setChapters((prev) => prev.filter((c) => c.id !== chapterId));
        setChapterId("");
        setConfirmDelete(false);
        setLectureCount(0);
      } else {
        setError(data.error || "Delete failed.");
      }
    } catch (err) {
      setError("Something went wrong: " + err.message);
    } finally {
      setDeleting(false);
    }
  }

  const selectedChapter = chapters.find((c) => c.id === chapterId);

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Delete Chapter</h2>
      <p className="text-slate-400 text-sm mb-6">
        Permanently deletes a chapter AND all lectures and PDFs inside it.
      </p>

      <div className="space-y-4">
        {/* Class selector */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Class</label>
          <select
            value={classId}
            onChange={(e) => { setClassId(e.target.value); setChapterId(""); setSuccess(""); setError(""); }}
            className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500"
          >
            <option value="">— Select class —</option>
            {classes.map((c) => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>

        {/* Chapter selector */}
        {classId && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Chapter to Delete</label>
            {loadingChapters ? (
              <p className="text-slate-400 text-sm">Loading...</p>
            ) : chapters.length === 0 ? (
              <p className="text-yellow-400 text-sm">No chapters found for Class {classId}.</p>
            ) : (
              <select
                value={chapterId}
                onChange={(e) => { setChapterId(e.target.value); setConfirmDelete(false); }}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500"
              >
                <option value="">— Select chapter —</option>
                {chapters.map((ch) => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
              </select>
            )}
          </div>
        )}

        {/* Warning box with details of what will be deleted */}
        {chapterId && !confirmDelete && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-4">
            <p className="text-red-300 font-medium mb-1">⚠️ Warning — This cannot be undone!</p>
            <p className="text-red-300 text-sm mb-1">
              Chapter: <strong className="text-red-200">{selectedChapter?.name}</strong>
            </p>
            <p className="text-red-300 text-sm mb-3">
              This will permanently delete{" "}
              <strong className="text-red-200">{lectureCount} lecture{lectureCount !== 1 ? "s" : ""}</strong>{" "}
              and all their PDFs.
            </p>
            <button
              onClick={() => setConfirmDelete(true)}
              className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              I understand, Delete This Chapter
            </button>
          </div>
        )}

        {/* Final confirm */}
        {confirmDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {deleting ? "Deleting everything..." : "🗑️ Permanently Delete Chapter"}
          </button>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-700 text-green-400 rounded-xl px-4 py-3 text-sm">{success}</div>
        )}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
}
