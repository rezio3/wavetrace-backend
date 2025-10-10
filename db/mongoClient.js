import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
let db;

export async function connectDB() {
  await client.connect();
  db = client.db("wavetrace-database");
  console.log("✅ Połączono z MongoDB");
}

export function getDB() {
  if (!db) throw new Error("❌ Brak połączenia z bazą danych");
  return db;
}
