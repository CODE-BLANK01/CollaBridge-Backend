import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import * as User from "../models/User.js";

function signToken(id, email, role) {
  return jwt.sign(
    { id: id.toString(), email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register
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

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const db = getDB();
    const user = await db.collection(User.COLLECTION).findOne({
      email: email.trim().toLowerCase(),
    });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signToken(user._id, user.email, user.role);
    res.json({ success: true, token, user: User.safeUser(user) });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me  (protected)
export async function getMe(req, res) {
  res.json({ success: true, user: req.user });
}
