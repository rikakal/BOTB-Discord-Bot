require('dotenv').config();
const express = require('express');
const app = express();
require("./database");
require("./bot")

const routes = require('./routes/index')

// Middleware
app.use(express.json());
app.use('/api', routes);

// Server for express.js in order to create REST APIs
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
