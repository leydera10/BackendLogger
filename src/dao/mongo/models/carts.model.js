const mongoose = require("mongoose");

const cartsCollection = "carts";

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
        quantity: { type: Number, default: 1 } // Ajusta el tipo de dato según tu necesidad
    }],
    total: {type: Number, required: true}
    
});

const cartModel = mongoose.model(cartsCollection, cartSchema)

module.exports = {cartModel}