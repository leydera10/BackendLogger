const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2")

const productsCollection = "products";

const productSchema = new mongoose.Schema({
    title: {type: String, max: 100, required: true},
    description: {type: String, max: 100, required: true},
    code: {type: String, max: 100, required: true},
    price: {type: Number, required: true},
    stock: {type: Number, required: true},
    category: {type: String, max: 100, required: true},
    thumbnails: {type: String, max: 100, required: true},
    quantity: { type: Number, default: 1 }
});


productSchema.plugin(mongoosePaginate);
const productModel = mongoose.model(productsCollection, productSchema)

module.exports = {productModel}
