const express = require('express');
const router = express.Router();
const users = require('../controllers/users')
//CatchAsync um die Fehler abzufangen und die Next Methode aufzurufen
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    //MAGIC: Middleware von Passport einfügen, welcher die Korrektheit überprüft und als Parameter erhälht, auf welche Strategie es prüfen soll
    //Zudem Extra Parameter im Objekt (von Passport) ob eine Fehlermeldung ershceinen soll und wohin nach Fehler redirect werden soll
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

//Ausloggen mit der Methode logout von Passport
//Braucht seit neustem eine Callback Methode
//Flash Nachricht schicken und zur Homepage redirecten
router.get('/logout', users.logout );

module.exports = router;