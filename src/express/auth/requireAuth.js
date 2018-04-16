export default ({ role = 'WEB' }) => (req, res, next) => {
  if (!req.user) {
    return res.redirect(`/login?from=${req.originalUrl}`);
    // next(new Error("Couldn't find user"));
  } else if (req.user.role !== role) {
    return res.redirect(`/login?from=${req.originalUrl}`);
    // next(new Error('You have no permissions'));
  }
  return next();
};
