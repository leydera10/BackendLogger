const mongoose = require("mongoose");
const config = require("../config/factory.config.js");
const dotenv = require("dotenv");

dotenv.config();
let Users;
let Carts;
let Products;

switch (config.persistence) {
  case "MONGO":
    console.log("Using MongoDB");
    mongoose.connect(process.env.MONGOURL)
      .then(() => {
        Users = require("./mongo/users.mongo.js");
        Carts = require("./mongo/carts.mongo.js");
        Products = require("./mongo/products.mongo.js");
        console.log("Connected to MongoDB");
      })
      .catch(error => {
        console.error("Error connecting to MongoDB:", error);
      });
    break;
  case "MEMORY":
    console.log("Using Memory");
    Users = require("../dao/memory/user.memory.js");
    Carts = require("../dao/memory/cart.memory.js");
    Products = require("../dao/memory/product.memory.js");
    break;
}

module.exports = { Users, Carts, Products };