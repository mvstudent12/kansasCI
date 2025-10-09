const session = require("express-session");

const MongoStore = require("connect-mongo");

module.exports = (app) => {
  const dbURI = process.env.MONGO_URI;
  const sessionSecret = process.env.SESSION_SECRET;

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: dbURI,
        collectionName: "sessions",
      }),
      cookie: {
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
        secure: false, // set true in production with HTTPS
        httpOnly: true,
        sameSite: "strict",
      },
    })
  );

  // Make session user available in all views
  app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // now {{user}} works in Handlebars

    next();
  });
};
