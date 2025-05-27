import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { productModel } from './models/products.model.js';
import { cartModel } from './models/cart.model.js';
import WebSocket from 'ws';
import productsRouter from './router/products.router.js';
import cartsRouter from './router/carts.router.js';
import multer from 'multer';
import handlebars from 'express-handlebars';
import { createCart } from './cartManager.js'; 

const app = express();
app.use(express.json());
const PORT = 4000;
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

const server = createServer(app); // Crea un servidor HTTP
const wss = new WebSocketServer({ server }); // Crea servidor WebSocket
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

mongoose.connect('mongodb+srv://valeecilento:oAqWpQQ6EHAePEcJ@cluster0.mmnvabv.mongodb.net/main').then(() => {
    console.log('Conectado a la base de datos');
    server.listen(PORT, () => {
        console.log(`Servidor HTTP corriendo en http://localhost:${PORT}`);
    });
    app.listen(PORT, () => {
        console.log(`API disponible`);
    })
    createCart(); // Inicializa el carrito al iniciar el servidor
}).catch(error => {
    console.error('Error al conectar a la base de datos:', error);
});


app.get('/', async (req, res) => { // Renderiza la vista principal
    const products = await productModel.find().lean(); // Obtiene los productos de la base de datos
    const carts= await cartModel.find().lean();
    res.render('home', { products , carts});
});
app.get('/carts', async (req, res) => { 
    const carts = await cartModel.find().lean(); // Obtiene los carritos de la base de datos
    res.render('carts', { carts });
});

wss.on('connection', async (ws) => {
    console.log('Nuevo cliente conectado');

    const products = await productModel.find().lean();
    const carts = await cartModel.find().populate("products.product").lean();
    console.log('Productos enviados al cliente:', products); // Mensaje con los productos en consola
    console.log('Carritos enviados al cliente:', carts); // Mensaje con los carritos en consola
    ws.send(JSON.stringify({type: "products", payload: products})); // Envía los productos al cliente
    ws.send(JSON.stringify({ type: "carts", payload: carts })); 

    ws.on('message', async (message) => {
        try {
            broadcastProducts(); // Actualiza clientes
            broadcastCarts(); // Actualiza clientes
        } catch (error) {
            console.error('Error al procesar el mensaje:', error);
        }
    });
    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});

async function broadcastProducts() {
    try {
        const products = await productModel.find().lean();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({type: "products", payload: products}));
            }
        });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }
}
async function broadcastCarts() {
    try {
        const carts = await cartModel.find().populate("products.product").lean();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({type: "carts", payload: carts}));
            }
        });
    } catch (error) {
        console.error("Error al obtener carritos:", error);
    }
}

const storage = multer.diskStorage({
    destination: "./public/img/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });
app.post("/upload-img", upload.single("image"), (req, res) => { 
        const imagePath = `/public/img/${req.file.filename}`; // Ruta accesible de la imagen
        res.json({ message: "Imagen subida con éxito", imageUrl: imagePath });  
});

app.use("/img", express.static("public/img"));

// Configuración de Handlebars

app.engine('handlebars', handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars"); 

app.use('/public', express.static('public')); 

export { app, server, wss };
