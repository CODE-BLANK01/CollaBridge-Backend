import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getDB } from "../config/db.js";
import * as User from "../models/User.js";

function signToken(id, email, role) {
  return jwt.sign(
    { id: id.toString(), email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register  (no Passport — validates and creates the user)
export async function register(req, res, next) {
  try {
    const errors = User.validate(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join("; ") });
    }

    const db = getDB();
    const existing = await db.collection(User.COLLECTION).findOne({
      email: req.body.email.trim().toLowerCase(),
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const doc = User.createUserDoc(req.body, hashedPassword);
    const result = await db.collection(User.COLLECTION).insertOne(doc);

    const token = signToken(result.insertedId, doc.email, doc.role);
    res.status(201).json({
      success: true,
      token,
      user: User.safeUser({ _id: result.insertedId, ...doc }),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login  (Passport LocalStrategy runs first via route, sets req.user)
export function login(req, res) {
  const token = signToken(req.user._id, req.user.email, req.user.role);
  res.json({ success: true, token, user: User.safeUser(req.user) });
}

// GET /api/auth/me  (Passport JwtStrategy runs first via route, sets req.user)
export function getMe(req, res) {
  res.json({ success: true, user: req.user });
}
