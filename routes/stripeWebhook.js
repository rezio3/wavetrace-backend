import express from "express";
import Stripe from "stripe";
import { getDB } from "../db/mongoClient.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const db = getDB();
        const salesCollection = db.collection("wavetrace-sale");

        await salesCollection.insertOne({
          title: session.metadata.title,
          artist: session.metadata.artist,
          price: session.amount_total / 100,
          email: session.customer_email,
          createdAt: new Date(),
        });

        console.log("💾 Zapisano nową sprzedaż:", session.metadata.title);
      }

      res.status(200).send("ok");
    } catch (err) {
      console.error("❌ Webhook error:", err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
