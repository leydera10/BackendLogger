const { userModel, cartModel, messageModel } = require("../dao/mongo/models/users.model.js");
const { createHash, isValidPassword, generateToken } = require('../utils');

class UserRepository {
    constructor(userModel, cartModel, messageModel) {
        this.userModel = userModel;
        this.cartModel = cartModel;
        this.messageModel = messageModel;
    }

    async getAllUsers() {
        try {
            let users = await this.userModel.find();
            return { result: "success", payload: users };
        } catch (error) {
            console.error(error);
            throw new Error("Error al obtener usuarios");
        }
    }

    async createUser({ nombre, apellido, email, password }) {
        if (!nombre || !apellido || !email || !password) {
            throw new Error("Faltan datos");
        }

        try {
            const usuario = await this.userModel.create({ nombre, apellido, email, password });
            return { message: "Usuario creado con exito", user: usuario };
        } catch (error) {
            console.error(error);
            throw new Error("Error al crear el usuario");
        }
    }

    async registerUserAndMessage({ nombre, apellido, email, password, message, rol }) {
        if (!nombre || !apellido || !email || !password) {
            throw new Error("Faltan datos");
        }

        try {
            const existUser = await this.userModel.findOne({ email });
            if (existUser) {
                throw new Error("El correo ya existe");
            }

            const newCart = await this.cartModel.create({ user: null, products: [], total: 0 });
            const newUser = new this.userModel({
                nombre,
                apellido,
                email,
                password: createHash(password),
                rol: rol || "user",
                cartId: newCart._id
            });
            newUser.user = newUser._id;
            await newUser.save();

            newCart.user = newUser._id;
            await newCart.save();

            if (message) {
                const newMessage = new this.messageModel({ user: newUser._id, message });
                await newMessage.save();
            }

            // No es recomendable hacer redirecciones desde el repositorio, 
            // esto debería ser manejado desde la capa de controladores o rutas
            // res.redirect("/login");

            return "Usuario registrado y mensaje guardado";
        } catch (error) {
            console.error(error);
            throw new Error("Error al guardar usuario y mensaje");
        }
    }

    async loginUser(email, password) {
        try {
            const user = await this.userModel.findOne({ email });

            if (!user || !isValidPassword(user, password)) {
                return { status: 401, message: "Usuario o contraseña incorrecta" };
            }

            const token = generateToken({ email: user.email, nombre: user.nombre, apellido: user.apellido, rol: user.rol });

            return { token, userCart: await this.cartModel.findById(user.cartId) };
        } catch (error) {
            console.error(error);
            throw new Error("Error al ingresar " + error.message);
        }
    }

    async getUserById(userId) {
        try {
            const user = await this.userModel.findById(userId);
            return { user };
        } catch (error) {
            console.error(error);
            throw new Error("Error al obtener información del usuario");
        }
    }

    async logoutUser(req, res) {
        try {
            req.session.destroy((error) => {
                if (error) {
                    return { status: "Error al desconectarse", body: error };
                }
                // Redirigir desde el repositorio no es una buena práctica,
                // debería manejarse desde los controladores o rutas
                return { redirect: "../../login" };
            });
        } catch (error) {
            console.error(error);
            throw new Error("Error al cerrar sesión");
        }
    }

    async updateUser(uid, userToReplace) {
        try {
            const updateFields = { ...userToReplace };
            delete updateFields._id;

            const userUpdate = await this.userModel.findByIdAndUpdate(uid, updateFields, { new: true });

            if (!userUpdate) {
                return { status: 404, error: "Usuario no encontrado" };
            }

            return { status: "success", message: "Usuario actualizado", user: userUpdate };
        } catch (error) {
            console.error(error);
            throw new Error("Error al actualizar el usuario");
        }
    }

    async deleteUser(uid) {
        try {
            await this.userModel.findByIdAndDelete(uid);
            return { message: "Usuario eliminado" };
        } catch (error) {
            console.error(error);
            throw new Error("Error al eliminar el usuario");
        }
    }
}

module.exports = UserRepository;