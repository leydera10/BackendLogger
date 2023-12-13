const passport = require("passport");
const GitHubStrategy = require("passport-github2");
const local =require("passport-local");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
/* const userService = require("../dao/models/users.model.js") */
const {userModel} = require("../dao/mongo/models/users.model.js")
const {PRIVATE_KEY, authToken} = require("../utils.js");
const UserDTO = require("../dao/DTOs/user.dto.js");



const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["token"];
  }
  return token;
};

const localStrategy = local.Strategy

const initializePassport = () => {
    

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser(async (email, done) => {
    try {
      const user = await userModel.findOne({ email });
      done(null, user);
    } catch (error) {
      return done(error);
    }
  });

  passport.use("github", new GitHubStrategy({
    clientID: "Iv1.cfbadf4e5f70394f",
    clientSecret: "5df93d67a137df7d60a1e1f5a753b078f3cfbe75" ,
    callbackURL: "http://localhost:4000/api/sessions/githubcallback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(profile)
      let user = await userModel.findOne({ email: profile._json.email })
      if (!user) {
        let newUser = {
          nombre: profile._json.name, 
          /* last_name: "", */
          email: profile._json.email,
          isGithubAuth: true
          /* password: "" */
        }
        
        /* console.log(profile._json.name); */
        let result = await userModel.create(newUser)
        done(null, result)
          
      }
      else {
        done(null, user)
      }
    } catch (error) {
      return done(error)
    }
      
  }))
  
  passport.use("jwt", new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PRIVATE_KEY, 
  }, (payload, done) => { 
    console.log('JWT Strategy - Payload:', payload);
    authToken(payload, (error, user) => {
      if (error) {
        return done(error, false);
      }
      if (user) {
        console.log('JWT Strategy - User:', user);
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  }));


  
  
  passport.use("current", new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: PRIVATE_KEY,
  }, async (payload, done) => {
    
    try {
      /* console.log('Current JWT Strategy - Payload:', payload); */
      const user = await userModel.findOne({ email: payload.user.email});
      /* console.log(user) */
      if (!user) {
        console.log("akiii")
        return done(null, false);
      }
      // Verificar si el usuario recuperado coincide con la estructura esperada en el DTO
      /* const userDTO = new UserDTO(user); */ // Crear un DTO a partir del usuario
      const userDTO = {
        email: user.email, // Asegúrate de incluir el email u otra información necesaria
        nombre: user.nombre, // Agrega el campo 'nombre' al objeto userDTO
        apellido: user.apellido,
        carrito: user.cartId,
        rol: user.rol,
      };
      /* console.log("por aqui pasa", userDTO); */
      /* console.log("token de passport", token)  */
      return done(null, userDTO); // Pasar el DTO al done
    } catch (err) {
      return done(err, false);
    }
  }));

  

};

// Middleware para verificar el rol
function checkRole(rol) {
  return function(req, res, next) {
    const user = req.user; // El objeto userDTO almacenado por Passport en req.user

    if (user && user.rol === rol) {
      // El usuario tiene el rol requerido, permitir acceso a la ruta
      next();
    } else {
      // Usuario no autorizado para acceder a esta ruta
      res.status(403).json({ message: 'No tienes permisos para acceder a esta ruta.' });
    }
  }  
}


module.exports = { initializePassport, checkRole };












/* // aqui se verifica la validez del token y se obtiene el usuario del payload si el token es válido
  passport.use("jwt", new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PRIVATE_KEY, 
  }, (payload, done) => { 
    console.log('JWT Strategy - Payload:', payload);
    // se busca el usuario en la base de datos por email (lleva el nombre email id )   
    userModel.findOne({ email: payload.sub }, (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        console.log('JWT Strategy - User:', user);
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })); */