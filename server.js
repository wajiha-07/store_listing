const express = require('express');
const gplay = require('google-play-scraper');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/search', async (req, res) => {
  let { q, num = 5, country = 'pk', lang = 'en' } = req.query;

  if (!q) return res.status(400).json({ error: "Query is required" });

  try {
    console.log(`Searching: ${q} | Country: ${country}`);

    const results = await gplay.search({
      term: q,
      num: Math.min(parseInt(num), 10),   // Max 10 for stability
      country: country,
      lang: lang,
      fullDetail: true,
      throttle: 100,                      // Small delay to avoid blocks
    });

    console.log(`Found ${results.length} results for "${q}"`);

    if (results.length === 0) {
      // Try again with simpler settings as fallback
      const fallback = await gplay.search({
        term: q,
        num: 5,
        country: country,
        lang: lang,
        fullDetail: false
      });
      console.log(`Fallback returned ${fallback.length} results`);
    }

    const cleaned = results.map(app => ({
      title: app.title || "Unknown",
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
      videoImage: app.videoImage || null
    }));

    res.json(cleaned);

  } catch (error) {
    console.error("Scraper Error:", error.message);
    res.status(500).json({ 
      error: "Scraper failed",
      message: "Try a different keyword or try again later"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
