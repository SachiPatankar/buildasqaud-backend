// src/config/passport.ts

import passport, { Profile as PassportProfile } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { UserModel } from '@db';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
} = process.env;

// Validate required env vars at startup
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  throw new Error('Missing Google OAuth environment variables');
}
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_CALLBACK_URL) {
  throw new Error('Missing GitHub OAuth environment variables');
}

export const setupPassport = () => {
  try {
    // REQUIRED: Serialize/deserialize user for session management
    passport.serializeUser((user: any, done) => {
      done(null, user._id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await UserModel.findById(id);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });

    // --- Google Strategy ---
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL,
        },
        async (_, __, profile: PassportProfile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email returned from Google'), null);
            }

            let user = await UserModel.findOne({ googleId: profile.id });

            if (!user) {
              user = await UserModel.findOne({ email });

              if (user) {
                user.googleId = profile.id;
                await user.save();
              } else {
                // create new
                user = new UserModel({
                  googleId: profile.id,
                  first_name: profile.name?.givenName,
                  last_name: profile.name?.familyName,
                  email,
                  photo: profile.photos?.[0]?.value,
                });
                await user.save();
              }
            }

            return done(null, user);
          } catch (err) {
            return done(err as Error, null);
          }
        }
      )
    );

    // --- GitHub Strategy ---
    passport.use(
      new GitHubStrategy(
        {
          clientID: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET,
          callbackURL: GITHUB_CALLBACK_URL,
        },
        async (_, __, profile: PassportProfile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email returned from GitHub'), null);
            }

            let user = await UserModel.findOne({ githubId: profile.id });

            if (!user) {
              user = await UserModel.findOne({ email });

              if (user) {
                user.githubId = profile.id;
                await user.save();
              } else {
                const [first_name, ...rest] = (
                  profile.displayName ||
                  profile.username ||
                  ''
                ).split(' ');
                const last_name = rest.join(' ');
                user = new UserModel({
                  githubId: profile.id,
                  first_name,
                  last_name,
                  email,
                  photo: profile.photos?.[0]?.value,
                });
                await user.save();
              }
            }

            return done(null, user);
          } catch (err) {
            return done(err as Error, null);
          }
        }
      )
    );
  } catch (error) {
    console.error('PASSPORT ERROR: ', error);
  }
};
