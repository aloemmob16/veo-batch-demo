import React, { useState } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [ratio, setRatio] = useState("9:16");        // default TikTok/Reels
  const [duration, setDuration] = useState(6);       // default 6 detik
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    setImageFile(e.target.files?.[0] || null);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg("");
    setVideoUrl("");

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("ratio", ratio);
      formData.append("duration", String(duration));
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/api/veo2", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Gagal generate video");
      }

      // Sesuaikan path berdasarkan response Google AI Studio kamu
      // Di sini diasumsikan API mengembalikan { video: { uri: "https://..." } }
      const uri =
        data?.video?.uri ||
        data?.result?.videoUrl ||
        data?.output?.videoUrl ||
        "";

      if (!uri) {
        throw new Error("Tidak menemukan URL video pada respons API.");
      }

      setVideoUrl(uri);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const disableGenerate = !prompt || loading;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 gap-4">
      <h1 className="text-2xl font-bold">🎬 Veo2 Video Generator</h1>

      <div className="w-full max-w-md space-y-3">
        <label className="block text-sm font-medium">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-28 p-2 border rounded"
          placeholder="Deskripsikan videomu…"
        />

        <label className="block text-sm font-medium">Gambar Referensi (opsional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
        />

        <label className="block text-sm font-medium">Rasio Video</label>
        <select
          value={ratio}
          onChange={(e) => setRatio(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="16:9">16:9 (YouTube)</option>
          <option value="1:1">1:1 (Instagram)</option>
          <option value="9:16">9:16 (TikTok/Reels)</option>
        </select>

        <label className="block text-sm font-medium">Durasi (detik)</label>
        <input
          type="number"
          min={3}
          max={20}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />

        <button
          onClick={handleGenerate}
          disabled={disableGenerate}
          className="w-full py-2 rounded text-white bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Membuat Video…" : "Generate Video"}
        </button>

        {errorMsg && (
          <div className="text-red-600 text-sm">{errorMsg}</div>
        )}
      </div>

      {videoUrl && (
        <div className="w-full max-w-md mt-4 space-y-3">
          <video
            src={videoUrl}
            controls
            className="w-full rounded shadow"
          />
          <a
            href={videoUrl}
            download
            className="block text-center w-full py-2 rounded bg-gray-800 text-white"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
export default App;
