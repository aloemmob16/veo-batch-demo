import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Error parsing form data" });
    }

    try {
      const prompt = fields.prompt;
      const ratio = fields.ratio || "16:9";
      const duration = fields.duration || "10";

      let imageBase64 = null;
      if (files.image) {
        const imgBuffer = fs.readFileSync(files.image[0].filepath);
        imageBase64 = imgBuffer.toString("base64");
      }

      // 🔑 Ambil API key dari Environment Vercel
      const API_KEY = process.env.GOOGLE_API_KEY;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/veo-2:generateVideo?key=" + API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: { text: prompt },
            config: { aspect_ratio: ratio, duration: duration },
            ...(imageBase64 && { image: imageBase64 }),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        return res.status(500).json({ error: data });
      }

      // Ambil URL video dari response Google
      res.status(200).json({ url: data.videoUrl || "" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
};
