import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const res = await fetch(`${BACKEND_URL}/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Feedback failed" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[/api/feedback] error:", error);
        return NextResponse.json(
            { error: "Failed to reach backend." },
            { status: 503 }
        );
    }
}
