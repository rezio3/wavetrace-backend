import express from "express";
import Stripe from "stripe";
import { getDB } from "../db/mongoClient.js";
import { ObjectId } from "mongodb";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

router.post("/checkout-session", async (req, res) => {
  try {
    const { id, email } = req.body;

    if (!id || !email) {
      return res.status(400).json({ error: "Brak ID utworu lub emaila." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Niepoprawny adres e-mail." });
    }

    const db = getDB();
    const collection = db.collection("wavetrace-music");

    const track = await collection.findOne({ _id: new ObjectId(String(id)) });

    if (!track) {
      return res
        .status(404)
        .json({ error: "Nie znaleziono utworu o podanym ID." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd", // lub "pln"
            product_data: {
              name: track.title,
              description: "Wavetrace",
            },
            unit_amount: Math.round(track.price * 100),
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/success", // zamień na front
      cancel_url: "http://localhost:5173/cancel",
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Błąd Stripe:", err);
    res.status(500).json({ error: "Błąd podczas tworzenia sesji płatności." });
  }
});

export default router;
