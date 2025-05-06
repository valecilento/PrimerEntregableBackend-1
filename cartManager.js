const fs = require('fs').promises;
const path = require('path');

const pathCarts = path.join(__dirname, 'carts.json'); 

async function saveCarts(carts) {
    try {
        // Sobrescribe el archivo con el contenido actualizado
        await fs.writeFile(pathCarts, JSON.stringify(carts));
    } catch (error) {
        console.error('Error al guardar los carts:', error);
    }
}

async function createCart() { //creo un objeto cart y lo guardo en un archivo json
    const carts = await getCarts(); //obtengo todos los carts
    const newCart = {
        id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1, // asigno un id único, si hay carts, le sumo 1 al id del último cart, si no hay carts, le asigno el id 1
        products: []
    } //creo un nuevo cart
    carts.push(newCart); //agrego el cart al array de carts
    await saveCarts(carts); 
    await fs.writeFile(pathCarts, JSON.stringify(carts)); //guardo el cart en el archivo json
}

async function getCarts() {
    if (!fs.access(pathCarts)) { //verifico si existe el archivo carts.json
        return []; //si no existe, lo creo
    }
    const carts = await fs.readFile(pathCarts, 'utf-8');
    await saveCarts(carts); 
    return carts ? JSON.parse(carts) : [];
}

async function getCartById(id) { //busco un cart por id
    const carts = await getCarts(); //obtengo todos los carts
    if (carts.length === 0){ //verifico si hay carts
        console.log('No carts found');
        return;
    }
    return carts.find(cart => cart.id === id); //busco el cart por id
}

async function addProductToCart(cartId, productId) { //agrego un producto a un cart
    const carts = await getCarts(); //obtengo todos los carts
    const cart = carts.find(cart => cart.id === cartId); //busco el cart por id

    if (cart) { //si existe el cart
        const productIndex = cart.products.findIndex(product => product.id === productId); // Busco el producto por ID

        if (productIndex !== -1) { //si existe el producto
            cart.products[productIndex].quantity += 1; //si existe, le sumo 1 a la cantidad
            console.log('Product already in cart');
        }else { 
            const product = { id: productId, quantity: 1 }; //si no existe, lo creo con cantidad 1
            cart.products.push(product); //agrego el producto al cart;
            console.log('Product added to cart');
        }
        await fs.writeFile(pathCarts, JSON.stringify(carts)); //guardo el cart en el archivo json

    } else {
      console.log('Cart not found');
    }
 } 
    
// Ejecución de prueba

// async function testCarts() {
//    const carts = await getCarts();
//    console.log("Todos los carts:", carts);
// }
// testCarts(); 

// createCart().then(() => {
//     console.log("Carrito creado correctamente");
// }); 

// async function testGetCartById() {
//     const cart = await getCartById(2); 
//     console.log("Cart con id 2:", cart); 
// }
// testGetCartById();

// addProductToCart(1, 2).then(() => {
//    console.log("Producto agregado correctamente");
// }); 

module.exports = {
    createCart,
    getCarts,
    getCartById,
    addProductToCart
};