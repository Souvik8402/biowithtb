// components/UploadLecture.js
// Admin panel tab: Upload a PDF lecture to a specific class and chapter.

"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function UploadLecture() {
  // Form state
  const [classId, setClassId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [chapterName, setChapterName] = useState(""); // needed for storage path
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  // UI state
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const classes = ["9", "10", "11", "12"];

  // Fetch chapters whenever classId changes
  useEffect(() => {
    if (!classId) {
      setChapters([]);
      setChapterId("");
      return;
    }

    async function fetchChapters() {
      setLoadingChapters(true);
      try {
        const ref = collection(db, "classes", classId, "chapters");
        const q = query(ref, orderBy("createdAt", "asc"));
        const snap = await getDocs(q);
        setChapters(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingChapters(false);
      }
    }

    fetchChapters();
  }, [classId]);

  // Update chapterName whenever chapterId changes
  useEffect(() => {
    const found = chapters.find((c) => c.id === chapterId);
    setChapterName(found ? found.name : "");
  }, [chapterId, chapters]);

  async function handleUpload(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!file || !classId || !chapterId || !title.trim()) {
      setError("Please fill in all fields and select a PDF file.");
      return;
    }

    // Only allow PDF files
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    setUploading(true);

    try {
      // Build FormData to send file + metadata to API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("classId", classId);
      formData.append("chapterId", chapterId);
      formData.append("chapterName", chapterName);
      formData.append("title", title.trim());

      const res = await fetch("/api/upload-lecture", {
        method: "POST",
        body: formData, // Note: don't set Content-Type header — browser does it automatically for FormData
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("✅ Lecture uploaded successfully!");
        // Reset the form
        setTitle("");
        setFile(null);
        // Reset file input visually
        document.getElementById("pdf-file-input").value = "";
      } else {
        setError(data.error || "Upload failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Upload Lecture PDF</h2>
      <p className="text-slate-400 text-sm mb-6">Upload a PDF and assign it to a class and chapter</p>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* Class selector */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Class</label>
          <select
            value={classId}
            onChange={(e) => { setClassId(e.target.value); setChapterId(""); }}
            className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
            required
          >
            <option value="">— Select class —</option>
            {classes.map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>

        {/* Chapter selector — only shown after class is selected */}
        {classId && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Chapter</label>
            {loadingChapters ? (
              <div className="text-slate-400 text-sm py-2">Loading chapters...</div>
            ) : chapters.length === 0 ? (
              <div className="text-yellow-400 text-sm py-2">
                No chapters yet. Create a chapter first from the "Create Chapter" tab.
              </div>
            ) : (
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
                required
              >
                <option value="">— Select chapter —</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>{ch.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Lecture title */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Lecture Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lecture 1 — Cell Structure"
            className="w-full bg-slate-700 text-white placeholder-slate-500 border border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
            required
          />
        </div>

        {/* File picker */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">PDF File</label>
          <input
            id="pdf-file-input"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="w-full bg-slate-700 text-slate-300 border border-slate-600 rounded-xl px-4 py-2.5 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-green-600 file:text-white file:text-sm file:cursor-pointer cursor-pointer"
            required
          />
          {/* Show selected file name */}
          {file && (
            <p className="text-slate-400 text-xs mt-1.5">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-900/50 border border-green-700 text-green-400 rounded-xl px-4 py-3 text-sm">
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Upload button */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {uploading ? "Uploading... Please wait" : "Upload Lecture"}
        </button>
      </form>
    </div>
  );
}
