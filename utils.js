const multer = require ("multer");
const express = require ("express");
const app = express ();

const storage = multer.diskStorage({
     destination: function (req, file, cb) {
             cb(null, path.join(__dirname, "public", "img") )
     },
     filename: function (req, file, cb) {
             cb(null, Date.now() + "-" + file.fieldname +  ".png")
     }
});

const uploader = multer({storage});

module.exports = {
      uploader,
};
