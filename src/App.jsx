import React, { useState } from "react";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey || !prompt) {
      alert("Isi API Key dan Prompt dulu!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      setResult("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-xl w-full">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
          🚀 VEO Batch Demo
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">API Key</label>
            <input
              type="password"
              placeholder="Masukkan API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Prompt</label>
            <textarea
              placeholder="Masukkan prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows="4"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Generate"}
          </button>
        </form>

        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Result:</h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg mt-2 overflow-x-auto text-sm">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
