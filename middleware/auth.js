import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { COLLECTION, safeUser } from "../models/User.js";

export default async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.slice(7);
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  const db = getDB();
  const user = await db.collection(COLLECTION).findOne({ _id: new ObjectId(decoded.id) });
  if (!user) {
    return res.status(401).json({ success: false, message: "User no longer exists" });
  }

  req.user = safeUser(user);
  next();
}
