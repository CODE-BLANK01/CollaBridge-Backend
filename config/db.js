import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

export async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db();
  // console.log(db)
  console.log(`Connected to MongoDB: ${db.databaseName}`);
  return db;
}

export function getDB() {
  if (!db) throw new Error("Database not initialized. Call connectDB first.");
  return db;
}
