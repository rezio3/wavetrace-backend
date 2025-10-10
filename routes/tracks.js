import express from "express";
import { getDB } from "../db/mongoClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const tracksCollection = db.collection("wavetrace-music");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await tracksCollection.countDocuments();
    const tracks = await tracksCollection
      .find()
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      tracks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd przy pobieraniu utworów" });
  }
});

export default router;
