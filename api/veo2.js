export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, imageUrl } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0:generateVideo?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: {
            text: prompt,
            images: imageUrl ? [{ url: imageUrl }] : []
          },
          videoConfig: {
            dimension: "720p",
            durationSeconds: 6
          }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
