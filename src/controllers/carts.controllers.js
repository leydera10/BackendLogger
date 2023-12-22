const CartDao = require("../dao/mongo/carts.mongo");
const ProductDao = require("../dao/mongo/products.mongo");
const mongoose = require("mongoose")
const { ticketModel } = require("../dao/mongo/models/tickets.model.js");
const { AddProductToCart } = require("../Errors/customErrors.js");
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const {PRIVATE_KEY} = require("../utils.js");
const jwt = require("jsonwebtoken")
const { getUserByEmail } = require("./users.controllers.js");
const {userDao} = require("./users.controllers.js")// verificar si es necesario
const logger = require("../logger.js");




//se instancia la clase del carrito 
const cartDao = new CartDao();
const productDao = new ProductDao()  


// funcion para obtener un carrito especifico segun id 


/* async function getCartById(req, res) {
    try {
        const cartId = req.params.cid;
        console.log(cartId)
        const cart = await cartDao.getCartById(cartId);
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }
        return res.render("cartDetail", { cart }); // renderizar la vista con los datos del carrito
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", error: "tenemos un 33-12" });
    }
} */



//INCOMPLETOOOOruta para sacar el id del carrito del usuario para usar con el boton micarrito INCOMPLETOOOO
async function getUserCart(req, res) {
    try {
        const userEmail = req.user.email;

        // Buscar al usuario en la base de datos usando el correo electrónico
        const user = await getUserByEmail(userEmail);

        if (!user) {
            logger.warn("Usuario no encontrado");
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar si el cartId es un ObjectId válido
        const isValidObjectId = mongoose.Types.ObjectId.isValid(user.cartId);
        if (!isValidObjectId) {
            logger.error("ID de carrito no válido");
            return res.status(400).json({ message: "ID de carrito no válido" });
        }

        // Continuar con la búsqueda del carrito utilizando el ID obtenido
        const cart = await cartDao.getCartById(user.cartId);

        if (!cart) {
            logger.warn("Carrito no encontrado");
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        logger.info("Carrito encontrado:", cart);
        return res.status(200).json({ cartId: user.cartId }); // Devolver el ID del carrito
    } catch (error) {
        logger.error("Error al obtener el carrito del usuario:", error);
        console.error("Error al obtener el carrito del usuario:", error);
        return res.status(500).json({ message: "Error al obtener el carrito del usuario." });
    }
}


// funcion para obtener todos los carritos
async function getAllCarts(req, res) {
    // try catch pa manejo de errores
    try {
        // se guarda en la constante de nombre carts todos los carritos de la base de datos con la funcion getallcarts
        const carts = await cartDao.getAllCarts(); 
        // se aplica una condicional donde: si !NO se encuentran los carritos retorna un error y se corta la condicion con el mismo return 
        if (!carts) {
            logger.warn("No se encontraron carritos");
            return res.status(404).json({ message: "No se encontraron carritos" });
        }
        // de lo contrario muestra todos los carritos
        logger.info("Carritos encontrados:", carts);
        return res.json(carts);
    } catch (error) {
        //si nada funciona se muestra el error maximo
        logger.error("Error al obtener los carritos:", error);
        console.error(error);
        return res.status(500).json({ status: "error", error: "tenemos un 33-12" });
    }
}

//funcion para crear un carrito
async function createCart(req, res) {
    try {
        const newCart = req.body;
        const cart = await cartDao.createCart(newCart);
        if (!cart) {
            return res.status(500).json({ message: "Error al crear el carrito" });
        }
        return res.json({ message: "Carrito creado", cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", error: "tenemos un 33-12" });
    }
}

// funcion para añadir productos a un carrito especifico
async function isvalidcart(cart){
    
    // primero valida que cart exista en la bd
    const cartBd = await cartDao.getCartById(cart)
    if(!cartBd){
        return false
    }
    return true
   
}

async function isValidCartId(id){
    if(typeof id !== "string"){
        return false;
    }
    return true;
}

//FUNCION PARA AGREGAR VARIOS PRODUCTOS AL CARRITO 
async function addProductsToCart(req, res) {
    try {
        const cartId = req.params.cid;
        const products = req.body; // Espera un array de productos
        const user = req.user; //obtiene info del usuario autenticado

        // Verifica si products es un array y no está vacío
        if (!Array.isArray(products) || products.length === 0) {
            logger.warn("Formato de productos no válido");
            return res.status(400).json({ message: "Formato de productos no válido" });
        }

        // Valida el ID del carrito
        if (!(await isValidCartId(cartId))) {
            logger.error("ID de carrito no válido");
            throw new AddProductToCart("ID de carrito no válido", 400);
        }

        // Valida si el carrito existe
        if (!(await isvalidcart(cartId))) {
            logger.error("El carrito no existe");
            throw new AddProductToCart("El carrito no existe", 404);
        }

        // Verifica cada producto del array
        for (const product of products) {
            const { productId, quantity } = product;
            if (quantity < 1) {
                logger.error("La cantidad debe ser 1 o más");
                throw new AddProductToCart("La cantidad debe ser 1 o más", 400);
            }

            // Verifica si el usuario es premium y es propietario del producto
            const productInfo = await productDao.getProductById(productId);
            if (user.rol === "premium" && productInfo.owner === user.email) {
                logger.error("No puedes agregar tus propios productos al carrito");
                throw new AddProductToCart("No puedes agregar tus propios productos al carrito", 403);
            }
        }

        // Llama a la función de DAO para agregar productos al carrito
        const result = await cartDao.addProductsToCart(cartId, products);
        return res.json(result);
    } catch (error) {
        if (error instanceof AddProductToCart) {
            console.error("Error al agregar productos al carrito:", error.message);
            return res.status(error.statusCode).json({ status: 'error', error: error.message });
        } else {
            logger.error("Algo salio mal, intenta mas tarde:", error);
            console.error(error);
            return res.status(500).json({ status: "error", error: "Algo salio mal, intenta mas tarde:" });
        }
    }
}


//para agregar un solo producto al carrito
/* async function addProductToCart(req, res) {
    try {
        // en la logica se obtiene el id del carrito + id del producto especifico y se agrega el producto al carrito si todo funciona bien 
        const cartId = req.params.cid;
        const productIds = req.body.productIds;
        const result = await cartDao.addProductToCart(cartId, productIds);
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", error: "tenemos un 33-12" });
    }
} */

// contador (cantidad) de un producto en un carrito
async function updateProductQuantity(req, res) {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const newQuantity = req.body.quantity;
        const result = await cartDao.updateProductQuantity(cartId, productId, newQuantity);
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", error: "tenemos un 33-12" });
    }
}

// borrar un carrito especifico
async function deleteCartById(req, res) {
    try {
        const cartId = req.params.id;
        const result = await cartDao.deleteCartById(cartId);
        logger.info(`Carrito con ID ${cartId} eliminado exitosamente`);
        return res.json(result);
    } catch (error) {
        logger.error("Error al eliminar el carrito:", error);
        console.error(error);
        return res.status(500).json({ error: "Algo salió mal al eliminar el carrito" });
    }
}

// limpiar un carrito especifico segun id (del carrito)
async function deleteAllProductsInCart(req, res) {
    try {
        const cartId = req.params.cid;
        const result = await cartDao.deleteAllProductsInCart(cartId);
        logger.info(`Todos los productos del carrito con ID ${cartId} fueron eliminados`);
        return res.json(result);
    } catch (error) {
        logger.error("Error al eliminar los productos del carrito:", error);
        console.error(error);
        return res.status(500).json({ error: "Algo salió mal al eliminar los productos del carrito" });
    }
}

// eliminar un producto especifico de un carrito especifico (id de carrito / id de producto)
async function deleteProductFromCart(req, res) {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const result = await cartDao.deleteProductFromCart(cartId, productId);
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Algo salió mal al eliminar el producto del carrito" });
    }
}

// funcion para generar un codigo aleatorio
function generateUniqueCode() {
    return uuidv4();
}

//completar compra del carrito
async function purchaseProducts(req, res) {
    const cartId = req.params.cid;
    const userEmail = req.user.email;

    try {
        // Lógica para obtener los productos del carrito...
        const cartProducts = await cartDao.getCartProducts(cartId); // Función para obtener los productos del carrito
        
        // Verificar el stock de cada producto en el carrito en la base de datos
        const stock = await cartDao.checkStock(cartProducts);

        if (stock && stock.success === false) {
            return res.status(400).json({ message: stock.message });
        }

        // Calcular el total de todos los productos
        const total = calculateTotal(cartProducts);
        const currentDate = new Date();
        // Crear un ticket único con el total y otras características
        const ticketData = {
            code: generateUniqueCode(),
            purchaser: userEmail,
            amount: total,
            products: cartProducts, // Aquí irían los productos del carrito
            purchase_datetime: currentDate, 
            
        };

        // Guardar el ticket en la base de datos usando el DAO
        const createdTicket = await cartDao.createTicket(ticketData);

        if(createdTicket){
            await cartDao.deleteAllProductsInCart(cartId);
        }

        logger.info(`Compra exitosa de productos del carrito con ID ${cartId} por el usuario ${userEmail}`);
        return res.status(200).json({ ticket: createdTicket });
    } catch (error) {
        logger.error("Error al comprar productos del carrito:", error);
        console.error("Error al comprar productos del carrito:", error);
        return res.status(500).json({ message: 'Error al comprar productos del carrito.' });
    }
}

function calculateTotal(cartProducts) {
    let total = 0;
    for (const product of cartProducts) {
        // Suponiendo que cada producto tiene un campo de 'price'
        total += product.price * product.quantity;
    }
    return total;
}

module.exports = {
    /* getCartById, */
    getAllCarts,
    createCart,
    addProductsToCart,
    updateProductQuantity,
    deleteCartById,
    deleteAllProductsInCart,
    deleteProductFromCart,
    purchaseProducts,
    getUserCart,
};




//FUNCION PARA AGREGAR VARIOS PRODUCTOS AL CARRITO (respaldo)
/* async function addProductsToCart(req, res) {
    try {
        const cartId = req.params.cid;
        const products = req.body; // Espera un array de productos

        // Verifica si products es un array y no está vacío
        if (!Array.isArray(products) || products.length === 0) {
            logger.warn("Formato de productos no válido");
            return res.status(400).json({ message: "Formato de productos no válido" });
        }

        // Valida el ID del carrito
        if (!(await isValidCartId(cartId))) {
            logger.error("ID de carrito no válido");
            throw new AddProductToCart("ID de carrito no válido", 400);
        }

        // Valida si el carrito existe
        if (!(await isvalidcart(cartId))) {
            logger.error("El carrito no existe");
            throw new AddProductToCart("El carrito no existe", 404);
        }

        // Verifica cada producto del array
        for (const product of products) {
            const { productId, quantity } = product;
            if (quantity < 1) {
                logger.error("La cantidad debe ser 1 o más");
                throw new AddProductToCart("La cantidad debe ser 1 o más", 400);
            }
        }

        // Llama a la función de DAO para agregar productos al carrito
        const result = await cartDao.addProductsToCart(cartId, products);
        return res.json(result);
    } catch (error) {
        if (error instanceof AddProductToCart) {
            console.error('Error al agregar productos al carrito:', error.message);
            return res.status(error.statusCode).json({ status: 'error', error: error.message });
        } else {
            logger.error("Algo salió mal, intenta más tarde:", error);
            console.error(error);
            return res.status(500).json({ status: 'error', error: 'Algo salió mal, intenta más tarde' });
        }
    }
} */