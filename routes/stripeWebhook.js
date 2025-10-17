import express from "express";
import Stripe from "stripe";
import { getDB } from "../db/mongoClient.js";
import SibApiV3Sdk from "@sendinblue/client";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();
brevoApi.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

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

        // Save sale to data base
        await salesCollection.insertOne({
          title: session.metadata.title,
          artist: session.metadata.artist,
          price: session.amount_total / 100,
          email: session.customer_email,
          createdAt: new Date(),
        });

        console.log("💾 Zapisano nową sprzedaż:", session.metadata.title);

        const sendSmtpEmail = {
          sender: {
            email: process.env.BREVO_SENDER_EMAIL,
            name: "WaveTrace",
          },
          to: [
            {
              email: session.customer_email,
              name: "Customer",
            },
          ],
          subject: `Your purchase: ${session.metadata.title}`,
          textContent: `Thank you for your purchase!\n\nYou can download your track here:\n${session.metadata.hQUrl}\n\nBest regards,\nWaveTrace`,
        };

        try {
          await brevoApi.sendTransacEmail(sendSmtpEmail);
          console.log("📧 Email wysłany do:", session.customer_email);
        } catch (emailErr) {
          console.error("❌ Błąd wysyłki maila:", emailErr);
        }
      }

      res.status(200).send("ok");
    } catch (err) {
      console.error("❌ Webhook error:", err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
