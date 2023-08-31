//FÜR die Datei .env, um Daten geheim zu halten
// Bedeutet, wenn wir im Entwicklungsmodus sind, bentöigte das EMV-paket, dass die Variablen, die ich in 
//dieser Datei definiert habe, nimmt und adde die in Prcoess.env in meine Node APp 
//Damit ich Zugang dazu habe
// In Production brauchen wir das nicht, da gibt es andere Möglichkeiten, Umgebungsvaribalen zu setzen, bei der wir sie nicht in einer Datei speicher und sie einfach in die Umgebung adden
if (process.env.NODE_ENV !== "production") {
   require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
//Helmet helps you secure Express apps by setting various HTTP headers
const helmet = require("helmet");
//Require Mongo Session
const MongoStore = require('connect-mongo');

//Mongoose sanitize to product us from mongosse injection
const mongoSanitize = require('express-mongo-sanitize');

/* Die Path von den einzelnen Routes verfügbar machen, weil wir die benötigen */
const studiosRoutes = require('./routes/studios');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/user');

// Datenbank connecten
//mongodb://localhost:27017/studios
const dbUrl = process.env.DB_URL
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true,
    //useFindAndModify: false
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

//Template Engine aktivieren
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//Method override Methode, damit man die Mehtoden put und delete verwenden kann
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
//Damit wir auf den Public Ordner zugreigen können, müssen wir den hier mit use zur Verfügung stellen
app.use(express.static(path.join(__dirname, 'public')));


// To remove data using these defaults (mongoose sanitize):
app.use(mongoSanitize());

// Basic usage
app.use(session({
    secret: 'thisshouldbeabettersecret!',
    touchAfter: 24 * 60 * 60, //time period in seconds
    store: MongoStore.create({ mongoUrl: dbUrl })
  }));


  
//Session verfügbar machen und ein Objekt erstellen um die Session zu konfigurieren
const sessionConfig = {
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, = when we deploy set it on(this cookie will than only work on https)
        //Expires Date (Wir legen fest wie lange er eingeloggt bleiben kann) ist wichtig, weil sonst kann er für immer eingeloggt bleiben
        //Damit wir das Date.now Objekt in MSek, Sek, Minuten, Stunden, und Tagen
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

//Damit wir eine einmalige Nachricht an den User schickn können, connect-flash benutzen
app.use(flash());

//Middleware from helmet 
app.use(
    helmet({
        crossOriginEmbedderPolicy: false,
    })
  );
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dd6ahivgd/", 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//Damit wir Passport für unsere App zur Verfügung stellen
app.use(passport.initialize());
//Passport.session, damit der User nicht bei jedem Request abgefragt wird und sich neu einloggen muss
//passport.session() muss unter Session(sessionConfig)!!!
app.use(passport.session());
// Hier soll das Plugin Passport die Strategie Local Strategie von Passport auf das User Modell angewandt werden
//DIe Methode authenticate kommt von Passport Lokal Strategie selbst
passport.use(new LocalStrategy(User.authenticate()));

//Die beiden Methoden kommen von passport.js
//Das erläutet Passport wie man einen Benutzer serialisiert
//Serialisation = Wie speichert man ein User und seine Daten in eine Session
passport.serializeUser(User.serializeUser());
//Gegenteil von Serialisation
// Wie bekommt man einen User und seine Daten aus der Session
passport.deserializeUser(User.deserializeUser());

//Middleware für Flash, damit wir die Flash Nachrichten nicht in die einzelnen Routes packen müssen
//Middleware um den aktuellen User zu erhalten
//Globale Objekte
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//die Route Handeler
//Hier benutzen wir die Routen von den einzelnen Routes
//mit den entsprechenden Prefixes
app.use('/studios', studiosRoutes);
app.use('/studios/:id/reviews', reviewsRoutes);
app.use('/', usersRoutes);

//Home Seite erstellen und rendern
app.get('/', (req, res) => {
    res.render('home');
})

//route für Fehlermeldung 404
app.all('*', (req, res, next) => {
    next(new ExpressError('Seite nicht gefunden', 404));
})

//Error Handeler
app.use((err, req, res, next) => {
    const {statusCode = 500 , message = 'Etwas lief schief' } = err;
    if(!err.message) err.message = 'Oh no, something went wrong'
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})