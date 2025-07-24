import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';

const passportSetup = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/users/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
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
          return done(err, false);
        }
      }
    )
  );
};

export default passportSetup;