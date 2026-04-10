// components/DeleteLecture.js
// Admin panel tab: Delete a single lecture from Firestore and Firebase Storage.
// Cascading selection: Class → Chapter → Lecture → Confirm delete.

"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function DeleteLecture() {
  const [classId, setClassId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [lectureId, setLectureId] = useState("");

  const [chapters, setChapters] = useState([]);
  const [lectures, setLectures] = useState([]);

  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  // Fetch lectures when chapter changes
  useEffect(() => {
    if (!classId || !chapterId) { setLectures([]); setLectureId(""); return; }
    setLoadingLectures(true);
    getDocs(query(collection(db, "classes", classId, "chapters", chapterId, "lectures"), orderBy("createdAt", "asc")))
      .then((snap) => setLectures(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(console.error)
      .finally(() => setLoadingLectures(false));
  }, [classId, chapterId]);

  async function handleDelete() {
    if (!classId || !chapterId || !lectureId) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/delete-lecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, chapterId, lectureId }),
      });

      const data = await res.json();

      if (data.success) {
        const deletedName = lectures.find((l) => l.id === lectureId)?.title || "Lecture";
        setSuccess(`✅ "${deletedName}" deleted successfully.`);
        // Remove from local list and reset selection
        setLectures((prev) => prev.filter((l) => l.id !== lectureId));
        setLectureId("");
        setConfirmDelete(false);
      } else {
        setError(data.error || "Delete failed.");
      }
    } catch (err) {
      setError("Something went wrong: " + err.message);
    } finally {
      setDeleting(false);
    }
  }

  const selectedLecture = lectures.find((l) => l.id === lectureId);

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Delete Lecture</h2>
      <p className="text-slate-400 text-sm mb-6">
        Permanently removes the lecture PDF and its record from the database.
      </p>

      <div className="space-y-4">
        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Class</label>
          <select
            value={classId}
            onChange={(e) => { setClassId(e.target.value); setChapterId(""); setLectureId(""); setSuccess(""); setError(""); }}
            className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500"
          >
            <option value="">— Select class —</option>
            {classes.map((c) => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>

        {/* Chapter */}
        {classId && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Chapter</label>
            {loadingChapters ? (
              <p className="text-slate-400 text-sm">Loading...</p>
            ) : (
              <select
                value={chapterId}
                onChange={(e) => { setChapterId(e.target.value); setLectureId(""); }}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500"
              >
                <option value="">— Select chapter —</option>
                {chapters.map((ch) => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
              </select>
            )}
          </div>
        )}

        {/* Lecture */}
        {chapterId && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Lecture</label>
            {loadingLectures ? (
              <p className="text-slate-400 text-sm">Loading...</p>
            ) : lectures.length === 0 ? (
              <p className="text-yellow-400 text-sm">No lectures in this chapter.</p>
            ) : (
              <select
                value={lectureId}
                onChange={(e) => { setLectureId(e.target.value); setConfirmDelete(false); }}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500"
              >
                <option value="">— Select lecture —</option>
                {lectures.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            )}
          </div>
        )}

        {/* Confirmation step */}
        {lectureId && !confirmDelete && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-3">
            <p className="text-red-300 text-sm mb-3">
              ⚠️ You are about to delete: <strong className="text-red-200">{selectedLecture?.title}</strong>
              <br />This will permanently remove the PDF and its record.
            </p>
            <button
              onClick={() => setConfirmDelete(true)}
              className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Yes, Delete This Lecture
            </button>
          </div>
        )}

        {/* Final delete button */}
        {confirmDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {deleting ? "Deleting..." : "🗑️ Confirm Delete"}
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
