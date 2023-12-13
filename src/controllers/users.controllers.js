const {userModel} = require("../dao/mongo/models/users.model.js");
const {cartModel} = require("../dao/mongo/models/carts.model.js");
const {messageModel} = require("../dao/mongo/models/messages.model.js");
const { createHash, isValidPassword, generateToken, authToken } = require('../utils');
const UserDTO = require("../dao/DTOs/user.dto.js");
const UserDao = require("../dao/mongo/users.mongo.js");
const logger = require("../logger.js");

const userDao = new UserDao();


async function getUserByEmail(email) {
  // Aquí debes escribir la lógica para buscar un usuario por su correo electrónico en la base de datos
  // Puedes usar un modelo de Mongoose para interactuar con tu base de datos
  const user = await userModel.findOne({ email }); // Suponiendo que tienes un modelo llamado 'User'

  return user; // Devuelves el usuario encontrado (o null si no se encontró)
}

// obtener todos los usuarios
async function getAllUsers(req, res) {
  try {
    let users = await userModel.find();
    res.send({ result: "success", payload: users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
}

async function getUserById(req, res) {
  const { uid } = req.params;
  try {
    const user = await userModel.findById(uid);
    if (!user) {
      return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
    }
    res.json({ status: "success", payload: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al obtener el usuario por ID" });
  }
}
  
async function createUser(req, res) {
  const { nombre, apellido, email, password } = req.body;
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ status: "error", error: "Faltan datos" });
  }

  try {
    const usuario = await userModel.create({ nombre, apellido, email, password });
    res.json({ message: "Usuario creado con exito", user: usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al crear el usuario" });
  }
}

async function registerUserAndMessage(req, res) {
  const { nombre, apellido, email, password, message, rol } = req.body;
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ status: "error", error: "Faltan datos" });
  }

  try {
    const existUser = await userModel.findOne({ email });
    if (existUser) {
      return res.status(400).json({ status: "error", error: "El correo ya existe" });
    }

    const newCart = await cartModel.create({ user: null, products: [], total: 0 });
    const newUser = new userModel({ nombre, apellido, email, password: createHash(password), rol: rol || "user", cartId: newCart._id });
    newUser.user = newUser._id;
    await newUser.save();

    newCart.user = newUser._id;
    await newCart.save();

    if (message) {
      const newMessage = new messageModel({ user: newUser._id, message });
      await newMessage.save();
    }

    res.redirect("/login");// no funciona
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al guardar usuario y mensaje" });
  }
}

// LOGIN
async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user || !isValidPassword(user, password)) {
      logger.error("Usuario o contraseña incorrecta");
      return res.status(401).json({ message: "Usuario o contraseña incorrecta" });
    }

    const token = generateToken({ email: user.email, nombre: user.nombre, apellido: user.apellido, rol: user.rol });
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    const userCart = await cartModel.findById(user.cartId);

    logger.info("Inicio de sesión exitoso para el usuario: " + user.email);
    logger.info("Token generado para el usuario: " + token);
    // consolelog de usuario y token
    /* console.log("token desde usercontrolers",token)
    console.log(user) */
   

    res.status(200).json({ token, userCart });
  } catch (error) {
    res.status(500).json({ error: "Error al ingresar " + error.message });
  }
}

async function getUserInfo(req, res) {
  const user = req.user;
  res.json({ user });
}

async function logoutUser(req, res) {
  req.session.destroy((error) => {
    if (error) {
      return res.json({ status: "Error al desconectarse", body: error });
    }
    res.redirect("../../login");
  });
}

async function updateUser(req, res) {
  const { uid } = req.params;
  const userToReplace = req.body;
  try {
    const updateFields = { ...userToReplace };
    delete updateFields._id;

    const userUpdate = await userModel.findByIdAndUpdate(uid, updateFields, { new: true });

    if (!userUpdate) {
      logger.error("Usuario no encontrado al intentar actualizar");
      return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
    }

    logger.info("Usuario actualizado correctamente:", userUpdate);
    res.json({ status: "success", message: "Usuario actualizado", user: userUpdate });
  } catch (error) {
    logger.error("Error al actualizar el usuario:", error);
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al actualizar el usuario" });
  }
}

async function deleteUser(req, res) {
  const { uid } = req.params;
  try {
    await userModel.findByIdAndDelete(uid);
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al eliminar el usuario" });
  }
}

module.exports = {
  registerUserAndMessage,
  getUserById,
  loginUser,
  getUserInfo,
  logoutUser,
  updateUser,
  deleteUser,
  getAllUsers,
  createUser,
  getUserByEmail,
};