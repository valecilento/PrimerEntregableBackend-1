const productManager = require('./productManager.js');
const cartManager = require('./cartManager.js');

// addProduct();

// updateProduct(2,{
 //    id:2,
 // //    title:"Product H",
 //    price:29.99,
  //   category:"Books"
// });

// deleteProduct(3);

// console.log(productos);
//  console.log(getProducts());
console.log(productManager.getProducts());
console.log(cartManager.getCarts());
