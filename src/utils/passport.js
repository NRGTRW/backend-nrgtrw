import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../prisma/client.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email,
              provider: 'google',
              providerId: profile.id,
              isVerified: true,
              password: '', // Not used for social login
            },
          });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport; 