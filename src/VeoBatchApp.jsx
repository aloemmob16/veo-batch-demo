import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/genai";

// helper cek URL
function isLikelyVideoUrl(s) {
  if (typeof s !== "string") return false;
  try {
    const u = new URL(s);
    const path = u.pathname.toLowerCase();
    if (path.endsWith(".mp4") || path.endsWith(".webm") || path.endsWith(".mov")) return true;
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// komponen hasil tiap item
function ResultItem({ item, idx }) {
  const url =
    (item?.previewUrl && isLikelyVideoUrl(item.previewUrl) && item.previewUrl) ||
    (item?.downloadUrl && isLikelyVideoUrl(item.downloadUrl) && item.downloadUrl) ||
    null;

  const status = item?.status || "unknown";

  return (
    <div className="p-4 bg-white rounded-2xl shadow space-y-2">
      <div className="text-sm font-semibold opacity-70">Item #{idx + 1}</div>

      {status === "running" && (
        <div className="text-xs animate-pulse text-blue-600">⏳ Sedang diproses...</div>
      )}

      {status === "error" && (
        <div className="text-xs text-red-600">❌ Error: {item.error}</div>
      )}

      {url && (
        <video
          src={url}
          controls
          playsInline
          className="w-full rounded-xl"
          preload="metadata"
        />
      )}

      {url && (
        <div className="pt-1">
          <a
            className="text-sm underline"
            href={url}
            target="_blank"
            rel="noreferrer"
            download
          >
            Download video
          </a>
        </div>
      )}
    </div>
  );
}

export default function VeoBatchApp() {
  const [apiKey, setApiKey] = useState("");
  const [promptsText, setPromptsText] = useState("");
  const [jobs, setJobs] = useState([]); // tiap item: { prompt, status, previewUrl, downloadUrl, error }
  const [loading, setLoading] = useState(false);

  const getBatchPrompts = () =>
    promptsText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

  // polling tiap 5 detik
  useEffect(() => {
    if (!apiKey) return;
    const interval = setInterval(() => {
      setJobs((old) =>
        old.map((j) => {
          if (j.status === "running") {
            // contoh polling dummy, sesuaikan dengan endpoint veo video.get
            return { ...j }; 
          }
          return j;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [apiKey]);

  const handleGenerate = async () => {
    const batch = getBatchPrompts();
    if (!apiKey || batch.length === 0) {
      alert("Masukkan API Key dan minimal 1 prompt.");
      return;
    }

    setLoading(true);
    setJobs(batch.map((p) => ({ prompt: p, status: "running" })));

    try {
      const genAI = new GoogleGenerativeAI({ apiKey });

      const newJobs = [];
      for (const prompt of batch) {
        try {
          // NOTE: ini placeholder, ganti sesuai SDK resmi
          const model = genAI.getGenerativeModel({ model: "video" });
          const res = await model.generateContent(prompt);

          // asumsi API Veo kasih link / status
          const text = res?.response?.text?.() || "";
          const matchUrl = text.match(/https?:\/\/\S+/);

          if (matchUrl) {
            newJobs.push({
              prompt,
              status: "done",
              previewUrl: matchUrl[0],
              downloadUrl: matchUrl[0],
            });
          } else {
            newJobs.push({
              prompt,
              status: "error",
              error: "Tidak ada URL ditemukan",
            });
          }
        } catch (err) {
          newJobs.push({
            prompt,
            status: "error",
            error: err?.message || String(err),
          });
        }
      }
      setJobs(newJobs);
    } catch (err) {
      alert("Error init API: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Veo Batch (Queue + Auto-Embed)</h1>
          <span className="text-xs opacity-60">Client-side demo</span>
        </header>

        {/* Input */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white shadow p-4 space-y-3">
            <label className="block text-sm font-medium">Gemini API Key</label>
            <input
              type="password"
              placeholder="ya29...."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-xl border p-2"
            />
          </div>

          <div className="rounded-2xl bg-white shadow p-4">
            <label className="block text-sm font-medium">
              Prompts (1 baris = 1 video)
            </label>
            <textarea
              className="mt-1 w-full rounded-xl border p-3 h-32"
              placeholder="Contoh:\nCinematic sunrise beach\nClose up cooking steam"
              value={promptsText}
              onChange={(e) => setPromptsText(e.target.value)}
            />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-2xl bg-black text-white px-4 py-2 font-medium shadow hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Mengantri…" : "Generate Batch"}
          </button>
        </div>

        {/* Results */}
        <section className="space-y-3">
          {jobs.length === 0 && (
            <div className="text-center text-sm opacity-60">
              Belum ada hasil. Isi prompt lalu klik Generate.
            </div>
          )}
          {jobs.map((item, i) => (
            <ResultItem key={i} item={item} idx={i} />
          ))}
        </section>
      </div>
    </div>
  );
}