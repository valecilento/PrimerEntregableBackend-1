const fs = require('fs');
const path = require('path');

const pathProducts = path.join(__dirname, 'products.json');

function getProducts() {
    const products = fs.readFileSync(pathProducts, 'utf-8');
    return JSON.parse(products);
}
  
function getProductById(id) {
    const products = getProducts();
    return products.find(product => product.id === id);
}

function addProduct(product) {
    const products = getProducts();
    const newProduct = { ...product, id: products.length + 1 };
    products.push(newProduct);
    fs.writeFileSync(pathProducts, JSON.stringify(products));
}

function updateProduct(id, product) {
    const products = getProducts();
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) { // si existe el producto
        products[index] = { ...product, id }; //actualizo el producto en la posicion index
        fs.writeFileSync(pathProducts, JSON.stringify(products));
    } else {
        console.log('Product not found');
    }
}

function deleteProduct(id) {
    const products = getProducts();
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) { // si existe el producto
        products.splice(index, 1); //elimina el producto en la posicion index 
        fs.writeFileSync(pathProducts, JSON.stringify(products));
    } else {
        console.log('Product not found');
    }
}

module.exports = {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
};

addProduct({
    title: "Product A",
    description: "Description A",
    price: 10.99,
    thumbnail: "thumbnailA.jpg",
    code: "codeA",
    stock: 100,
    category: "Category A"
});
console.log(getProducts())
updateProduct(7, {
    title: "Product B",
    description: "Description B",
    price: 20.99,
    thumbnail: "thumbnailB.jpg",
    code: "codeB",
    stock: 50,
    category: "Category B"
});
console.log(getProducts())
deleteProduct(7)
console.log(getProducts())