import express from "express";
import { getDB } from "../db/mongoClient.js";
import SibApiV3Sdk from "@sendinblue/client";

const router = express.Router();

// Tworzymy instancję TransactionalEmailsApi
const brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();

// Ustawiamy API Key
brevoApi.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

router.post("/", async (req, res) => {
  try {
    const { name, email, message, portfolioLink } = req.body;
    if (!name || !email || !portfolioLink) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Zapis do MongoDB
    const db = getDB();
    const collaboration = db.collection("wavetrace-collaboration");
    const newOrder = {
      name,
      email,
      message,
      portfolioLink,
      createdAt: new Date(),
    };
    const result = await collaboration.insertOne(newOrder);

    // Wysyłka maila
    const sendSmtpEmail = {
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: "WaveTrace Collaboration",
      },
      to: [
        {
          email: process.env.BREVO_SENDER_EMAIL,
          name: "WaveTrace Collaboration",
        },
      ],
      subject: "New collaboration request from Wavetrace",
      textContent: `You have a collaboration request from Wavetrace!\nFrom: ${name}\nEmail: ${email}\nMessage: ${message}\nPortfolio: ${portfolioLink}`,
    };

    await brevoApi.sendTransacEmail(sendSmtpEmail);

    res.status(201).json({ success: true, orderId: result.insertedId });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Error saving order or sending email", details: err });
  }
});

export default router;
