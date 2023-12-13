const ProductDao = require("../dao/mongo/products.mongo");

class ProductsRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async getProducts(page = 1, limit = 20, sortBy = "price") {
        try {
            const options = { page, limit, sort: { [sortBy]: 1 } };
            const result = await this.dao.getPaginatedProducts(options);

            if (!result.products.length) {
                throw new Error("Productos no encontrados");
            }

            return {
                products: result.products,
                currentPage: result.currentPage,
                totalPages: result.totalPages,
            };
        } catch (error) {
            console.error(error);
            throw new Error("Error al obtener productos");
        }
    }

    async getProductById(productId) {
        try {
            const result = await this.dao.getProductById(productId);
            if (!result) {
                throw new Error("Producto no encontrado");
            }

            return {
                title: result.title,
                description: result.description,
                code: result.code,
                price: result.price,
                stock: result.stock,
                category: result.category,
                quantity: result.quantity,
                // Agregar más propiedades si se necesitan
            };
        } catch (error) {
            console.error(error);
            throw new Error("Error al obtener producto por ID");
        }
    }

    async saveProduct(newProduct) {
        try {
            const result = await this.dao.saveProduct(newProduct);
            return { status: "success", result };
        } catch (error) {
            console.error(error);
            throw new Error("Error al guardar producto");
        }
    }

    async updateProduct(productId, updatedProduct) {
        try {
            const result = await this.dao.updateProduct(productId, updatedProduct);
            return { status: "success", result };
        } catch (error) {
            console.error(error);
            throw new Error("Error al actualizar producto");
        }
    }

    async deleteProduct(productId) {
        try {
            const result = await this.dao.deleteProduct(productId);
            return { status: "success", result };
        } catch (error) {
            console.error(error);
            throw new Error("Error al eliminar producto");
        }
    }
}

module.exports = ProductsRepository;