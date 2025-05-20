import {app, server, wss} from './server.js';
import express from 'express';
import mongoose from 'mongoose';
import productsRouter from './router/products.router.js';


app.use('/api/products', productsRouter);
