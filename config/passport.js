import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDB } from "./db.js";
import { COLLECTION, safeUser } from "../models/User.js";

// ─── Local Strategy (email + password login) ─────────────────────────────────
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const db = getDB();
        const user = await db
          .collection(COLLECTION)
          .findOne({ email: email.trim().toLowerCase() });
        if (!user) return done(null, false, { message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return done(null, false, { message: "Invalid credentials" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// ─── JWT Strategy (Bearer token protection) ──────────────────────────────────
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const db = getDB();
        const user = await db
          .collection(COLLECTION)
          .findOne({ _id: new ObjectId(payload.id) });
        if (!user) return done(null, false);
        return done(null, safeUser(user));
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
