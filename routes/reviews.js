const express = require('express');
const reviews = require('../controllers/reviews');
// mergeParams, damit wir Zugriff auf die Studio ID haben die wir in app.js im prefix in der Route definieren
const router = express.Router({mergeParams: true });

//Damit wir nicht überall async bei den Routes schreiben müssen, welche Berechnungen oder etwas holen müssen, definieren wir da eine Methode
const catchAsync = require('../utils/catchAsync');

//Middleware für Authentifikation
const {validateReviews, isLoggedIn, isReviewAuthor} = require('../middleware');


//Routen für die Reviews
//nur / wegen den Prefixes aus der app.js
router.post('/', isLoggedIn, validateReviews, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

 module.exports = router;