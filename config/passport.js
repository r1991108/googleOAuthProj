const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const LocalStrategy = require("passport-local");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  console.log("serializing user now");
  done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  console.log("Deserializing user now");
  User.findById({ _id }).then((user) => {
    console.log("Found user");
    done(null, user);
  });
});

// console.log(process.env.GOOGLE_CLIENT_ID);
// console.log(process.env.GOOGLE_CLIENT_SECRET);

passport.use(
  new LocalStrategy((username, password, done) => {
    console.log(username, password);
    User.findOne({ email: username })
      .then(async (user) => {
        if (!user) {
          return done(null, false); // if the user doesn't exist,
        }
        await bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            return done(null, false);
          }
          if (!result) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        });
      })
      .catch((err) => {
        return done(null, false);
      });
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,           // make sure to set key/value of GOOGLE_CLIENT_ID inside .env 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,   // make sure to set key/value of GOOGLE_CLIENT_SECRET inside .env
      callbackURL: "/auth/google/redirect",
    },

    // passport callback
    (accessToken, refreshToken, profile, done) => {
      console.log("test");
      console.log(profile);
      User.findOne({ googleID: profile.id }).then((foundUser) => {
        if (foundUser) {
          console.log("User already exist");
          done(null, foundUser);
        } else {
          console.log("no user");
          new User({
            name: profile.displayName,
            googleID: profile.id,
            thumbnail: profile.photos[0].value,
            email: profile.emails[0].value,
          })
            .save()
            .then((newUser) => {
              console.log("New user created.");
              done(null, newUser);
            });
        }
      });
    }
  )
);
