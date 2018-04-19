/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import { Strategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import mongoose from "mongoose";

export default app => {
  const UserModel = mongoose.model("User");

  passport.use(
    new Strategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          ExtractJwt.fromUrlQueryParameter("auth_token"),
          ExtractJwt.fromAuthHeaderAsBearerToken()
        ]),
        secretOrKey: process.env.AUTH_JWT_SECRET
      },
      async (jwtPayload, done) => {
        try {
          const user = await UserModel.findById(jwtPayload._id);
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  app.use((req, res, next) => {
    passport.authenticate("jwt", { session: true }, (err, user) => {
      if (user) {
        req.user = user;
      }
      next();
    })(req, res, next);
  });

  app.get("/test", (req, res) => {
    res.send({ query: req.query, user: req.user });
  });
};
