require('dotenv').config();

const express = require('express');
const app = express();
const routes = require('./routes');
require('./DataBase');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());
app.use(routes);

app.listen(3333, () => {
    console.log("Servidor rodando");
});