const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: GitHubStrategy } = require("passport-github2");
const User = require("../models/User");
const logger = require("../utils/logger");

// ─── JWT Strategy ──────────────────────────────────────────────────────────────
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET || "access_secret_change_in_prod",
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id).select("-password -refreshTokens");
        if (!user || !user.isActive) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// ─── Google OAuth Strategy ────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || "http://localhost:5000"}/api/v1/auth/google/callback`,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ "oauth.google.id": profile.id });

          if (!user) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              user.oauth = user.oauth || {};
              user.oauth.google = { id: profile.id };
              await user.save();
            } else {
              user = await User.create({
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
                avatar: { url: profile.photos[0]?.value },
                isEmailVerified: true,
                "oauth.google.id": profile.id,
                role: "employee",
                password: require("crypto").randomBytes(32).toString("hex"),
              });
            }
          }

          return done(null, user);
        } catch (err) {
          logger.error("Google OAuth error:", err);
          return done(err, false);
        }
      }
    )
  );
}

// ─── GitHub OAuth Strategy ────────────────────────────────────────────────────
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || "http://localhost:5000"}/api/v1/auth/github/callback`,
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          let user = await User.findOne({ "oauth.github.id": profile.id });

          if (!user) {
            user = email ? await User.findOne({ email }) : null;
            if (user) {
              user.oauth = user.oauth || {};
              user.oauth.github = { id: profile.id };
              await user.save();
            } else {
              user = await User.create({
                firstName: profile.displayName?.split(" ")[0] || profile.username,
                lastName: profile.displayName?.split(" ")[1] || "",
                email: email || `${profile.username}@github.local`,
                avatar: { url: profile.photos[0]?.value },
                isEmailVerified: !!email,
                "oauth.github.id": profile.id,
                role: "employee",
                password: require("crypto").randomBytes(32).toString("hex"),
              });
            }
          }

          return done(null, user);
        } catch (err) {
          logger.error("GitHub OAuth error:", err);
          return done(err, false);
        }
      }
    )
  );
}

module.exports = passport;
