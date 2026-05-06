const express = require('express');
const gplay = require('google-play-scraper');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/search', async (req, res) => {
  const { q, num = 5, country = 'pk', lang = 'en' } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  console.log(`🔍 Search request: "${q}" | Country: ${country}`);

  try {
    const results = await gplay.search({
      term: q,
      num: Math.min(parseInt(num), 10),
      country: country,
      lang: lang,
      fullDetail: true,
      throttle: 150,           // Helps avoid quick blocks
    });

    console.log(`✅ Found ${results.length} apps for "${q}"`);

    const cleaned = results.map(app => ({
      title: app.title || "Unknown App",
      developer: app.developer || "Unknown",
      icon: app.icon,
      rating: app.score || 0,
      reviews: app.reviews || 0,
      downloads: app.installs || "N/A",
      url: app.url,
      summary: app.summary || "",
      description: app.description || "",
      headerImage: app.headerImage,
      screenshots: app.screenshots || [],
      video: app.video || null,
    }));

    res.json(cleaned);

  } catch (error) {
    console.error("❌ Scraper Error:", error.message);
    console.error("Full Error:", error);

    // Send helpful error to frontend
    res.status(500).json({ 
      error: "Scraper failed",
      message: error.message.includes("429") ? "Too many requests. Try again later." : "Failed to fetch data from Google Play. Try a different keyword."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
