const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
require('dotenv').config();





function setupSession(app) {
    app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority&appName=Cluster0`,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60, // 14 days
      }),
    }));

    app.use(flash());

    app.use((req, res, next) => {
        res.locals.user = req.session.user
        res.locals.isAdmin = req.session.user && req.session.user.role === 'admin';
        next();
    }   );
}




module.exports = {
  setupSession, 
};