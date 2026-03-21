import passport from "../config/passport.js";

// Protects routes using the Passport JWT strategy (session-less Bearer token)
const protect = passport.authenticate("jwt", { session: false });

export default protect;
