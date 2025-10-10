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
    const { email, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Zapis do MongoDB
    const db = getDB();
    const ordersCollection = db.collection("wavetrace-orders");
    const newOrder = { email, message, createdAt: new Date() };
    const result = await ordersCollection.insertOne(newOrder);

    // Wysyłka maila
    const sendSmtpEmail = {
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: "WaveTrace Order",
      },
      to: [{ email: process.env.BREVO_SENDER_EMAIL, name: "WaveTrace Order" }],
      subject: "New request from Wavetrace",
      textContent: `You have a request from Wavetrace!\nFrom: ${email}\nMessage: ${message}`,
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

// OGARNĄĆ TO ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6

// Podsumowując

// Twój kod działa na lokalnym.
// Na produkcji też może działać, pod warunkiem, że:

// Ustawisz env variables (API Key, sender email, MongoDB URI).

// Nadawca maila jest zweryfikowany i poprawnie skonfigurowany (DKIM/DMARC).

// Backend jest hostowany na serwerze Node i ma dostęp do internetu.

// CORS jest ustawione, jeśli frontend i backend są na różnych domenach.
