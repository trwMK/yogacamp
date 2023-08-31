const express = require('express');
const router = express.Router();
const studios = require('../controllers/studios');

//Multer für Bilder Upload verfügbar machen
const multer  = require('multer')

// Require unseren Storage von Cloudinary für den Multer Folder
// Also wo wir die hochgeladenen Bilder speicher möchten
const {storage} = require('../cloudinary')

//Wo die Uploads gespeichert werden sollen
//Sollen in dem Storage von Cloudinary gespeichert werden, den wir unter Cloudinary -> index.js erstellt haben
const upload = multer({ storage })

//Damit wir nicht überall async bei den Routes schreiben müssen, welche Berechnungen oder etwas holen müssen, definieren wir da eine Methode
const catchAsync = require('../utils/catchAsync');

//Middleware für Authentifikation
const {isLoggedIn, isAuthor, validateStudios} = require('../middleware');

//Routen für die Studios
router.route('/')
    .get(catchAsync(studios.index))
    //Post Route mit Middleware für Login Abfrage, Validation, Uploaden Images in Mongo und Cloudinary und Erstellung eines Studios 
    .post(isLoggedIn, upload.array('image'), validateStudios, catchAsync(studios.createStudio));

router.get('/new', isLoggedIn, (studios.renderNewForm))

router.route('/:id')
    .get(catchAsync(studios.showStudio))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateStudios, catchAsync(studios.updateStudio))
    .delete(isLoggedIn, isAuthor, catchAsync(studios.deleteStudio));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(studios.renderEditForm))

module.exports = router;