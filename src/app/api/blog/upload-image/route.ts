import { NextRequest, NextResponse } from "next/server";

// Sunucu içi direkt bağlantı — nginx'i bypass eder, body limit yok
const BACKEND_INTERNAL =
  process.env.BACKEND_INTERNAL_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:5000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const cookie = req.headers.get("cookie") ?? "";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    let res: Response;
    try {
      res = await fetch(`${BACKEND_INTERNAL}/api/admin/blog/upload-image`, {
        method: "POST",
        headers: { Cookie: cookie },
        body: formData,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await res.json().catch(() => ({ error: "Görsel yüklenemedi." }));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const isTimeout = err instanceof DOMException && err.name === "AbortError";
    return NextResponse.json(
      { error: isTimeout ? "Yükleme zaman aşımına uğradı." : "Görsel yüklenemedi." },
      { status: 500 }
    );
  }
}
