//Review Modell und Studio Modell für die Verbindung der Reviews zu den Studios
const Studio = require('../models/studio');
const Review = require('../models/review');


module.exports.createReview = async (req, res) => {
    const studio = await Studio.findById(req.params.id);
    const review = new Review(req.body.review);
    //Nach Erstellung des neuen Review, setzen wir den Eigentümer der Review mit req.user._id
    review.author = req.user._id;
    studio.reviews.push(review);
    await review.save();
    await studio.save();
    req.flash('success', 'Du hast erfolgreich eine Bewertung erstellt')
    res.redirect(`/studios/${studio._id}`)
}

module.exports.deleteReview = async (req, res) => {
    //destructor (auseinandernehmen) die Id von dem Studio und die ID von der Review
    const { id, reviewId } = req.params;
     //lösche aus dem Array Reviews von Studio mit Hilfe  der Poll methode von mongoose die Review aus dem Array
     // Finde die ID von Review erster Schritt
     // Dann ein Objekt mit der Methoe Pull von mongoose, diese erhält die Info, dass wir von dem Review Array die review Id löschen wollen
     await Studio.findByIdAndUpdate(id, {$pull: { reviews: reviewId }});
     //lösche die Review
     await Review.findByIdAndDelete(reviewId);
     //einmalige Nachricht nach dem löschen einer Bewerung
     req.flash('success', 'Du hast erfolgreich ein Bewertung gelöscht');
     //lösche die Review von dem Campground
     res.redirect(`/studios/${id}`);
 }