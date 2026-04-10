// app/api/verify-password/route.js
// This is a SERVER-SIDE API route.
// Passwords are stored in environment variables and NEVER sent to the browser.
// The browser sends the typed password here, we check it server-side, and return success/fail.

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Parse the JSON body from the request
    const { password, role } = await request.json();

    // Check which role is trying to log in and compare against env variable
    if (role === "student") {
      // Compare with student password from environment variable
      if (password === process.env.STUDENT_PASSWORD) {
        return NextResponse.json({ success: true });
      }
    } else if (role === "admin") {
      // Compare with admin password from environment variable
      if (password === process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ success: true });
      }
    }

    // If password doesn't match, return failure
    return NextResponse.json({ success: false });
  } catch (error) {
    // If something goes wrong with the request parsing
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
