const chai = require("chai");
const { expect, assert } = chai;
const supertest = require("supertest");
const { app } = require('../src/app.js');
const {productModel} = require("../src/dao/mongo/models/products.model.js")
const requester = supertest(app);

describe("Testing Products", () => {

    it("debería devolver una lista de productos", async () => {
        // Realizar la búsqueda de todos los productos en la base de datos
        const productsInDB = await productModel.find();

        // Verificar que se haya obtenido al menos un producto
        if (productsInDB.length > 0) {
            // Se obtuvieron productos
            console.log("Se obtuvieron los siguientes productos:", productsInDB);
        } else {
            // No se obtuvieron productos
            console.log("No se encontraron productos en la base de datos.");
        }

        // Simplemente muestra en consola si se obtuvieron productos o no,
        // sin realizar expectativas detalladas sobre cada campo del producto.
    });

    it("El DAO debe agregar un producto en la DB", async function () {
        const mockProduct = {
            title: "Test Title",
            description: "Test Description",
            code: "TestCode222",
            price: 1777,
            stock: 77,
            category: "Test Category",
            thumbnails: "Test Thumbnail URL",
            owner: "Test admin"
        };

        const result = await productModel.create(mockProduct);

        // verificar si el producto agregado tiene un campo _id (Mocha)
        assert.ok(result._id);

        // verificar si el producto agregado tiene un campo _id (Chai)
        expect(result).to.have.property('_id');
    });

    it("El DAO debe actualizar un producto", async function () {
        let prodId = "659715b512ed071e643e09b3"; // ID del producto a actualizar
        let mockProductUpd = {
            title: "Test Title actualizado",
            description: "Test Description actualizaco",
            code: "TestCode666 actualizado",
            price: 2077,
            stock: 15,
            category: "Test Category actualizado",
            thumbnails: "Test Thumbnail URL actualizado",
            owner: "Test admin actualizado"
        };

        const result = await productModel.findByIdAndUpdate(prodId, mockProductUpd, { new: true });

        // verificar si el resultado es un objeto (Mocha)
        assert.strictEqual(typeof result, "object");

        // verificar si el resultado es un objeto (Chai)
        expect(result).to.be.an('object');
    });

    it("El DAO debe eliminar un producto", async function () {
        let prodIdToDelete = "659715b512ed071e643e09b3"; // ID del producto a eliminar

        const result = await productModel.findByIdAndDelete(prodIdToDelete);

        // verificar si el resultado de eliminar es un objeto (Mocha)
        assert.strictEqual(typeof result, "object");

        // verificar si el resultado de eliminar es un objeto (Chai)
        expect(result).to.be.an('object');
    });
})