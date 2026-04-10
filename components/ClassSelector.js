// components/ClassSelector.js
// Shown after login — lets the student pick their class (9, 10, 11, or 12).

"use client";

// Props:
//   onSelect — function to call with the selected class number (e.g. "9")
export default function ClassSelector({ onSelect }) {
  // These are the available classes — hardcoded as per requirements
  const classes = [
    { id: "9",  label: "Class 9",  emoji: "📗", description: "Foundation biology" },
    { id: "10", label: "Class 10", emoji: "📘", description: "Secondary biology" },
    { id: "11", label: "Class 11", emoji: "📙", description: "Senior biology" },
    { id: "12", label: "Class 12", emoji: "📕", description: "Advanced biology" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Select Your Class</h2>
        <p className="text-slate-500 mt-1">Choose your class to see chapters and lectures</p>
      </div>

      {/* Grid of class cards */}
      <div className="grid grid-cols-2 gap-4">
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => onSelect(cls.id)}
            className="bg-white border border-slate-200 hover:border-green-400 hover:shadow-md rounded-2xl p-6 text-left transition-all group"
          >
            <div className="text-3xl mb-3">{cls.emoji}</div>
            <div className="font-semibold text-slate-800 group-hover:text-green-700 text-lg">
              {cls.label}
            </div>
            <div className="text-slate-400 text-sm mt-1">{cls.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
