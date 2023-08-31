const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//Cloudinary für unsere App einstellen und konfigurieren
//Mit den API KEys etc. von cloudinary in der .env Datei
/* cloudinary.config({ 
    cloud_name: 'dd6ahivgd', 
    api_key: '514925723425896', 
    api_secret: 'UtG0h4NOg-iY9Ee7-ipCKwTDGSE' 
  });
 */  

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
  })
//Instanzieren eine Instanz von CloudinaryStorage
const storage = new CloudinaryStorage({
    //Objekt von oben einfügen
    cloudinary: cloudinary,
    params: {
        //FOlder für Cloudinary wo wir die Dateien speichern
        folder: 'Studios',
        //welche Foramte erlaubt sind
        allowedFormats: ['jpeg', 'png', 'jpg']    
    }
});

//Damit man das exportieren kann
//die Instanzen Cloudinary und storage
module.exports = {
    cloudinary,
    storage
}