import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const limit = searchParams.get("limit") ?? "5";

    if (!q) {
        return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    try {
        const res = await fetch(
            `${BACKEND_URL}/search?q=${encodeURIComponent(q)}&limit=${limit}`
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: "Search failed" }));
            return NextResponse.json({ error: err.detail }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[/api/search] error:", error);
        return NextResponse.json(
            { error: "Failed to reach backend." },
            { status: 503 }
        );
    }
}
