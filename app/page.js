// app/page.js
// This is the HOME PAGE — the first thing students see when they open the website.
// It shows a password screen first, then lets students browse lectures.

"use client"; // This page uses React state (useState), so it must be a Client Component

import { useState } from "react";
import Link from "next/link";
import PasswordScreen from "@/components/PasswordScreen";
import ClassSelector from "@/components/ClassSelector";
import ChapterList from "@/components/ChapterList";
import LectureList from "@/components/LectureList";

export default function HomePage() {
  // Track whether the student has logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Track which class the student selected (e.g. "9", "10", "11", "12")
  const [selectedClass, setSelectedClass] = useState(null);

  // Track which chapter the student selected
  const [selectedChapter, setSelectedChapter] = useState(null); // { id, name }

  // --- STEP 1: Show password screen if not logged in ---
  if (!isLoggedIn) {
    return <PasswordScreen onSuccess={() => setIsLoggedIn(true)} />;
  }

  // --- STEP 2: Show class selector if no class selected ---
  if (!selectedClass) {
    return (
      <main className="min-h-screen bg-slate-50">
        {/* Top bar with Admin button */}
        <TopBar />
        <ClassSelector onSelect={(cls) => setSelectedClass(cls)} />
      </main>
    );
  }

  // --- STEP 3: Show chapter list if no chapter selected ---
  if (!selectedChapter) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopBar />
        <ChapterList
          classId={selectedClass}
          onSelect={(chapter) => setSelectedChapter(chapter)}
          onBack={() => setSelectedClass(null)}
        />
      </main>
    );
  }

  // --- STEP 4: Show lectures for selected chapter ---
  return (
    <main className="min-h-screen bg-slate-50">
      <TopBar />
      <LectureList
        classId={selectedClass}
        chapter={selectedChapter}
        onBack={() => setSelectedChapter(null)}
      />
    </main>
  );
}

// Small component for the top navigation bar shown after login
function TopBar() {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Logo / brand name */}
        <span className="text-green-600 font-bold text-xl">🌿 BIOwithTB</span>
      </div>
      {/* Admin button — top right corner */}
      <Link
        href="/admin"
        className="text-sm text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-all"
      >
        Admin
      </Link>
    </div>
  );
}
