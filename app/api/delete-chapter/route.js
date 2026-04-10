// app/api/delete-chapter/route.js
// Deletes a chapter AND all lectures inside it (both Firestore docs and Storage PDFs).
// This is a "cascading delete" — one click removes everything related to the chapter.

import { NextResponse } from "next/server";
import { db, storage } from "@/lib/firebase";
import {
  doc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

export async function POST(request) {
  try {
    const { classId, chapterId } = await request.json();

    // Validate inputs
    if (!classId || !chapterId) {
      return NextResponse.json({ error: "classId and chapterId are required" }, { status: 400 });
    }

    // Step 1: Get all lectures inside this chapter
    const lecturesRef = collection(db, "classes", classId, "chapters", chapterId, "lectures");
    const lecturesSnap = await getDocs(lecturesRef);

    // Step 2: Delete each lecture's PDF from Storage + its Firestore document
    const deletePromises = lecturesSnap.docs.map(async (lectureDoc) => {
      const lectureData = lectureDoc.data();

      // Delete PDF from Firebase Storage
      if (lectureData.storagePath) {
        try {
          const storageRef = ref(storage, lectureData.storagePath);
          await deleteObject(storageRef);
        } catch (err) {
          console.warn("Could not delete file from storage:", err.message);
        }
      }

      // Delete lecture Firestore document
      await deleteDoc(lectureDoc.ref);
    });

    // Wait for all lecture deletions to complete
    await Promise.all(deletePromises);

    // Step 3: Delete the chapter document itself
    const chapterRef = doc(db, "classes", classId, "chapters", chapterId);
    await deleteDoc(chapterRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete chapter error:", error);
    return NextResponse.json({ error: "Failed to delete chapter: " + error.message }, { status: 500 });
  }
}
