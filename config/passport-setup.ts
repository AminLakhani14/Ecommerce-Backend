import type { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';

const passportSetup = (passport: PassportStatic) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return;
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/users/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false);
        try {
          let user = await User.findOne({ email: email });

          if (user) {
            // User exists, log them in
            return done(null, user);
          } else {
            // User doesn't exist, create a new user
            const newUser = new User({
              name: profile.displayName,
              email: email,
              googleId: profile.id,
              // Password is not required for OAuth users
            });
            await newUser.save();
            return done(null, newUser);
          }
        } catch (err) {
          console.error(err);
          return done(err instanceof Error ? err : new Error(String(err)), false);
        }
      }
    )
  );
};

export default passportSetup;