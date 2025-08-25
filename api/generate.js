import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Upload error" });
    }

    try {
      const ratio = fields.ratio || "16:9";
      const duration = fields.duration || "10";
      const prompt = fields.prompt || "Generate a video with Veo2";

      const fileData = fs.readFileSync(files.image.filepath);
      const base64Image = fileData.toString("base64");

      // 🚀 Panggil Vertex AI Studio API (Veo2)
      const response = await fetch(
        "https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google/models/veo2:predict",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GOOGLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instances: [
              {
                prompt,
                image: base64Image,
                ratio,
                duration,
              },
            ],
          }),
        }
      );

      const result = await response.json();
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
}
