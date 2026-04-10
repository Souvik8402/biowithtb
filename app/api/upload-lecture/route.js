// app/api/upload-lecture/route.js
// This API route handles uploading a PDF lecture.
// It receives the file + metadata from the admin dashboard and saves it to Firebase.

import { NextResponse } from "next/server";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function POST(request) {
  try {
    // The request comes in as FormData (because it includes a file)
    const formData = await request.formData();

    // Extract all the fields from the form
    const file = formData.get("file");           // The PDF file
    const classId = formData.get("classId");     // e.g. "9", "10", "11", "12"
    const chapterId = formData.get("chapterId"); // Firestore document ID of the chapter
    const chapterName = formData.get("chapterName"); // Chapter name (used for storage path)
    const title = formData.get("title");         // Lecture title or number

    // Basic validation — make sure all fields are present
    if (!file || !classId || !chapterId || !chapterName || !title) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Convert the file to a Buffer (binary data) for Firebase Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a clean filename (remove spaces, make lowercase)
    const cleanFileName = file.name.replace(/\s+/g, "-").toLowerCase();

    // Define the storage path:  /class-9/chapter-name/lecture.pdf
    const storagePath = `class-${classId}/${chapterName.replace(/\s+/g, "-").toLowerCase()}/${Date.now()}-${cleanFileName}`;

    // Create a reference to the storage location
    const storageRef = ref(storage, storagePath);

    // Upload the file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: "application/pdf",
    });

    // Get the public download URL for the uploaded file
    const fileUrl = await getDownloadURL(snapshot.ref);

    // Save the lecture metadata in Firestore
    // Path: classes/{classId}/chapters/{chapterId}/lectures/{newLectureId}
    const lecturesRef = collection(db, "classes", classId, "chapters", chapterId, "lectures");

    const docRef = await addDoc(lecturesRef, {
      title: title,
      fileUrl: fileUrl,
      storagePath: storagePath, // Save this so we can delete the file later
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, lectureId: docRef.id });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}
