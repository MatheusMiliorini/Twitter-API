require('dotenv').config();

const express = require('express');
const app = express();
const routes = require('./routes');
const cors = require('cors');
require('./DataBase');
const cookieParser = require('cookie-parser');

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(routes);

app.listen(3333, () => {
    console.log("Servidor rodando");
});