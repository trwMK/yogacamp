const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    //damit man für den Registrierungsprozess seinen eigene Fehlerhandhabung hat, mach ein eigenständiges try / catch
    try {
    //E-Mail user und passwort aus dem Req.body holen
    const { email, username, password } = req.body;
    //Benutzername und E-Mail in ein neuen User Obejkt packen und das Objekt speicher
    const user = new User({ email, username });
    //Den neuen User registrieren mit Passport und dazu das Passwort angeben, welches dann von Passport gehasht wird mit einem salt
    // das Objekt User mit dem Password in ein neues Objekt speichern
    //Den User mit der Methode register von passport registrieren
    //In einen Await packen, da es Zeit braucht und mit Mongoose interagiert
    const registerdUser = await User.register(user, password);
    //Nach dem Regitrieren kann man den User direkt einloggen
    req.login(registerdUser, err => {
      //Wenn es ein Fehler gibt, FM
      if(err) { return next(err);}
      //req.flash um eine Bestätigungsnachricht zu senden
      req.flash('sucess', 'Namaste und willkommen in der Yoga Gemeinschaft.');
      res.redirect('/studios'); 

    })
    } catch(e) {
      //wenn ein Problem ist, dann Flash eine Problem Nachricht
      req.flash('error', e.message);
      //redirect zu Registriertung
      res.redirect('/register');     
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('sucess', 'Schön, dass du wieder da bist.');
    //dafür da um nach dem Login die User zu seinem Path zu navigieren, wo er sich einloggen wollte
    //delete um den Path aus der Session zu löschen
    const redirectionUrl = req.session.redirectUrl || '/studios';
    delete req.session.redirectUrl;
    res.redirect(redirectionUrl);   
}

module.exports.logout = function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', 'Erfolgreich ausgeloggt');
      res.redirect('/');
    });
}