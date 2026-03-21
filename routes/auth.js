import { Router } from "express";
import passport from "../config/passport.js";
import { register, login, getMe } from "../controllers/authController.js";
import protect from "../middleware/auth.js";

const router = Router();

// Registration — no Passport (plain validation + bcrypt)
router.post("/register", register);

// Login — Passport LocalStrategy authenticates email/password, then controller issues JWT
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message ?? "Invalid credentials",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
}, login);

// Me — Passport JwtStrategy verifies Bearer token
router.get("/me", protect, getMe);

export default router;
