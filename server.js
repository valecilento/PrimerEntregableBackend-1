import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';
import { productModel } from './models/products.model.js';
import productsRouter from './router/products.router.js';
import multer from 'multer';
import handlebars from 'express-handlebars';


const app = express();
app.use(express.json());
const PORT = 4000;
app.use('/api/products', productsRouter);
// app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
// server.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));


const server = createServer(app); // Crea un servidor HTTP
const wss = new WebSocketServer({ server }); // Crea servidor WebSocket
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 


mongoose.connect('mongodb+srv://valeecilento:AyxG2N0QnTBNbBxr@cluster0.mmnvabv.mongodb.net/products').then(() => {
    console.log('Conectado a la base de datos');
    server.listen(PORT, () => {
        console.log(`Servidor HTTP corriendo en http://localhost:${PORT}`);
    });
    app.listen(PORT, () => {
        console.log(`API disponible`);
    })
}).catch(error => {
    console.error('Error al conectar a la base de datos:', error);
});

let products = productsRouter.products;

app.get('/', (req, res) => { // Renderiza la vista principal
     res.render('home', { products });
});

wss.on('connection', async (ws) => {
    console.log('Nuevo cliente conectado');

    const productsData = await productModel.find().lean();
    console.log('Productos enviados al cliente:', productsData); // Mensaje con los productos en consola
    ws.send(JSON.stringify(productsData));

    ws.on('message', async (message) => {
        try {
            broadcastProducts(); // Actualiza clientes
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
        const productsData = await productModel.find().lean();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(productsData));
            }
        });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
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
app.use(express.json()); 
app.use('/api/products', productsRouter);

export { app, server, wss };
