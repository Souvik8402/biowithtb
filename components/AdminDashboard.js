// components/AdminDashboard.js
// The main admin panel shown after admin login.
// Contains tabs for: Upload Lecture, Create Chapter, Delete Lecture, Delete Chapter.

"use client";

import { useState } from "react";
import UploadLecture from "./UploadLecture";
import CreateChapter from "./CreateChapter";
import DeleteLecture from "./DeleteLecture";
import DeleteChapter from "./DeleteChapter";

// Props:
//   onLogout — called when admin clicks the logout button
export default function AdminDashboard({ onLogout }) {
  // Track which tab is currently active
  const [activeTab, setActiveTab] = useState("upload");

  // Define the tabs
  const tabs = [
    { id: "upload",          label: "Upload Lecture",  emoji: "⬆️" },
    { id: "createChapter",   label: "Create Chapter",  emoji: "📁" },
    { id: "deleteLecture",   label: "Delete Lecture",  emoji: "🗑️" },
    { id: "deleteChapter",   label: "Delete Chapter",  emoji: "⚠️" },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top nav bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-bold text-lg">🌿 BIOwithTB</span>
          <span className="bg-green-900 text-green-400 text-xs font-medium px-2 py-0.5 rounded-full ml-2">
            Admin
          </span>
        </div>
        <button
          onClick={onLogout}
          className="text-slate-400 hover:text-white text-sm border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-all"
        >
          Logout
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage lectures and chapters</p>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-green-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700"
              }`}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content panels */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          {activeTab === "upload"        && <UploadLecture />}
          {activeTab === "createChapter" && <CreateChapter />}
          {activeTab === "deleteLecture" && <DeleteLecture />}
          {activeTab === "deleteChapter" && <DeleteChapter />}
        </div>
      </div>
    </div>
  );
}
