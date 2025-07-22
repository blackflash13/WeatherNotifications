import express from "express";

const router = express.Router();

router.get("/:city", async (req, res) => {
  try {
    const { city } = req.params;

    res.json({
      success: true,
      data: {
        city: city,
        temperature: 22,
        description: "Sunny",
        timestamp: new Date().toISOString(),
      },
      message: `Weather data for ${city} (placeholder)`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch weather data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const cities = req.query.cities as string;

    if (!cities) {
      return res.status(400).json({
        success: false,
        message: "Cities parameter is required",
      });
    }

    res.json({
      success: true,
      data: cities.split(",").map((city) => ({
        city: city.trim(),
        temperature: Math.floor(Math.random() * 30) + 5,
        description: "Placeholder weather",
        timestamp: new Date().toISOString(),
      })),
      message: "Wheather data for multiple cities (placeolder)",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch weather data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
