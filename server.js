const express = require('express');
const { createServer } = require('http');
const { Server } = require('ws');
const handlebars = require('express-handlebars');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');

const app = express();
const server = createServer(app); // Crear un servidor HTTP
const wss = new Server({ server }); // Crear servidor WebSocket


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

app.use('/public', express.static('public')); // Servir archivos estáticos
app.use(express.json()); // Middleware para manejar JSON

let products = []; // Lista de productos en memoria

app.get('/', (req, res) => { // Renderiza la vista principal
    res.render('home', { products });
});
app.get("/products", (req, res) => {
    res.json(products); // Devuelve los productos guardados en memoria
});


// Manejo de conexión de WebSocket
wss.on('connection', ws => {
    console.log('Nuevo cliente conectado');

    ws.send(JSON.stringify(products)); // Enviar productos actuales al nuevo cliente
    ws.on('message', message => {
        try {
            const newProduct = JSON.parse(message);
            newProduct.id = newProduct.id || Date.now().toString(); // Asigno un ID único al producto
            products.push(newProduct); // Agregar producto al array
            broadcastProducts(); // Actualizar todos los clientes
        } catch (error) {
            console.error('Error al procesar el mensaje:', error);
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});
app.delete("/delete-product/:id", (req, res) => {
    const productId = req.params.id;
    products = products.filter(product => product.id !== productId);
    broadcastProducts(); // Actualizar todos los clientes
    res.json({ message: "Producto eliminado" });
});

app.post("/products", express.json(), (req, res) => {
    const newProduct = req.body;
    products.push(newProduct); 
    broadcastProducts(); 
    res.json({ message: "Producto agregado correctamente", product: newProduct });
});


app.put("/edit-product/:id", express.json(), (req, res) => {
    const productId = req.params.id;
    const { name, price } = req.body;

    const productIndex = products.findIndex(product => product.id === productId);
    if (productIndex !== -1) {
        products[productIndex].name = name;
        products[productIndex].price = price;

        broadcastProducts(); 
        res.json({ message: "Producto actualizado" });
    } else {
        res.status(404).json({ message: "Producto no encontrado" });
    }
});



// Función para enviar los productos a todos los clientes conectados
function broadcastProducts() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(products));
        }
    });
}

module.exports = {
    app,
    server,
    wss,
};