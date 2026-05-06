const express = require('express');
const gplay = require('google-play-scraper');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/search', async (req, res) => {
  const { q, num = 5, country = 'pk', lang = 'en' } = req.query;

  if (!q) return res.status(400).json({ error: "Query is required" });

  try {
    const results = await gplay.search({
      term: q,
      num: parseInt(num),
      country: country,
      lang: lang,
      fullDetail: true   // This gives screenshots, description, video etc.
    });

    // Clean and format data
    const cleaned = results.map(app => ({
      title: app.title,
      developer: app.developer,
      icon: app.icon,
      rating: app.score,
      reviews: app.reviews,
      downloads: app.installs,
      url: app.url,
      summary: app.summary,
      description: app.description,
      headerImage: app.headerImage,        // Feature Graphic
      screenshots: app.screenshots || [],
      video: app.video || null,            // YouTube link if available
      videoImage: app.videoImage || null
    }));

    res.json(cleaned);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data from Play Store" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Scraper API running on port ${PORT}`));