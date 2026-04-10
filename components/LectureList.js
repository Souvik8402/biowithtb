// components/LectureList.js
// Fetches and displays all lectures (PDFs) for a selected chapter.
// Each lecture shows title, upload date, and a View/Download button.

"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

// Props:
//   classId  — selected class e.g. "9"
//   chapter  — { id, name } of the selected chapter
//   onBack   — called when student clicks Back
export default function LectureList({ classId, chapter, onBack }) {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch lectures when the component loads or chapter changes
  useEffect(() => {
    async function fetchLectures() {
      setLoading(true);
      setError("");
      try {
        // Firestore path: classes/{classId}/chapters/{chapterId}/lectures
        const lecturesRef = collection(
          db,
          "classes",
          classId,
          "chapters",
          chapter.id,
          "lectures"
        );
        // Sort by creation date — oldest first (Lecture 1 appears before Lecture 2)
        const q = query(lecturesRef, orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);

        const lectureList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLectures(lectureList);
      } catch (err) {
        console.error("Error fetching lectures:", err);
        setError("Could not load lectures. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchLectures();
  }, [classId, chapter.id]);

  // Helper to format Firestore Timestamp into a readable date string
  function formatDate(timestamp) {
    if (!timestamp) return "Date unknown";
    // Firestore timestamps have a .toDate() method
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-slate-700 transition-colors text-sm flex items-center gap-1"
        >
          ← Back
        </button>
        <div>
          <p className="text-green-600 text-sm font-medium">Class {classId}</p>
          <h2 className="text-2xl font-bold text-slate-800">{chapter.name}</h2>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-20 animate-pulse border border-slate-100" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-600">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && lectures.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📂</div>
          <p className="text-slate-500">No lectures uploaded yet for this chapter.</p>
          <p className="text-slate-400 text-sm mt-1">Check back soon!</p>
        </div>
      )}

      {/* Lecture cards */}
      {!loading && !error && lectures.length > 0 && (
        <div className="space-y-3">
          {lectures.map((lecture, index) => (
            <div
              key={lecture.id}
              className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4"
            >
              {/* PDF icon with lecture number */}
              <div className="bg-red-50 text-red-500 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                {index + 1}
              </div>

              {/* Lecture info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{lecture.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  📅 Uploaded: {formatDate(lecture.createdAt)}
                </p>
              </div>

              {/* View/Download button */}
              <a
                href={lecture.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>📄</span> View
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Lecture count */}
      {!loading && lectures.length > 0 && (
        <p className="text-slate-400 text-sm text-center mt-6">
          {lectures.length} lecture{lectures.length !== 1 ? "s" : ""} in this chapter
        </p>
      )}
    </div>
  );
}
