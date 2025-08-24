import React, { useState } from "react";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [ratio, setRatio] = useState("16:9");
  const [duration, setDuration] = useState(10);
  const [videoUrl, setVideoUrl] = useState("");

  const handleGenerate = async () => {
    if (!prompt) {
      alert("Isi prompt dulu!");
      return;
    }

    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/veo:generateVideo?key=YOUR_API_KEY", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          videoConfig: {
            aspectRatio: ratio,
            durationSeconds: duration,
            imageReference: image ? [image] : []
          }
        }),
      });

      const data = await res.json();
      console.log(data);

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      } else {
        alert("Gagal generate, cek console log");
      }
    } catch (err) {
      console.error(err);
      alert("Error saat generate");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Veo2 (TikTok : aloemTV)</h1>

        <textarea
          className="w-full border rounded p-2 mb-3"
          placeholder="Masukkan prompt video..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <input
          type="text"
          className="w-full border rounded p-2 mb-3"
          placeholder="URL gambar referensi (opsional)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <div className="flex gap-3 mb-3">
          <select
            className="flex-1 border rounded p-2"
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
          >
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
            <option value="1:1">1:1</option>
          </select>

          <input
            type="number"
            className="w-24 border rounded p-2"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min={5}
            max={60}
          />
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Generate Video
        </button>

        {videoUrl && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Hasil:</h2>
            <video controls className="w-full rounded">
              <source src={videoUrl} type="video/mp4" />
            </video>
          </div>
        )}
      </div>
    </div>
  );
}
