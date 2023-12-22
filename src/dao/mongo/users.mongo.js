const bcrypt = require("bcrypt")
const {userModel} = require("./models/users.model.js");


class UserDAO {
  // Funciones DAO para el manejo de los usuarios en la base de datos
    async getAllUsers() {
        try {
            const users = await userModel.find();
            return { result: "success", payload: users };
        } catch (error) {
            console.error(error);
            return null;
        }
    }   
    async createUser(userData) {
        const { nombre, apellido, email, password } = userData;
        if (!nombre || !apellido || !email || !password) {
            return { status: "error", error: "Missing data" };
        } 
        try {
            const usuario = await userModel.create({ nombre, apellido, email, password });
            return { message: "User created", user: usuario };
        } catch (error) {
            console.error(error);
            return { status: "error", error: "Error creating user" };
        }
    }

    // buscar usuario por id 
    async getUserById(userId) {
        try {
            const user = await userModel.findById(userId);
            return user;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    //buscar usuario por correo
    async getUserByEmail(email) {
        try {
          const user = await userModel.findOne({ email });
          return user;
        } catch (error) {
          console.error(error);
          return null;
        }
    }

    async comparePasswords(newPassword, hashedPassword) {
        try {
          return await bcrypt.compare(newPassword, hashedPassword);
        } catch (error) {
          console.error('Error al comparar contraseñas:', error);
          return false; // Manejar el error según la lógica de tu aplicación
        }
    }

    async updatePassword(userId, newPassword) {
        try {
          const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { password: newPassword },
            { new: true }
          );
      
          return updatedUser;
        } catch (error) {
          console.error(`Error al actualizar la contraseña: ${error}`);
          return null;
        }
    }

    async updateUserById(userId, updateFields) {
        try {
            const updatedUser = await userModel.findByIdAndUpdate(userId, updateFields, { new: true });
            return updatedUser;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async deleteUserById(userId) {
        try {
            await userModel.findByIdAndDelete(userId);
            return { message: "User deleted" };
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

module.exports = UserDAO;