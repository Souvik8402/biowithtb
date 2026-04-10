// app/api/delete-lecture/route.js
// Deletes a single lecture — removes its Firestore document AND its PDF from Storage.

import { NextResponse } from "next/server";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

export async function POST(request) {
  try {
    const { classId, chapterId, lectureId } = await request.json();

    // Validate inputs
    if (!classId || !chapterId || !lectureId) {
      return NextResponse.json({ error: "classId, chapterId, and lectureId are required" }, { status: 400 });
    }

    // Reference to the lecture document in Firestore
    const lectureRef = doc(db, "classes", classId, "chapters", chapterId, "lectures", lectureId);

    // Get the lecture document to find the storage path
    const lectureSnap = await getDoc(lectureRef);

    if (!lectureSnap.exists()) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    const lectureData = lectureSnap.data();

    // Delete the PDF from Firebase Storage (if storagePath exists)
    if (lectureData.storagePath) {
      try {
        const storageRef = ref(storage, lectureData.storagePath);
        await deleteObject(storageRef);
      } catch (storageError) {
        // If the file doesn't exist in storage, we still want to delete the Firestore doc
        console.warn("Storage delete warning:", storageError.message);
      }
    }

    // Delete the Firestore document
    await deleteDoc(lectureRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete lecture error:", error);
    return NextResponse.json({ error: "Delete failed: " + error.message }, { status: 500 });
  }
}
