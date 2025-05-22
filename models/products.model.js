import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // El nombre es obligatorio
        },
    price: {
        type: Number,
        required: true, // El precio es obligatorio
        },
    image: {
        type: String, // almacena la URL de la imagen
        }
});


export const productModel = mongoose.model("products", productSchema);