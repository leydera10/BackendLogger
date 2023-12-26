const {userModel} = require("../dao/mongo/models/users.model.js");
const {cartModel} = require("../dao/mongo/models/carts.model.js");
const {messageModel} = require("../dao/mongo/models/messages.model.js");
const { createHash, isValidPassword, generateToken, generateTokenRecovery } = require('../utils');
const UserDTO = require("../dao/DTOs/user.dto.js");
const bcrypt = require("bcrypt")
const { transporter } = require("../routes/mailRouter");
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
    logger.info("rol del usuario: " + user.rol);
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

async function updatePasswordByEmail(req, res) {
  const { email, newPassword } = req.body;

  try {
    const user = await userDao.getUserByEmail(email);

    if (!user) {
      return res.status(400).json({ error: "No se encontró el usuario" });
    }

    const matchOldPassword = await bcrypt.compare(newPassword, user.password);

    if (matchOldPassword) {
      return res.status(400).json({ error: "La nueva contraseña no puede ser igual a la anterior" });
    }

    const hashedPassword = createHash(newPassword);

    const userUpdate = await userDao.updatePassword(user._id, hashedPassword);

    if (!userUpdate) {
      throw new Error("Error al actualizar la contraseña");
    }

    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error(`Error al buscar al usuario o actualizar la contraseña: ${error}`);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
  /* try {
    const user = await userDao.getUserByEmail(email);

    if (!user) {
      return res.status(400).json({ error: "No se encontró el usuario" });
    }
    
    // Comparar la nueva contraseña con la anterior
    
    console.log(user.password)
    console.log(newPassword)

    const matchOldPassword = await bcrypt.compare(newPassword, user.password);
    

    console.log(matchOldPassword)
    if (matchOldPassword) {
      return res.status(400).json({ error: "La nueva contraseña no puede ser igual a la anterior" });
      
    }
    console.log("hola")
    const hashedPassword = createHash(newPassword); 

    const userUpdate = await userDao.updatePassword(user._id, hashedPassword);
    if (!userUpdate) {
      return res.status(500).json({ error: "Error al actualizar la contraseña" });
    }

    
    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error(`Error al buscar al usuario o actualizar la contraseña: ${error}`);
    return res.status(500).json({ error: "Error interno del servidor" });
  } */
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


async function recuperacionCorreo(req, res) {
  const { email } = req.body; // Suponiendo que el campo de correo electrónico se envía desde el formulario de login

  try {
    const usuario = await userDao.getUserByEmail(email);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    //generar token para expirar correo de reestablecimiento de pass
    
    const token = generateTokenRecovery({ email: usuario.email });
    if (!token) {
      return res.status(500).json({ message: 'Error al generar el token.' });
    }

    logger.info("token de recoverypass:" + token)
    // Construir el enlace de recuperación
    const recoveryLink = `http://localhost:8080/reset_password/${token}`;

    // Contenido del email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de contraseña',
      text: `Hola ${usuario.nombre},\n\nPara restablecer tu contraseña, haz clic en el siguiente enlace:\n\n${recoveryLink}\n\nSi no solicitaste un cambio de contraseña, ignora este mensaje.`,
    };

    // Enviar el correo
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Hubo un error al enviar el correo.' });
      }
      return res.json({ message: 'Se ha enviado un enlace de recuperación a tu correo electrónico.' });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al procesar la solicitud.' });
  }
}

async function changeRol(req, res) {
  const { uid } = req.params;
  try {
    const user = await userDao.getUserById(uid)

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Cambiar el rol según la lógica deseada
    if (user.rol === "user") {
      user.rol = "premium";
    } else if (user.rol === "premium") {
      user.rol = "user";
    }

    const updatedUser = await user.save(); // Guardar el usuario con el nuevo rol

    res.json({ message: "Rol de usuario actualizado", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al cambiar el rol del usuario" });
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
  recuperacionCorreo,
  updatePasswordByEmail,
  changeRol,
};