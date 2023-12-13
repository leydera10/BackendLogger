const CartDao = require("../dao/mongo/carts.mongo.js");

class CartRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async getCartById(cartId) {
        try {
            const cart = await this.dao.getCartById(cartId);
            if (!cart) {
                return { message: "Carrito no encontrado" };
            }
            return cart;
        } catch (error) {
            console.error(error);
            throw new Error("Error al obtener el carrito");
        }
    }

    async getAllCarts() {
        try {
            const carts = await this.dao.getAllCarts();
            if (!carts) {
                return { message: "No se encontraron carritos" };
            }
            return carts;
        } catch (error) {
            console.error(error);
            throw new Error("Error al obtener todos los carritos");
        }
    }

    async createCart(newCart) {
        try {
            const cart = await this.dao.createCart(newCart);
            if (!cart) {
                throw new Error("Error al crear el carrito");
            }
            return { message: "Carrito creado", cart };
        } catch (error) {
            console.error(error);
            throw new Error("Error al crear el carrito");
        }
    }

    async addProductToCart(cartId, productIds) {
        try {
            const result = await this.dao.addProductToCart(cartId, productIds);
            return result;
        } catch (error) {
            console.error(error);
            throw new Error("Error al agregar productos al carrito");
        }
    }

    async updateProductQuantity(cartId, productId, newQuantity) {
        try {
            const result = await this.dao.updateProductQuantity(cartId, productId, newQuantity);
            return result;
        } catch (error) {
            console.error(error);
            throw new Error("Error al actualizar la cantidad del producto en el carrito");
        }
    }

    async deleteCartById(cartId) {
        try {
            const result = await this.dao.deleteCartById(cartId);
            return result;
        } catch (error) {
            console.error(error);
            throw new Error("Error al eliminar el carrito");
        }
    }

    async deleteAllProductsInCart(cartId) {
        try {
            const result = await this.dao.deleteAllProductsInCart(cartId);
            return result;
        } catch (error) {
            console.error(error);
            throw new Error("Error al eliminar todos los productos del carrito");
        }
    }

    async deleteProductFromCart(cartId, productId) {
        try {
            const result = await this.dao.deleteProductFromCart(cartId, productId);
            return result;
        } catch (error) {
            console.error(error);
            throw new Error("Error al eliminar el producto del carrito");
        }
    }
}

module.exports = CartRepository;