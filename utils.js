import multer from "multer"; // se importa multer
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public", "img"))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.fieldname + ".png")
  }
});

const uploader = multer({ storage });

export default uploader;
