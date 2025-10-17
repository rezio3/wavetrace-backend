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
    const editRequestsCollection = db.collection("wavetrace-edit-requests");
    const newEditRequest = { email, message, createdAt: new Date() };
    const result = await editRequestsCollection.insertOne(newEditRequest);

    // Wysyłka maila
    const sendSmtpEmail = {
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: "WaveTrace Edit Request",
      },
      to: [
        {
          email: process.env.BREVO_SENDER_EMAIL,
          name: "WaveTrace Edit Request",
        },
      ],
      subject: "New edit request from Wavetrace",
      textContent: `You have an edit request from Wavetrace!\nFrom: ${email}\nMessage: ${message}`,
    };

    await brevoApi.sendTransacEmail(sendSmtpEmail);

    res.status(201).json({ success: true, messageId: result.insertedId });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Error saving message or sending email", details: err });
  }
});

export default router;
