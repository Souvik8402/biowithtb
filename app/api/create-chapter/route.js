// app/api/create-chapter/route.js
// Creates a new chapter under a given class in Firestore.

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(request) {
  try {
    const { classId, chapterName } = await request.json();

    // Validate inputs
    if (!classId || !chapterName || chapterName.trim() === "") {
      return NextResponse.json({ error: "classId and chapterName are required" }, { status: 400 });
    }

    // Add new chapter document to: classes/{classId}/chapters
    const chaptersRef = collection(db, "classes", classId, "chapters");

    const docRef = await addDoc(chaptersRef, {
      name: chapterName.trim(),
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, chapterId: docRef.id });
  } catch (error) {
    console.error("Create chapter error:", error);
    return NextResponse.json({ error: "Failed to create chapter: " + error.message }, { status: 500 });
  }
}
