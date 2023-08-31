const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

//Das erzeugt ein Username und Passwort zu unserem Schema
//Das überprüft, ob der Username einmalig ist und gibt uns weitere Methoden
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);