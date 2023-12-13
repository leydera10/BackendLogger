const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



/* -El hashSync toma el password que le pasemos y procedera a aplicar un proseso de 
"hasheo de contraseña" desde un "Salt". 
-genSaltSync crea un salt de 10 caracteres(un Salt es un string random que hace que el proceso de
hasheo se realice de manera impredecible).
-Devuelve un string con el password hasheado !!! El proceso es irreversible !!! */

const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

/* 
compareSync tomara primero el password sin hashear y lo comparará con el password ya hasheado en la db
devolviendo " True o False" dependiendo de la comparacion de password  
*/
const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)


const PRIVATE_KEY = "coderJsonWebToken"

const generateToken = (user) => {
    const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: "24h" })
    return token
}


const authToken = (req, res, next) => {
  const autHeader = req.headers.authorization;
  const cookieToken = req.cookies.token; // Obtener el token de la cookie

  // Verificar si se encuentra el token en los encabezados o en las cookies
  const token = autHeader ? autHeader.split(" ")[1] : cookieToken;

  if (!token) {
    return res.status(401).send({
      error: "No autenticado"
    });
  }

  jwt.verify(token, PRIVATE_KEY, (error, credential) => {
    if (error) {
      console.error('Error al verificar el token:', error);
      return res.status(403).send({ error: "No autorizado" });
    }
    req.user = credential.user;
    next();
  });
};



module.exports = {
  createHash,
  isValidPassword,
  generateToken,
  authToken,
  PRIVATE_KEY,
};
