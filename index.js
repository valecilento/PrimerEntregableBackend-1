const productManager = require('./productManager.js');
const cartManager = require('./cartManager.js');
const uploader = require("./utils");
const { app, server, wss} = require('./server.js');
const WebSocket = require('ws');
const handlebars = require('express-handlebars');

const PORT = 4000;

// Inicia el servidor
server.listen(PORT, () => {
    try {
        console.log(`Servidor HTTP corriendo en http://localhost:${PORT}`);
        console.log(`\t1). http://localhost:${PORT}/api/products`);
        console.log(`\t2). http://localhost:${PORT}/api/carts`);
        // Inicia el servidor WebSocket la ruta de la API a productos y carritos
    }
    catch (error) {
        console.error("Error al iniciar el servidor:", error);
    }
});