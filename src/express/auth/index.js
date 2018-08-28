import mongoose from 'mongoose';
import passport from 'passport';
import cookieParser from 'cookie-parser';

import { hash } from '../../../lib/password';
import jwt from './jsonWebToken';

export default app => {
  const User = mongoose.model('User');

  // create root user
  User.findOne({ email: process.env.ROOT_USER_MAIL }).then(async rootUser => {
    if (!rootUser && process.env.ROOT_USER_MAIL) {
      User.create({
        email: process.env.ROOT_USER_MAIL,
        password: hash(process.env.ROOT_USER_PASSWORD),
        role: 'BACKEND',
      });
    }
  });

  app.use(cookieParser());
  app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
  });
  const parseCookieToken = async (req, res, next) => {
    req.headers.authorization = `Bearer ${req.cookies.token}`;

    return next();
  };
  app.use(parseCookieToken);
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    done(null, await User.findById(id));
  });

  jwt(app);
};
