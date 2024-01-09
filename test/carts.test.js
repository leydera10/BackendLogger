const chai = require("chai");
const { expect, assert } = chai;
const supertest = require("supertest");
const { app } = require('../src/app.js');
const {cartModel} = require("../src/dao/mongo/models/carts.model.js")
const mongoose = require("mongoose")
const requester = supertest(app);

describe("Testing Products", () => {

    it("El DAO debe devolver una lista de todos los carritos", async function () {
        const cartsInDB = await cartModel.find();

        // verifica se obtuvo al menos un carrito
        if (cartsInDB.length > 0) {
            // imprime los carritos
            console.log("Se obtuvieron los siguientes carritos:", cartsInDB);
        } else {
            // no hay carritos
            console.log("No se encontraron carritos en la base de datos.");
        }

    });

    it("El DAO debe agregar un carrito en la DB", async function () {
        const mockCart = {
            userId: "TestUser123",
            products: [
                { product: new mongoose.Types.ObjectId(), quantity: 2 }, // generar un objeto valido
                { product: new mongoose.Types.ObjectId(), quantity: 3 }  
            ],
            total: 50000
        };

        const result = await cartModel.create(mockCart);

        // verifica si el carrito agregado tiene un campo _id (Mocha)
        assert.ok(result._id);

        // verificar si el carrito agregado tiene un campo _id (Chai)
        expect(result).to.have.property("_id");

        // verifica si el carrito tiene un campo products que es un array (Chai)
        expect(result).to.have.property("products").that.is.an("array");
    });

    it("El DAO debe actualizar un carrito", async function () {
        
        let cartId = "65971c779b5c8cad15396bc7"; // ID del carrito que se quiere actualizar
        let mockCartUpdate = {
            total: 60000, // actualizar el total del carrito
            
        };
    
        const result = await cartModel.findByIdAndUpdate(cartId, mockCartUpdate, { new: true });
    
        // verificar si el resultado es un objeto (Mocha)
        assert.strictEqual(typeof result, "object");
    
        // verificar si el resultado es un objeto (Chai)
        expect(result).to.be.an('object');
    });

    it("El DAO debe eliminar un carrito", async function () {
        let cartIdToDelete = "65971b49bddcbafb5592bbaf"; // ID del carrito a eliminar

        const result = await cartModel.findByIdAndDelete(cartIdToDelete);

        // verificar si el resultado de eliminar es un objeto (Mocha)
        assert.strictEqual(typeof result, "object");

        // verificar si el resultado de eliminar es un objeto (Chai)
        expect(result).to.be.an('object');
    });
})