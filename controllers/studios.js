//Studio Modell
const Studio = require('../models/studio');
const { cloudinary } = require("../cloudinary");

// Require Mapbox für Geodaten
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const studios = await Studio.find({});
    res.render('studios/index', { studios })
}

module.exports.renderNewForm = (req, res) => {
    res.render('studios/new');
}

module.exports.createStudio = async (req, res , next) => {
    //GeoCoder Client hier einfügen und die Daten auslesen, um an die Koordinaten zu gelangen
    const geoData = await geoCoder.forwardGeocode({
        query: `${req.body.studio.street} ${req.body.studio.streetNumber}, ${req.body.studio.zipcode}, ${req.body.studio.location}`,
        limit: 1
    }).send()
    //if(!req.body.studio) throw new ExpressError('Invalid Studio Data', 400); 
    const studio = new Studio(req.body.studio);
    //Jetzt setzen wir die Koordinaten für das neue Studio auf das Studio Objekt
    //und speichern das im Modell in der Variabel geometry
    studio.geometry = geoData.body.features[0].geometry;
    //hier haben wir Zugriff auf Multer und dank Multer haben wir Zugriff auf die Upload Files
    //Also auf den Path und filename von den upload Bildern von Cloudinary, die in mongo gespeichert werden
    //Da es ein Array von Images ist, benutze ich die Map Methode um über jedes Element zu gehen
    //Dann returne ich ein Objekt mit dem url und filename
    //Und setzte das auf studio.images, da wir im Modell Images als Array gespeichert haben
    studio.images = req.files.map(file => ({ url: file.path, filename: file.filename }))
    //Speicher den Ersteller des Studios
    studio.author = req.user._id;
    await studio.save();
    console.log(studio);
    //einmalige nachricht an den User mit connect-flash
    req.flash('success', 'Du hast erfolgreich ein Studio erstellt')
    res.redirect(`/studios/${studio._id}`)
}

module.exports.showStudio = async(req, res) => {
    //Populate, damit die Reviews und der Author angezeigt werden
    //Nested pupulate
    //Zeige alle Reviews, dann Zeige den Author von der Review
    //Zeige den Author von dem Studio
    const studio = await Studio.findById(req.params.id).populate({ 
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    //Falls das Studio mit der ID nicht existiert, Fehlermeldung und zurück zu Index Seite
    if(!studio) {
        req.flash('error', 'Das Studio existiert nicht!');
        return res.redirect('/studios');
    }
    res.render('studios/show', { studio });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const studio = await Studio.findById(id);
    //Falls das Studio mit der ID nicht existiert, Fehlermeldung und zurück zu Index Seite
    if(!studio) {
        req.flash('error', 'Das Studio existiert nicht!');
        return res.redirect('/studios');
    }
    //Check ob der User der Eigentümer des Studios ist
    if(!studio.author.equals(req.user._id)) {
        req.flash('error', 'Du hast keine Berechtigung');
        return res.redirect(`/studios/${id}`);
    }
    res.render('studios/edit', { studio })  
}

module.exports.updateStudio = async (req, res) => {
    const { id } = req.params;
    const studio = await Studio.findByIdAndUpdate(id, { ...req.body.studio });
    //Varibale um die Bilder zu speichern, da man kein Array in einem Array speicher kann
    const imgs = req.files.map(file => ({ url: file.path, filename: file.filename }))
    //gleiche wie beim Erstellen eines Studios nur hier werden die Bilder in das Array gepusht, damit die anderen Bilder nicht verloren gehen
    //mit dem Spread Operator (...) kann man andere Element anhängen
    studio.images.push(...imgs);
    await studio.save();
    //Lösche alle Images die der Nutzer in Edit Studio löschen möcbhte
    if(req.body.deleteImages) {
        //lösche alle Bilder aus dem Array von Cloudinary
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await studio.updateOne({$pull: { images: { filename: { $in: req.body.deleteImages }}}})
    }
    req.flash('success', 'Du hast erfolgreich ein Studio aktualisiert')
    res.redirect(`/studios/${studio._id}`)
}

module.exports.deleteStudio = async (req, res) => {
    const { id } = req.params;
    await Studio.findByIdAndDelete(id);
    //einmalige Nachricht nach dem löschen eines Studios
    req.flash('success', 'Du hast erfolgreich ein Studio gelöscht');
    res.redirect('/studios');
}