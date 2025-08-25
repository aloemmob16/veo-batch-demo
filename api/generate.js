import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // pakai formidable untuk form-data
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Form parse error" });

    try {
      const prompt = fields.prompt;
      const duration = fields.duration || "10";
      const ratio = fields.ratio || "16:9";

      // handle file upload (opsional)
      let imageBuffer = null;
      if (files.image) {
        imageBuffer = fs.readFileSync(files.image.filepath);
      }

      // 🔑 pakai API key dari Vercel Env
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API Key tidak ditemukan" });
      }

      // request ke Google Vertex AI / Veo2
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/veo-2:generateVideo?key=" + apiKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            duration,
            aspect_ratio: ratio,
            image: imageBuffer ? imageBuffer.toString("base64") : null,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        return res.status(response.status).json({ error: text });
      }

      // anggap API balikin video blob
      const arrayBuffer = await response.arrayBuffer();
      res.setHeader("Content-Type", "video/mp4");
      res.send(Buffer.from(arrayBuffer));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}
