const multer = require("multer");
const path = require("path");
// Multer storage configuration

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, Date.now() + Math.random() + path.extname(file.originalname));
    }
});
// Multer file filter for images only

const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/;
    const extname = fileTypes.test(path.extname(file.originalname).toLocaleLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true)
    } else {
        cb('Images Only')
    }
};


const upload = multer({ storage, fileFilter })

module.exports = upload;