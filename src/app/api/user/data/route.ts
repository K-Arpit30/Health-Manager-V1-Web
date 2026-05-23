import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { getUserStore, saveUserStore } from "../../../../utils/db";

const SECRET = process.env.NEXTAUTH_SECRET || "project18_super_secret_key_12345";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
    }

    const data = getUserStore(token.email);
    if (!data) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch user data";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
    }

    const { profile, dailyLogs, photos } = await req.json();
    
    if (!profile || !dailyLogs || !photos) {
      return NextResponse.json({ error: "Missing required store fields" }, { status: 400 });
    }

    saveUserStore(token.email, {
      profile,
      dailyLogs,
      photos
    });

    return NextResponse.json({ success: true, message: "User data synchronized successfully" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to sync user data";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
