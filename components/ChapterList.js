// components/ChapterList.js
// Fetches all chapters for the selected class from Firestore and displays them.
// When a student clicks a chapter, it calls onSelect to move to the lecture list.

"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

// Props:
//   classId   — the selected class ("9", "10", etc.)
//   onSelect  — called with { id, name } when a chapter is clicked
//   onBack    — called when student clicks "Back" to go back to class selection
export default function ChapterList({ classId, onSelect, onBack }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch chapters from Firestore when the component loads
  useEffect(() => {
    async function fetchChapters() {
      setLoading(true);
      setError("");
      try {
        // Path in Firestore: classes/{classId}/chapters
        const chaptersRef = collection(db, "classes", classId, "chapters");
        // Order by creation date so newest chapters appear last
        const q = query(chaptersRef, orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);

        // Map the Firestore documents to a simple array
        const chapterList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setChapters(chapterList);
      } catch (err) {
        console.error("Error fetching chapters:", err);
        setError("Could not load chapters. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchChapters();
  }, [classId]); // Re-fetch if classId changes

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-slate-700 transition-colors text-sm flex items-center gap-1"
        >
          ← Back
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Class {classId} Chapters</h2>
          <p className="text-slate-500 text-sm mt-0.5">Select a chapter to view lectures</p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-16 animate-pulse border border-slate-100" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-600">
          {error}
        </div>
      )}

      {/* Empty state — no chapters yet */}
      {!loading && !error && chapters.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-slate-500">No chapters yet for Class {classId}.</p>
          <p className="text-slate-400 text-sm mt-1">Ask your teacher to add chapters.</p>
        </div>
      )}

      {/* Chapter list */}
      {!loading && !error && chapters.length > 0 && (
        <div className="space-y-3">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              onClick={() => onSelect({ id: chapter.id, name: chapter.name })}
              className="w-full bg-white border border-slate-200 hover:border-green-400 hover:shadow-sm rounded-xl px-5 py-4 text-left flex items-center gap-4 transition-all group"
            >
              {/* Chapter number badge */}
              <span className="bg-green-100 text-green-700 text-sm font-semibold w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                {index + 1}
              </span>
              <span className="font-medium text-slate-800 group-hover:text-green-700 transition-colors">
                {chapter.name}
              </span>
              <span className="ml-auto text-slate-300 group-hover:text-green-400">→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
