import express from "express";
import cors from "cors";
import { connectDB } from "./db/mongoClient.js";
import tracksRouter from "./routes/tracks.js";
import ordersRouter from "./routes/orders.js";
import collaborationRouter from "./routes/collaboration.js";
import stripePaymentRouter from "./routes/stripePayment.js";
import stripeWebhook from "./routes/stripeWebhook.js";

const app = express();

app.use(cors());
app.use(express.json());

// Połącz z bazą danych
connectDB().catch((err) => console.error("❌ Błąd połączenia z MongoDB:", err));

// Użyj routerów
app.use("/api/tracks", tracksRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/collaboration", collaborationRouter);
app.use("/api/stripe", stripePaymentRouter);
app.use("/", stripeWebhook);

// Start serwera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server działa na porcie ${PORT}`));

//TO DO

// Po deployu backendu (np. na Render):

// Twój backend uruchamia się na jakimś serwerze Rendera.

// Ten serwer ma inne IP publiczne (nie twoje lokalne).

// Atlas widzi połączenie z nowego IP → „🚫 nie znam cię” → błąd SSL / timeout.

// Dlatego po deployu musisz dodać IP serwera hostingu do whitelist w Atlasie.

// ✅ Opcje rozwiązania
// 🔸 1. Dodać IP hostingu do Atlas

// W MongoDB Atlas → Network Access → Add IP Address
// Wpisz publiczne IP serwera, np. z Render/Railway.
