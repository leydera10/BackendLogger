const express = require("express");
const path = require("path");
const cartRouter = require("./routes/cartRouter");
const productsRouter = require("./routes/productRouter.js");
const vistaRouter = require("./routes/vistaRouter.js");
const userRouter = require("./routes/usersRouter.js");
const sessionRouter = require("./routes/sessionsRouter.js");
const { router: mailRouter, transporter } = require("./routes/mailRouter"); //revisar errores
const mockingproducts = require("./routes/mockingRouter.js")
const passporConfig = require("./config/passport.config.js");
const { isUtf8 } = require("buffer");
const fs = require("fs");
const socketIo = require("socket.io");
const {Server} = require("socket.io");
const http = require("http");
const handlebars = require('express-handlebars');
const { error } = require("console");
const {default: mongoose} = require("mongoose");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const passport = require("passport");
const fileStore = require("session-file-store");
const { initializePassport, checkRole } = require("./config/passport.config");
const GitHubStrategy = require("passport-github2");
const cookieParser = require("cookie-parser"); //revisar si funciona
const { Contacts, Users, Carts, Products } = require("./dao/factory");
const loggerMiddleware = require("./loggerMiddleware.js");
const swaggerUiExpress = require("swagger-ui-express")
const swaggerJsdoc = require("swagger-jsdoc")


const app = express()
const server = http.createServer(app)
const io = new Server(server)
global.io = io;
const PORT = 8080


//CONFIGURACION DE SWAGGER
const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'documentacion de API',
      description: 'API clase swagger',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Esquema de seguridad por defecto para JWT
      },
    ],
  },
  apis: [
    './src/docs/products/*.yaml', // Ruta válida usando wildcard
    './src/docs/carts/*.yaml', // Ruta válida usando wildcard
    // ...otras definiciones de rutas
  ],
};


const specs = swaggerJsdoc(swaggerOptions)
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs))



//MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());// revisar si funciona
app.use(loggerMiddleware);

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.emit('conexion-establecida', 'Conexión exitosa con el servidor de Socket.IO');
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});


server.listen(PORT, ()=>{
  console.log(`servidor corriendo en puerto ${PORT}`)
});

/* //CONFIGURACION CARPETA PUBLICA
app.use(express.static(path.join(__dirname, "public"))) */


//************************* Configuración del middleware de sesión con MongoD*************************
app.use(session({
  store: MongoStore.create({
    mongoUrl: "mongodb+srv://leiderasis30:M2UCwmWsQlIGwGKC@cluster0.f7btw4v.mongodb.net/?retryWrites=true&w=majority",
    mongoClient: mongoose.connection.getClient(), // Utiliza la conexión de mongoose
    ttl: 3500
  }),
  secret: "clavesecreta",
  resave: false,
  saveUninitialized: true
}));
//************************* End Configuración del middleware de sesión con MongoD ************************* 

//uso PASSPORT
initializePassport();

//RUTAS
app.use(passport.initialize())
app.use(passport.session());
app.use("/", cartRouter);
app.use("/", productsRouter); 
app.use("/", vistaRouter);
app.use("/", userRouter);
app.use("/", sessionRouter);
app.use("/", mailRouter);
app.use("/", mockingproducts);




//Configuración de handlebars
app.engine("handlebars", handlebars.engine());

//Usa handlebars como motor de plantillas
app.set("view engine", "handlebars");

//Usa la carpeta views como carpeta de vistas
app.set("views", __dirname + "/views");

//Archivos dentro de la carpeta public
app.use(express.static(path.join(__dirname, "public")));



module.exports = { app };






// funcion para actualizar el quantity de los productos
/* async function updateProductQuantity() {
    const products = await productModel.find({});
    for (const product of products) {
      if (!product.quantity) {
        product.quantity = 1; // O el valor predeterminado que desees
      }
    }
  
    await Promise.all(products.map(product => product.save()));
    console.log('Actualización de productos completa');
}
  
updateProductQuantity(); */