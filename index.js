import {app} from './server.js';
import productsRouter from './router/products.router.js';
import cartsRouter from './router/carts.router.js';

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
