import React, { useState } from "react";

export default function VeoBatchApp() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVideoUrl(null);
    setError(null);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/veo-1:generateVideo?key=${import.meta.env.VITE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: {
              text: prompt,
            },
          }),
        }
      );

      const data = await res.json();

      if (data.error) {
        setError(data.error.message || "API Error");
      } else {
        // cek apakah API bener2 balikin URL
        const url = data.video?.url || null;
        setVideoUrl(url);
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">🎥 Veo Batch Generator</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Masukkan prompt video..."
          className="w-full p-3 border rounded-md mb-3"
          rows={4}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md"
        >
          {loading ? "Menghasilkan..." : "Generate Video"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      {videoUrl && (
        <div className="mt-5">
          <video controls src={videoUrl} className="rounded-lg shadow-lg w-80" />
        </div>
      )}
    </div>
  );
}
