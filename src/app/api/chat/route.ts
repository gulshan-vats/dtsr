import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();

        if (!query?.trim()) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        const res = await fetch(`${BACKEND_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: "Backend error" }));
            return NextResponse.json(
                { error: err.detail ?? "Backend error" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[/api/chat] error:", error);
        return NextResponse.json(
            { error: "Failed to reach backend. Is it running on port 8000?" },
            { status: 503 }
        );
    }
}
