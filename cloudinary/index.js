const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
//Instanzieren eine Instanz von CloudinaryStorage
const storage = new CloudinaryStorage({
  //Objekt von oben einfügen
  cloudinary: cloudinary,
  params: {
    //FOlder für Cloudinary wo wir die Dateien speichern
    folder: "Studios",
    //welche Foramte erlaubt sind
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});

//Damit man das exportieren kann
//die Instanzen Cloudinary und storage
module.exports = {
  cloudinary,
  storage,
};
