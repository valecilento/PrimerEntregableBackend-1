import {promises as fs} from 'fs';
import path from 'path';

const pathProducts = path.join(__dirname, 'products.json');

async function saveProducts(products) {
    try {
        // Sobrescribe el archivo con el contenido actualizado
        await fs.writeFile(pathProducts, JSON.stringify(products));
    } catch (error) {
        console.error('Error al guardar los productos:', error);
    }
}

async function getProducts() {
    try {
        await fs.access(pathProducts); //verifico si existe el archivo products.json
        const products = await fs.readFile(pathProducts, 'utf-8');
        if (pathProducts === "") { // Si el archivo existe pero está vacío, lo inicializa
            return [];
        }
        return JSON.parse(products);
    } catch (error) {
        if (error.code === 'ENOENT') { // Si el error es que el archivo no existe, lo crea
            return [];
        }
        throw error; 
    }
}
  
async function getProductById(id) {
    const products = await getProducts();
    return products.find(product => product.id === id);
}

async function addProduct(product) {
    const products = await getProducts();
    const newProduct = { ...product, id: products.length + 1 };
    products.push(newProduct);
    saveProducts(products); 
    return newProduct; // Devuelvo el nuevo producto agregado
}

async function updateProduct(id, product) {
    const products = await getProducts();
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) { // si existe el producto
        products[index] = { ...product, id }; //actualizo el producto en la posicion index
        saveProducts(products); 
        return true;
    } else {
        console.log('Product to update not found');
        return false;
    }
}

async function deleteProduct(id) {
    const products = await getProducts();
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) { // si existe el producto
        products.splice(index, 1); //elimina el producto en la posicion index 
        saveProducts(products); 
        return true;
    } else {
        console.log('Product to delete not found');
        return false; 
    }
}
export {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
};
