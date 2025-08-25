// api/generate.js
import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // biar bisa baca FormData
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const prompt = fields.prompt?.[0] || "";
    const ratio = fields.ratio?.[0] || "16:9";
    const duration = parseInt(fields.duration?.[0] || "5", 10);
    const imageFile = files.image?.[0];

    if (!prompt || !imageFile) {
      return res.status(400).json({ error: "Prompt dan gambar wajib diisi" });
    }

    // Baca file gambar
    const imageBuffer = fs.readFileSync(imageFile.filepath);

    // Kirim ke API Google Veo2
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/veo-2:generateVideo?key=" +
        process.env.GOOGLE_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: {
            text: prompt,
          },
          config: {
            aspectRatio: ratio,
            durationSeconds: duration,
          },
          // Convert image ke base64
          images: [
            {
              mimeType: "image/png",
              data: imageBuffer.toString("base64"),
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: "API Error: " + errText });
    }

    const data = await response.json();

    // Ambil hasil video (misalnya berupa base64 / url)
    const videoBase64 = data.video?.data;
    if (!videoBase64) {
      return res.status(500).json({ error: "Video tidak ada di response" });
    }

    // Kirim balik ke browser dalam bentuk mp4
    const videoBuffer = Buffer.from(videoBase64, "base64");
    res.setHeader("Content-Type", "video/mp4");
    res.send(videoBuffer);
  } catch (err) {
    console.error("Error generate:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
}
