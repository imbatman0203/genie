import express from "express";
import authUserMiddleware from "../middlewares/authUserMiddleware.js";

const modelsRouter = express.Router();

modelsRouter.get("/", authUserMiddleware, async (req, res) => {
  try {
    const r = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    });
    const data = await r.json();
    const models = data.data.map(m => ({
      id: m.id,
      name: m.name,
      context: m.context_length,
    }));
    res.json({ models });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch models" });
  }
});

export default modelsRouter;