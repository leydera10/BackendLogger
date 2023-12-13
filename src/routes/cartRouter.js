const express = require("express");
const router = express.Router();
const passport =  require("passport");
const { initializePassport, checkRole } = require("../config/passport.config.js");
const cartsControllers = require("../controllers/carts.controllers.js");

/* router.get("/api/carts/:cid", cartsControllers.getCartById); */ //obtener un carritoporid SE MODIFICA PARA QUE LA FUNCION ESTE EN EL DAO
router.get("/api/carts", cartsControllers.getAllCarts); //obtener todos los carritos
router.post("/api/carts", cartsControllers.createCart); //crearuncarrito
router.post("/api/carts/:cid/products", passport.authenticate('current', { session: false }), checkRole('user'), cartsControllers.addProductsToCart); //agregar un producto especifico al carrito
router.put("/api/carts/:cid/products/:pid", cartsControllers.updateProductQuantity); //actualizar la cantidad de un producto en el carrito
router.delete("/api/deletecarts/:id", cartsControllers.deleteCartById); // borrar un carrito especifico
router.delete("/api/deleteproductcarts/:cid", cartsControllers.deleteAllProductsInCart); // borrar todos los productos del un carrito
router.delete("/api/carts/:cid/product/:pid", cartsControllers.deleteProductFromCart); // borrar un producto especifico de un carrito especifico
router.get("/api/carts/:cid/purchase", passport.authenticate('current', { session: false }), checkRole('user'), cartsControllers.purchaseProducts); // realizar la compra total de los productos del carrito
router.get("/api/carts/getusercart", passport.authenticate('current', { session: false }), cartsControllers.getUserCart); //obtener el carrito del usuario

module.exports = router;