//Um die Virtuels in das Dokument einzufügen, wenn das Dokument zu JSON konvertiert wird
const opts = { toJSON: { virtuals: true}};
const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

//Erstelle Schema nur für Bilder wegen Thmubnails 
const ImageSchema = new Schema({
    url: String,
    filename: String 
});

// Create a virtual property `thumbnail` that's computed from `url`.
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const StudiosSchema = new Schema({
    title: String,
    //Nestes Schema Image um die Bilder anzeigen zu lassen
    images: [ImageSchema],
    geometry: {
       type: {
        type: String,
        enum: ['Point'], //'location.type' must be 'Point'
        required: true
       },
       coordinates: {
        type: [Number],
        required: true
       }
    },
    price: Number,
    offer: String,
    description: String,
    street: String,
    streetNumber: Number,
    zipcode: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
         }
    ],
}, opts);

//Create a virtual property fpr cluster mapbox
//to show the pop up right
//Nested popUpMarkup in Properties
// properties: {porpUpMarkup: {}}
StudiosSchema.virtual('properties.popUpMarkup').get(function() {
    return `<a href="/studios/$(this._id)">${this.title}</a>
    <p>${this.description.substring(0,25)}...</p>`;
});



// Middleware von Mongoose
//Falls ein Studio geläscht wird, sollen alle Reviews ebenfalls gelöscht werden
//Mit Methode Post erhält man Zugirff auf die gelöschten Daten, als hier das Studio
//Dann können wir die Objekt ID der Reviews aus dem Array löschen löschen
StudiosSchema.post('findOneAndDelete', async function(doc) {
    if(doc) {
        //Wenn ein Objekt gefunden und gelöscht wurde
        //lösche die Reviews, die in dem Objekt gefunden wurden
        await review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Studio', StudiosSchema);