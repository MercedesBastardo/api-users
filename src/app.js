const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const router = require('./routes');
const errorHandler = require('./utils/errorHandler'); 

// Esta es nuestra aplicación
const app = express();

// Middlewares 
app.use(express.json());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(cors());

// Rutas
app.use(router);
app.get('/', (req, res) => {
    return res.send("Mi api ya esta funcionando");
})

// middlewares después de las rutas
app.use(errorHandler)

module.exports = app;