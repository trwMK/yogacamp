// JOi Schema für Validation
// JOi Schema für Validation
const {yogastudioSchema, reviewSchema} = require('./schemas.js');
//Gleiche für Fehlermeldung, so können wir das Wrappen um die Funktionen
const ExpressError = require('./utils/ExpressError');
//Studio und Review Modell
const Studio = require('./models/studio');
const Review = require('./models/review');



module.exports.isLoggedIn = (req, res, next) => {
    //gucken ob jemand die Berechtigung hat und eingeloggt ist
    if(!req.isAuthenticated()) {
        //Speicher die URL in die Session und redirect dahin bei Fejler
        //Man kann alles was man will in die Session speichern
        req.session.redirectUrl = req.headers.referer || req.originalUrl || req.url;
        
        req.flash('error', 'Bitte einloggen');
        //return die res.redirect (return, damit es keine Fehler mit dem nächsten res.render('studios/new') gibt
        return res.redirect('/login');
    }
    next();
}

//Funktion um die Validierung zu prüfen
//Damit wir die Funktion nicht in die einzelnen Routes schreiben müssen, haben wir hier eine Wrapper Funktion
module.exports.validateStudios = (req, res, next) => {
    // check for error from the object i get back
    const { error } = yogastudioSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
} 

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const studio = await Studio.findById(id);
    if(!studio.author.equals(req.user._id)) {
        req.flash('error', 'Du hast keine Berechtigung');
        return res.redirect(`/studios/${id}`);
    }
    next();
}

//Funktion um die Validierung zu prüfen
//Damit wir die Funktion nicht in die einzelnen Routes schreiben müssen, haben wir hier eine Wrapper Funktion
module.exports.validateReviews = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//Checken ob der User der Eigentümer der Review ist
module.exports.isReviewAuthor = async(req, res, next) => {
    // ReviewId ist von dem req.params siehe reviews.js
    //ID ist für Stido id
    // /studio/id/reviews/id
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'Du hast keine Berechtigung');
        return res.redirect(`/studios/${id}`);
    }
    next();
}



