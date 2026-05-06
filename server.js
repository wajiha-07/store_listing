const express = require('express');
const gplay = require('google-play-scraper');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/search', async (req, res) => {
  const { q, num = 5, country = 'pk', lang = 'en' } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Query is required" });
  }

  console.log(`🔍 Searching: "${q}"`);

  try {
    const results = await gplay.search({
      term: q,
      num: Math.min(parseInt(num), 10),
      country: country,
      lang: lang,
      fullDetail: true,
      throttle: 200,
    });

    console.log(`✅ Found ${results.length} results for "${q}"`);

    const cleaned = results.map(app => ({
      title: app.title || "Unknown App",
      developer: app.developer || "Unknown",
      icon: app.icon || "",
      rating: app.score || 0,
      reviews: app.reviews || 0,
      downloads: app.installs || "N/A",
      url: app.url || "#",
      summary: app.summary || "",
      description: app.description || "",
      headerImage: app.headerImage || "",
      screenshots: app.screenshots || [],
      video: app.video || null,
    }));

    res.json(cleaned);

  } catch (error) {
    console.error("❌ Scraper Error:", error.message);

    // Fallback: Try with less details
    try {
      console.log("Trying fallback with fullDetail: false...");
      const fallbackResults = await gplay.search({
        term: q,
        num: Math.min(parseInt(num), 10),
        country: country,
        lang: lang,
        fullDetail: false,
      });

      const cleanedFallback = fallbackResults.map(app => ({
        title: app.title || "Unknown App",
        developer: app.developer || "Unknown",
        icon: app.icon || "",
        rating: app.score || 0,
        reviews: app.reviews || 0,
        downloads: app.installs || "N/A",
        url: app.url || "#",
        summary: app.summary || "",
        description: "",
        headerImage: "",
        screenshots: [],
        video: null,
      }));

      console.log(`✅ Fallback returned ${cleanedFallback.length} results`);
      return res.json(cleanedFallback);

    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError.message);
      res.status(500).json({ 
        error: "No results",
        message: "This keyword is causing issues with the scraper. Try a more specific or different keyword."
      });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
