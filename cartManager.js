import { cartModel } from './models/cart.model.js';

async function createCart() { //creo un objeto cart y lo guardo en un archivo json
    try {
        const newCart = await cartModel.create({ products: [] }); //creo un nuevo cart con un array de productos vacío
        return newCart;
    } catch (error) {
        console.error('Error al crear el cart:', error);
    }
}

async function getCarts() {
    try {
        const carts = await cartModel.find().populate("products.product").lean();
        console.log("Carritos obtenidos:", carts);
        return carts;
    } catch (error) {
        console.error("Error al obtener los carritos:", error);
    }
 }

async function getCartById(cartId) { //busco un cart por id
    try {
    const cart = await cartModel.findById(cartId).populate("products.product").lean();
        if (!cart) {
            console.log("Carrito no encontrado.");
            return null;
        }
        return cart;
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
    }
}

async function addProductToCart(cartId, productId) {
    try {
        const cart = await cartModel.findById(cartId);
        if (cart) {
            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
            if (productIndex !== -1) {
                cart.products[productIndex].quantity += 1; // Si ya está, aumenta la cantidad
                console.log("Producto ya en el carrito, cantidad incrementada.");
            } else {
                cart.products.push({ product: productId, quantity: 1 }); // Si no está, lo agrega
                console.log("Producto agregado al carrito.");
            }
            await cart.save();
            return cart;
        }
    } catch (error) {
        console.error("Error al agregar producto al carrito:", error);
    }
}
    
export {
    createCart,
    getCarts,
    getCartById,
    addProductToCart
};
