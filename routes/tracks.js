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

    const search = req.query.search?.trim();
    const filterType = req.query.filter?.trim();

    let filter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter = {
        $or: [
          { title: regex },
          { description: regex },
          { tags: regex },
          { type: regex },
        ],
      };
    } else if (filterType) {
      filter = { type: { $regex: new RegExp(filterType, "i") } };
    }

    const totalCount = await tracksCollection.countDocuments(filter);
    const tracks = await tracksCollection
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray();

    // catch music without download link
    tracks.filter((track) => {
      if (!track.hasOwnProperty("hQUrl") || !track.hQUrl) {
        console.log(`Track without hQUrl:, ${track.title}
          Id: ${track._id}`);
      }
    });

    // vvvvvvv field hQUrl to full version music vvvvvvv DO NOT SEND IT TO FRONT
    const safeTracks = tracks.map(({ hQUrl, ...rest }) => rest);

    res.json({
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      tracks: safeTracks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd przy pobieraniu utworów" });
  }
});

export default router;
