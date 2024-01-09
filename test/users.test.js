const chai = require("chai");
const { expect, assert } = chai;
const supertest = require("supertest");
const { app } = require('../src/app.js');
const {userModel} = require("../src/dao/mongo/models/users.model.js")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")

const requester = supertest(app);

  
describe("Testing Products", () => {

    it("Debe obtener todos los usuarios de la base de datos", async () => {
        const allUsers = await userModel.find();
        console.log(allUsers)

        // verificar la estructura de los datos obtenidos(Chai)
        expect(allUsers).to.be.an("array");
        
    });
    
    it('Debería crear un usuario en la base de datos', async () => {
        // Datos del usuario a crear
        const userData = {
            nombre: "John",
            apellido: "salchichon",
            email: "john@example.com",
            password: "password123",
            isGithubAuth: false,
            cartId: new mongoose.Types.ObjectId(), // Genera un nuevo ID para el carrito
            rol: "user"
        };

        // Crear un nuevo usuario utilizando el modelo
        const createdUser = await userModel.create(userData);

        // Verificar si el usuario se ha creado correctamente
        expect(createdUser).to.exist;
        expect(createdUser.nombre).to.equal("John");
        expect(createdUser.apellido).to.equal("salchichon");
        expect(createdUser.email).to.equal("john@example.com");
        expect(createdUser.password).to.equal("password123");
        expect(createdUser.isGithubAuth).to.equal(false);
        expect(createdUser.cartId).to.exist; // Verifica si se asignó un cartId válido
        expect(createdUser.rol).to.equal("user");
        
    });

    it("Debe actualizar un usuario existente", async () => {
        let userToUpdId = "659723f82a3e5517e8a553d2"; // ID del usuario a actualizar

        const updatedUserData = {
            nombre: "elban",
            apellido: "dido"
        };

        const updatedUser = await userModel.findByIdAndUpdate(userToUpdId, updatedUserData, { new: true });

        // verificar si el resultado es un objeto (Mocha)
        assert.strictEqual(typeof updatedUser, "object");

        expect(updatedUser).to.be.an("object");
        expect(updatedUser.nombre).to.equal("elban");
        expect(updatedUser.apellido).to.equal("dido");
        
    });

    it("Debe eliminar un usuario existente", async () => {
        let userToDltId = "659723f82a3e5517e8a553d2" //Id del usuario que se quire eliminar

        expect(userToDltId).to.be.a("string"); // Verificar que el ID sea un string (chai)


        const deletedUser = await userModel.findByIdAndDelete(userToDltId);

        expect(deletedUser).to.be.an("object");
        // Verificar si la eliminación fue exitosa
    });

});