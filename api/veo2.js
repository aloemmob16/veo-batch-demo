import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false }, // penting: biar bisa parse multipart/form-data
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: "Form parse error" });
      }

      const prompt = String(fields.prompt || "");
      const ratio = String(fields.ratio || "9:16"); // 16:9 | 1:1 | 9:16
      const duration = Math.max(3, Math.min(20, parseInt(fields.duration || "6", 10)));

      // siapkan image inlineData bila ada
      let imagePart = [];
      const file = files?.image;
      if (file && Array.isArray(file) && file[0]) {
        const f = file[0];
        const buffer = fs.readFileSync(f.filepath);
        const base64 = buffer.toString("base64");
        const mime = f.mimetype || "image/png";
        imagePart = [
          {
            inlineData: {
              mimeType: mime,
              data: base64,
            },
          },
        ];
      } else if (file && file.filepath) {
        // kasus non-array (beberapa env mengembalikan object tunggal)
        const buffer = fs.readFileSync(file.filepath);
        const base64 = buffer.toString("base64");
        const mime = file.mimetype || "image/png";
        imagePart = [
          {
            inlineData: {
              mimeType: mime,
              data: base64,
            },
          },
        ];
      }

      // mapping rasio ke format API jika perlu
      // jika API menerima string langsung, biarkan apa adanya.
      const videoConfig = {
        dimension: "1080p",
        aspectRatio: ratio,          // "16:9" | "1:1" | "9:16"
        durationSeconds: duration,
      };

      const body = {
        prompt: {
          text: prompt,
          images: imagePart,
        },
        videoConfig,
      };

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0:generateVideo?key=${process.env.GOOGLE_API_KEY}`;

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await resp.text();
      if (!resp.ok) {
        return res.status(resp.status).json({ error: text || "Upstream error" });
      }

      // coba parse JSON
      let data = {};
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      return res.status(200).json(data);
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
