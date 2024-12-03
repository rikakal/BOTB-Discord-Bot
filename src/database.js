require('dotenv').config();
const mongoose = require('mongoose');

const mongoDB = process.env.DB;

mongoose.connection.on("connected", () => {
    console.log("Mongoose connected");
});

mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err);
});
  
mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected from the database");
});
  
const db = mongoose.connect(mongoDB);

module.exports = db;