const {productModel} = require("./models/products.model.js");

class ProductDao {
    async getProducts() {
        try {
            // Lógica para obtener todos los productos
            const products = await productModel.find();
            return products;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getProductById(id) {
        try {
            // Lógica para obtener un producto por ID
            const product = await productModel.findOne({ _id: id });
            return product;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async saveProduct(product) {
        try {
            // Lógica para guardar un producto
            const result = await productModel.create(product);
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async updateProduct(id, product) {
        try {
            // Lógica para actualizar un producto por ID
            const result = await productModel.updateOne({ _id: id }, { $set: product });
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async deleteProduct(id) {
        try {
            // Lógica para eliminar un producto por ID
            const result = await productModel.deleteOne({ _id: id });
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

module.exports = ProductDao;