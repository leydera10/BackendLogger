const express = require("express");
const router = express.Router();
const passport =  require("passport");
const { checkRole } = require("../config/passport.config.js");
const ProductController = require("../controllers/products.controller.js");


router.get("/products", ProductController.getProducts); // obtener todos los productos
router.get("/product/:pid", ProductController.getProductById); // obtener producto por id
router.post("/api/products", passport.authenticate('current', { session: false }), checkRole('admin'), ProductController.saveProduct); // crear un producto
router.put("/products/:id", passport.authenticate('current', { session: false }), checkRole('admin'), ProductController.updateProduct); // actualizar un producto segun id
router.delete("/products/:id", passport.authenticate('current', { session: false }), checkRole('admin'), ProductController.deleteProduct); // eliminar un producto especifico por id 

module.exports = router;