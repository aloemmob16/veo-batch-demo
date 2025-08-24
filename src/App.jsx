import React, { useState } from "react";

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVideoUrl("");

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("ratio", ratio);
      formData.append("duration", duration);
      if (imageFile) formData.append("image", imageFile);

      const response = await fetch("https://api.google.com/veo2/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Gagal generate video");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🎬 Veo2 (TikTok : aloemTV)</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* API Key */}
        <input
          type="text"
          placeholder="Masukkan API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />

        {/* Prompt */}
        <textarea
          placeholder="Deskripsi video..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />

        {/* Rasio */}
        <select
          value={ratio}
          onChange={(e) => setRatio(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="16:9">16:9 (Landscape)</option>
          <option value="9:16">9:16 (Portrait)</option>
          <option value="1:1">1:1 (Square)</option>
        </select>

        {/* Durasi */}
        <input
          type="number"
          min="1"
          max="60"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full p-2 border rounded"
        />

        {/* Upload Gambar */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full rounded shadow"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "⏳ Membuat Video..." : "🚀 Generate Video"}
        </button>
      </form>

      {/* Output Video */}
      {videoUrl && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Hasil:</h2>
          <video controls className="w-full rounded mb-3">
            <source src={videoUrl} type="video/mp4" />
          </video>

          <a
            href={videoUrl}
            download="veo2-video.mp4"
            className="block w-full text-center bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            ⬇️ Download Video
          </a>
        </div>
      )}

      {/* Embed TikTok Ads */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2 text-center">🔥 Sponsored</h2>
        <div className="w-full flex justify-center">
          <iframe
            src="https://www.tiktok.com/embed/7541778657744932152"
            width="325"
            height="580"
            allow="autoplay; encrypted-media"
            title="TikTok Ad"
            className="rounded-xl shadow"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
