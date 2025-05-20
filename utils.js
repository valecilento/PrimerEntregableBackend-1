import multer from "multer";
import express from "express";

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

export default uploader;
