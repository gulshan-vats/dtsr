import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const res = await fetch(`${BACKEND_URL}/upload`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: "Upload failed" }));
            return NextResponse.json(
                { error: err.detail ?? "Upload failed" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[/api/upload] error:", error);
        return NextResponse.json(
            { error: "Failed to reach backend. Is it running on port 8000?" },
            { status: 503 }
        );
    }
}
